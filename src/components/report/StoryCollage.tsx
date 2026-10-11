"use client";

import { useId, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { toPng } from "html-to-image";
import { Download, ImagePlus, Loader2, Plus, RotateCcw, Share2, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { PATTERNS } from "./Backdrop";
import { haptic } from "./extras";

/* ───────────── Story collage ─────────────
 * A 9:16 scrapbook-style story in the archetype's own palette and pattern. Four templates, each
 * with three photo frames pre-filled with the archetype's images; readers can swap in their own
 * photos (kept on the device only), drag to reposition, zoom, then save/share a 1080×1920 PNG.
 * Everything inside the card is sized in cqw so the preview and the export match at any width. */

export type CollageLayout = "scrapbook" | "dreamy" | "editorial" | "film";

const LAYOUTS: { key: CollageLayout; label: string; glyph: string }[] = [
  { key: "scrapbook", label: "Sổ tay", glyph: "✎" },
  { key: "dreamy", label: "Mộng mơ", glyph: "☾" },
  { key: "editorial", label: "Tạp chí", glyph: "❝" },
  { key: "film", label: "Cuộn phim", glyph: "▣" },
];

/** The template each archetype opens with (readers can switch). */
const DEFAULT_COLLAGE: Record<string, CollageLayout> = {
  jester: "scrapbook", creator: "scrapbook", everyman: "scrapbook", caregiver: "scrapbook",
  innocent: "dreamy", lover: "dreamy", magician: "dreamy",
  ruler: "editorial", sage: "editorial", rebel: "editorial",
  hero: "film", explorer: "film",
};

const SLOTS = 3;
const MAX_SIDE = 1200; // px — plenty for a frame in a 1080-wide story, keeps the export quick
const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number) => Math.max(0, Math.min(100, v));
/** Long Vietnamese names ("Người Bình Thường / Công Dân") step down a size so they stay on one line. */
const fit = (text: string, size: string, small: string) => (text.length > 24 ? small : size);

/** A reader photo in a frame: x/y is the focal point (object-position %), zoom scales around it. */
type Shot = { src: string; x: number; y: number; zoom: number };
type CardData = { english: string; name: string; population: number | null; powers: string[]; ornament: string; slug: string; today: string };
type SlotFn = (i: number, className?: string) => ReactNode;
type LayoutProps = { s: SlotFn; d: CardData };

const noopSubscribe = () => () => {};
const formatToday = () => {
  const t = new Date();
  return `${pad(t.getDate())}.${pad(t.getMonth() + 1)}.${t.getFullYear()}`;
};

/** Reads a picked file into a downscaled JPEG data URL (orientation is applied by the browser). */
function loadPhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * k);
      canvas.height = Math.round(img.naturalHeight * k);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

export function StoryCollage({
  english,
  name,
  population,
  powers,
  ornament,
  slug,
  photos,
}: {
  english: string;
  name: string;
  population: number | null;
  powers: string[];
  ornament: string;
  slug: string;
  photos: (string | null)[];
}) {
  const card = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const target = useRef(0);
  const drag = useRef<{ i: number; sx: number; sy: number; ox: number; oy: number; w: number; h: number; zoom: number } | null>(null);
  const moved = useRef(false);
  const [layout, setLayout] = useState<CollageLayout>(DEFAULT_COLLAGE[slug] ?? "scrapbook");
  const [shots, setShots] = useState<(Shot | null)[]>(() => Array(SLOTS).fill(null));
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState<"save" | "share" | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Client-only date (empty during SSR) so server and client markup always agree.
  const today = useSyncExternalStore(noopSubscribe, formatToday, () => "");

  const defaults = useMemo(() => {
    const pool = photos.filter((p): p is string => !!p);
    return Array.from({ length: SLOTS }, (_, i) => (pool.length ? pool[i % pool.length] : null));
  }, [photos]);
  const srcOf = (i: number) => shots[i]?.src ?? defaults[i];
  const selectedShot = shots[selected];

  const patch = (i: number, p: Partial<Shot>) => setShots((prev) => prev.map((s, k) => (k === i && s ? { ...s, ...p } : s)));
  const clearShot = (i: number) => setShots((prev) => prev.map((s, k) => (k === i ? null : s)));

  const openPicker = (i: number) => {
    target.current = i;
    fileInput.current?.click();
  };

  const onFiles = async (list: FileList | null) => {
    const files = [...(list ?? [])].slice(0, SLOTS);
    if (fileInput.current) fileInput.current.value = "";
    if (!files.length) return;
    setError(null);
    const start = target.current;
    try {
      const urls = await Promise.all(files.map(loadPhoto));
      setShots((prev) => {
        const next = [...prev];
        urls.forEach((src, k) => (next[(start + k) % SLOTS] = { src, x: 50, y: 50, zoom: 1 }));
        return next;
      });
      setSelected(start);
      haptic();
    } catch {
      setError("Không đọc được ảnh này, bạn thử ảnh JPG hoặc PNG khác nhé.");
    }
  };

  // Drag a reader photo to move its focal point; a tap without movement selects / picks a photo.
  const onDown = (e: ReactPointerEvent<HTMLDivElement>, i: number) => {
    moved.current = false;
    const shot = shots[i];
    if (!shot) return;
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = { i, sx: e.clientX, sy: e.clientY, ox: shot.x, oy: shot.y, w: r.width, h: r.height, zoom: shot.zoom };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g) return;
    const dx = e.clientX - g.sx;
    const dy = e.clientY - g.sy;
    if (!moved.current && Math.hypot(dx, dy) < 4) return;
    moved.current = true;
    const k = 140 / g.zoom;
    patch(g.i, { x: clamp(g.ox - (dx / g.w) * k), y: clamp(g.oy - (dy / g.h) * k) });
  };
  const onUp = () => {
    drag.current = null;
  };
  const onTap = (i: number) => {
    if (moved.current) {
      moved.current = false;
      return;
    }
    setSelected(i);
    haptic(8);
    if (!shots[i]) openPicker(i);
  };

  const slot: SlotFn = (i, className) => {
    const shot = shots[i];
    const src = srcOf(i);
    return (
      <div
        onPointerDown={(e) => onDown(e, i)}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClick={() => onTap(i)}
        className={cn("group/slot relative overflow-hidden bg-secondary", shot ? "cursor-grab touch-none active:cursor-grabbing" : "cursor-pointer", className)}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            draggable={false}
            className="pointer-events-none size-full object-cover select-none"
            style={shot ? { objectPosition: `${shot.x}% ${shot.y}%`, transform: `scale(${shot.zoom})`, transformOrigin: `${shot.x}% ${shot.y}%` } : undefined}
          />
        ) : (
          <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_25%,var(--card),var(--secondary))] text-[10cqw] text-primary/45">{ornament}</div>
        )}
        {shot && selected === i && <span data-no-export className="pointer-events-none absolute inset-0 rounded-[inherit] ring-[0.8cqw] ring-primary ring-inset" />}
        {!shot && (
          <span
            data-no-export
            className="pointer-events-none absolute bottom-[6%] left-1/2 grid size-[6cqw] -translate-x-1/2 place-items-center rounded-full bg-card/90 text-primary shadow-sm transition group-hover/slot:scale-110"
          >
            <Plus className="size-[3.4cqw]" strokeWidth={2.5} />
          </span>
        )}
      </div>
    );
  };

  const d: CardData = { english, name, population, powers: powers.slice(0, 2), ornament, slug, today };
  const Layout = { scrapbook: Scrapbook, dreamy: Dreamy, editorial: Editorial, film: Film }[layout];

  const render = async () => {
    const node = card.current!;
    await document.fonts?.ready;
    const opts = {
      // Always exactly 1080×1920, whatever width the preview has on this screen.
      pixelRatio: 1,
      canvasWidth: 1080,
      canvasHeight: 1920,
      // Square, shadow-free edges in the exported story (rounded corners are only for the preview).
      style: { borderRadius: "0", boxShadow: "none" },
      filter: (n: HTMLElement) => !(n instanceof HTMLElement && n.dataset.noExport !== undefined),
    };
    // Safari paints images blank on the first pass while it decodes them; a warm-up render fixes it.
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) await toPng(node, opts);
    return toPng(node, opts);
  };

  const save = async () => {
    haptic();
    setBusy("save");
    setError(null);
    try {
      const url = await render();
      const a = document.createElement("a");
      a.href = url;
      a.download = `la-methode-${slug}-story.png`;
      a.click();
    } catch {
      setError("Chưa tạo được ảnh, bạn thử lại nhé.");
    } finally {
      setBusy(null);
    }
  };

  const share = async () => {
    haptic();
    setBusy("share");
    setError(null);
    try {
      const blob = await (await fetch(await render())).blob();
      const file = new File([blob], `la-methode-${slug}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: `Mình là ${english}` });
      else await save();
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") setError("Thiết bị chưa hỗ trợ chia sẻ trực tiếp — hãy dùng nút Lưu ảnh.");
    } finally {
      setBusy(null);
    }
  };

  const firstEmpty = shots.findIndex((s) => !s);

  return (
    <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-center md:gap-14">
      <div
        ref={card}
        className="@container relative aspect-[9/16] w-[min(82vw,340px)] shrink-0 overflow-hidden rounded-[1.75rem] text-foreground shadow-[0_24px_50px_-24px_rgba(60,40,30,0.45)] select-none"
      >
        <div key={layout} className="collage-in absolute inset-0">
          <Layout s={slot} d={d} />
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center md:items-start md:text-left">
        <div>
          <p className="text-[11px] font-medium tracking-[0.28em] text-primary uppercase">Thẻ story của bạn</p>
          <h3 className="report-display mt-2 text-3xl leading-tight">Ghép ảnh &amp; khoe hào quang của bạn</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Chọn mẫu, ghép tối đa 3 ảnh của bạn — ảnh dọc 1080×1920 vừa khít story Instagram, Facebook, TikTok.</p>
        </div>

        <div className="w-full text-left">
          <p className="mb-2 text-[11px] font-medium tracking-[0.24em] text-muted-foreground uppercase">1 · Chọn mẫu</p>
          <div className="grid grid-cols-4 gap-2">
            {LAYOUTS.map((l) => (
              <button
                key={l.key}
                type="button"
                aria-pressed={layout === l.key}
                onClick={() => {
                  setLayout(l.key);
                  haptic(8);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 text-[11px] font-medium transition active:scale-95",
                  layout === l.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50",
                )}
              >
                <span className="text-lg leading-none">{l.glyph}</span>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <div className="w-full rounded-2xl border border-dashed border-primary/40 bg-card/70 p-4 text-left">
          <p className="mb-3 text-[11px] font-medium tracking-[0.24em] text-muted-foreground uppercase">2 · Ghép ảnh của bạn</p>
          <div className="flex items-center gap-2.5">
            {Array.from({ length: SLOTS }, (_, i) => {
              const src = srcOf(i);
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Khung ảnh ${i + 1}`}
                  onClick={() => {
                    setSelected(i);
                    if (!shots[i]) openPicker(i);
                  }}
                  className={cn("relative size-14 shrink-0 overflow-hidden rounded-xl border-2 bg-secondary transition active:scale-95", selected === i && shots[i] ? "border-primary" : "border-transparent")}
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center text-xl text-primary/50">{ornament}</span>
                  )}
                  <span className="absolute top-0.5 left-0.5 grid size-4 place-items-center rounded-full bg-card text-[9px] font-semibold">{i + 1}</span>
                  {!shots[i] && (
                    <span className="absolute inset-0 grid place-items-center bg-card/45">
                      <Plus className="size-4 text-primary" strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => openPicker(firstEmpty < 0 ? selected : firstEmpty)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90 active:scale-95"
            >
              <ImagePlus className="size-4" /> Thêm ảnh
            </button>
          </div>

          {selectedShot ? (
            <div className="mt-4 space-y-2.5">
              <label className="flex items-center gap-3 text-xs text-muted-foreground">
                <ZoomIn className="size-4 shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={selectedShot.zoom}
                  onChange={(e) => patch(selected, { zoom: Number(e.target.value) })}
                  className="flex-1 accent-[var(--primary)]"
                  aria-label={`Phóng to ảnh khung ${selected + 1}`}
                />
              </label>
              <p className="text-[11px] text-muted-foreground">Kéo ảnh ngay trên thẻ để căn chỉnh khung {selected + 1}.</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <button type="button" onClick={() => openPicker(selected)} className="text-primary underline-offset-4 hover:underline">
                  Đổi ảnh khung {selected + 1}
                </button>
                <button type="button" onClick={() => clearShot(selected)} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  Bỏ ảnh này
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Chạm vào khung trên thẻ hoặc ô số để thay bằng ảnh của bạn. Ảnh chỉ nằm trên máy bạn, không tải lên đâu cả.
            </p>
          )}
          {shots.some(Boolean) && (
            <button
              type="button"
              onClick={() => setShots(Array(SLOTS).fill(null))}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <RotateCcw className="size-3" /> Dùng lại toàn bộ ảnh mặc định
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={!!busy}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            {busy === "save" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Lưu ảnh
          </button>
          <button
            type="button"
            onClick={share}
            disabled={!!busy}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm transition hover:border-foreground active:scale-95 disabled:opacity-60"
          >
            {busy === "share" ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />} Chia sẻ
          </button>
        </div>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/* ───────────── Decorations ───────────── */

const SHADOW = "shadow-[0_2.4cqw_5cqw_-2.4cqw_rgba(70,45,35,0.4)]";

function Sparkle({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("pointer-events-none absolute text-primary", className)} style={style}>
      <path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="currentColor" />
    </svg>
  );
}

/** Washi tape strip (striped, see-through, in the archetype colour). */
function Tape({ className }: { className?: string }) {
  return <span aria-hidden className={cn("deco-tape pointer-events-none absolute z-10 h-[5.5cqw] w-[22cqw]", className)} />;
}

const DOODLES = {
  squiggle: { vb: "0 0 60 16", d: "M2 9c5-9 9-9 14 0s9 9 14 0 9-9 14 0 9 9 14 0" },
  heart: { vb: "0 0 26 24", d: "M13 21C6 15 2 11.5 2 7.5A5.3 5.3 0 0 1 13 5a5.3 5.3 0 0 1 11 2.5C24 11.5 20 15 13 21Z" },
  arrow: { vb: "0 0 40 40", d: "M5 6c14-1 25 8 28 25M26 25l7 7 3-10" },
  route: { vb: "0 0 60 40", d: "M2 4c18 0 14 20 30 22s20-6 26 10" },
};
function Doodle({ kind, className, dashed }: { kind: keyof typeof DOODLES; className?: string; dashed?: boolean }) {
  const g = DOODLES[kind];
  return (
    <svg viewBox={g.vb} aria-hidden fill="none" className={cn("pointer-events-none absolute text-primary", className)}>
      <path d={g.d} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? "3 4" : undefined} />
    </svg>
  );
}

/** Starburst sticker shape. */
function Burst({ className }: { className?: string }) {
  const points = Array.from({ length: 28 }, (_, i) => {
    const r = i % 2 ? 41 : 50;
    const a = (i / 28) * Math.PI * 2;
    return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <polygon points={points} fill="currentColor" />
    </svg>
  );
}

/** Round badge with text running along its rim. */
function CircleText({ text, className, children }: { text: string; className?: string; children?: ReactNode }) {
  const id = `ct${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div aria-hidden className={cn("pointer-events-none absolute grid place-items-center rounded-full", className)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        <defs>
          <path id={id} d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0" />
        </defs>
        <text fontSize="8.4" fontWeight={600} fill="currentColor" letterSpacing="1.6">
          <textPath href={`#${id}`} textLength={236} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      {children}
    </div>
  );
}

/** Deterministic barcode (same on server and client). */
function Barcode({ seed, className }: { seed: string; className?: string }) {
  let h = 7;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const bars: [number, number][] = [];
  let x = 0;
  for (let i = 0; i < 30; i++) {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    const w = 1 + ((h >>> 16) % 3);
    bars.push([x, w]);
    x += w + 1 + ((h >>> 8) % 2);
  }
  return (
    <svg viewBox={`0 0 ${x} 20`} preserveAspectRatio="none" aria-hidden className={className}>
      {bars.map(([bx, w]) => (
        <rect key={bx} x={bx} width={w} height={20} fill="currentColor" />
      ))}
    </svg>
  );
}

/** The archetype's backdrop pattern, at a smaller scale. */
function PatternLayer({ slug, strength = 1.6 }: { slug: string; strength?: number }) {
  const p = PATTERNS[slug];
  if (!p) return null;
  const size = `${Math.round(p.size * 0.6)}px ${Math.round(p.size * 0.6)}px`;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-primary"
      style={{
        opacity: Math.min(0.3, p.opacity * strength),
        maskImage: p.image,
        WebkitMaskImage: p.image,
        maskSize: size,
        WebkitMaskSize: size,
        maskRepeat: "repeat",
        WebkitMaskRepeat: "repeat",
      }}
    />
  );
}

function Footer({ d, center }: { d: CardData; center?: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-x-[7cqw] bottom-[5.5cqw] flex items-center gap-[3cqw] text-[2.2cqw] font-medium tracking-[0.22em] uppercase",
        center ? "justify-center" : "justify-between",
      )}
    >
      <span className="text-primary">Khám phá nguyên mẫu của bạn</span>
      <span className="text-muted-foreground">
        {center ? d.ornament : `La Methode ${d.ornament}`}
      </span>
    </div>
  );
}

/* ───────────── Templates ───────────── */

/** Polaroids, washi tape, a round photo sticker and a starburst — like a journal page. */
function Scrapbook({ s, d }: LayoutProps) {
  const grid = "color-mix(in srgb, var(--primary) 9%, transparent)";
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(172deg,var(--secondary),var(--background)_48%,var(--card))]" />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`, backgroundSize: "6cqw 6cqw" }}
      />
      <PatternLayer slug={d.slug} />

      <header className="absolute inset-x-[7cqw] top-[6cqw] flex items-center justify-between">
        <span className="text-[2.5cqw] font-semibold tracking-[0.38em] text-muted-foreground uppercase">La Methode</span>
        <span className="rounded-full border border-primary/40 bg-card/70 px-[2.4cqw] py-[0.6cqw] text-[2.3cqw] tracking-[0.12em] text-primary">✦ {d.today || "hôm nay"}</span>
      </header>

      <div className={cn("absolute top-[15cqw] left-[7cqw] w-[56cqw] -rotate-[5deg] bg-card p-[2.6cqw] pb-[10cqw]", SHADOW)}>
        {s(0, "aspect-square w-full")}
        <span className="report-script absolute left-[4cqw] bottom-[2.4cqw] text-[5.6cqw] leading-none text-primary">chính là tôi</span>
        <Tape className="-top-[3cqw] left-1/2 -translate-x-1/2 -rotate-[4deg]" />
      </div>

      <div className={cn("absolute top-[42cqw] right-[6cqw] w-[38cqw] rotate-[6deg] bg-card p-[2cqw] pb-[7cqw]", SHADOW)}>
        {s(1, "aspect-[4/5] w-full")}
        <span className="absolute inset-x-0 bottom-[2.2cqw] text-center text-[2.2cqw] tracking-[0.24em] text-muted-foreground uppercase">khoảnh khắc</span>
        <Tape className="-top-[1.5cqw] -right-[6cqw] w-[18cqw] rotate-[38deg]" />
      </div>

      <div className={cn("absolute top-[80cqw] left-[9cqw] size-[28cqw] -rotate-[4deg] rounded-full border-[1.4cqw] border-card", SHADOW)}>
        {s(2, "size-full rounded-full")}
      </div>

      {d.population && (
        <div className="absolute top-[97cqw] right-[4cqw] grid size-[21cqw] rotate-[10deg] place-items-center text-center text-primary-foreground">
          <Burst className="absolute inset-0 size-full text-primary" />
          <span className="relative leading-none">
            <span className="block text-[1.9cqw] tracking-[0.2em] uppercase">Chỉ</span>
            <span className="report-display block text-[7cqw]">{d.population}%</span>
            <span className="block text-[1.9cqw]">dân số</span>
          </span>
        </div>
      )}

      <Sparkle className="top-[11cqw] left-[64cqw] w-[5cqw]" />
      <Sparkle className="top-[36cqw] right-[4cqw] w-[3cqw] opacity-70" />
      <Sparkle className="top-[104cqw] left-[38cqw] w-[3.4cqw] opacity-80" />
      <Doodle kind="heart" className="top-[84cqw] left-[39cqw] w-[7cqw] -rotate-12" />

      <div className="absolute inset-x-[7cqw] top-[113cqw]">
        <span className="inline-block -rotate-[2deg] bg-primary px-[2.4cqw] py-[0.9cqw] text-[2.3cqw] font-semibold tracking-[0.3em] text-primary-foreground uppercase">
          Nguyên mẫu của tôi
        </span>
        <p className="report-display mt-[2.6cqw] text-[11cqw] leading-[0.95]">{d.english}</p>
        <p className={cn("report-script mt-[1cqw] leading-tight text-primary", fit(d.name, "text-[6.2cqw]", "text-[4.6cqw]"))}>{d.name}</p>
        <Doodle kind="squiggle" className="relative! mt-[0.6cqw] block w-[18cqw]" />
        <div className="mt-[2.4cqw] flex flex-wrap gap-[1.6cqw]">
          {d.powers.map((p, i) => (
            <span key={p} className={cn("border border-dashed border-primary/45 bg-card/85 px-[2.4cqw] py-[1cqw] text-[2.6cqw] leading-snug", i % 2 ? "rotate-[1.5deg]" : "-rotate-[1deg]")}>
              ✦ {p}
            </span>
          ))}
        </div>
      </div>
      <Footer d={d} />
    </>
  );
}

const SPARKS: [number, number, number, number][] = [
  [9, 24, 4, 0.75], [87, 46, 3.2, 0.6], [12, 60, 2.6, 0.5], [82, 101, 4.2, 0.75],
  [7, 113, 3, 0.5], [90, 138, 2.8, 0.5], [47, 103, 2.4, 0.6], [31, 15, 2.2, 0.45],
];

/** Arch window with two oval photos, a rotating-text seal and a field of sparkles. */
function Dreamy({ s, d }: LayoutProps) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 70% at 50% 30%, var(--card) 0%, var(--secondary) 55%, color-mix(in srgb, var(--secondary) 62%, var(--primary)) 100%)" }}
      />
      <PatternLayer slug={d.slug} strength={1.2} />
      {SPARKS.map(([x, y, size, o], i) => (
        <Sparkle key={i} style={{ left: `${x}cqw`, top: `${y}cqw`, width: `${size}cqw`, opacity: o }} />
      ))}

      <header className="absolute inset-x-0 top-[6.5cqw] text-center">
        <p className="text-[2.5cqw] font-semibold tracking-[0.42em] text-muted-foreground uppercase">La Methode</p>
        <p className="report-script mt-[1cqw] text-[4.6cqw] leading-none text-primary">nguyên mẫu của tôi</p>
      </header>

      <div className="absolute top-[22cqw] left-1/2 w-[56cqw] -translate-x-1/2">
        <span aria-hidden className="absolute -inset-[2.6cqw] rounded-t-full rounded-b-[3.5cqw] border border-primary/55" />
        {s(0, cn("aspect-[3/4] w-full rounded-t-full rounded-b-[2cqw] border-[1.3cqw] border-card", SHADOW))}
      </div>
      <div className="absolute top-[72cqw] left-[4cqw] w-[27cqw] -rotate-[8deg]">
        {s(1, cn("aspect-[3/4] w-full rounded-full border-[1.2cqw] border-card", SHADOW))}
      </div>
      <div className="absolute top-[61cqw] right-[4cqw] w-[25cqw] rotate-[7deg]">
        {s(2, cn("aspect-square w-full rounded-full border-[1.2cqw] border-card", SHADOW))}
      </div>
      <CircleText text="LA METHODE ✦ NGUYÊN MẪU CỦA TÔI ✦ " className="top-[16cqw] right-[5cqw] size-[23cqw] bg-card/80 text-primary">
        <span className="grid size-[10cqw] place-items-center rounded-full bg-primary text-[4.6cqw] text-primary-foreground">{d.ornament}</span>
      </CircleText>

      <div className="absolute inset-x-[8cqw] top-[111cqw] text-center">
        <p className="report-display text-[11.5cqw] leading-[0.95]">{d.english}</p>
        <p className={cn("report-script mt-[1.2cqw] leading-tight text-primary", fit(d.name, "text-[6.8cqw]", "text-[4.8cqw]"))}>{d.name}</p>
        <p className="mt-[2cqw] flex items-center justify-center gap-[2cqw] text-[3cqw] text-primary">
          <span className="h-px w-[10cqw] bg-primary/50" />
          {d.ornament}
          <span className="h-px w-[10cqw] bg-primary/50" />
        </p>
        <div className="mt-[2cqw] flex flex-col items-center gap-[1.4cqw]">
          {d.powers.map((p) => (
            <span key={p} className="rounded-full bg-card/85 px-[3cqw] py-[1cqw] text-[2.6cqw] leading-snug shadow-sm">
              {p}
            </span>
          ))}
        </div>
        {d.population && <p className="mt-[2.4cqw] text-[2.5cqw] text-muted-foreground italic">chỉ khoảng {d.population}% dân số mang hào quang này</p>}
      </div>
      <Footer d={d} center />
    </>
  );
}

/** Magazine cover: masthead, cover photo with cover lines, inset photos and a barcode. */
function Editorial({ s, d }: LayoutProps) {
  return (
    <>
      <div className="absolute inset-0 bg-card" />
      <PatternLayer slug={d.slug} strength={0.8} />
      <div className="absolute inset-[3cqw] border border-primary/35" />

      <p className="report-display absolute inset-x-0 top-[6cqw] text-center text-[13cqw] leading-none tracking-[0.02em] text-primary uppercase">La Methode</p>
      <div className="absolute inset-x-[6cqw] top-[21cqw] flex items-center justify-between border-y border-foreground/20 py-[0.9cqw] text-[2.1cqw] tracking-[0.24em] text-muted-foreground uppercase">
        <span>Số đặc biệt</span>
        <span>{d.today}</span>
        <span>Nguyên mẫu</span>
      </div>

      <div className="absolute inset-x-[6cqw] top-[27cqw] h-[76cqw]">{s(0, "size-full")}</div>
      {d.population && (
        <div className="absolute top-[31cqw] left-[9cqw] bg-card/90 px-[2.6cqw] py-[1.6cqw] shadow-sm">
          <p className="text-[1.9cqw] tracking-[0.22em] text-muted-foreground uppercase">Hiếm có</p>
          <p className="report-display text-[8cqw] leading-none text-primary">{d.population}%</p>
          <p className="text-[1.9cqw] text-muted-foreground">dân số giống tôi</p>
        </div>
      )}
      <div className="absolute top-[31cqw] right-[9cqw] grid size-[16cqw] rotate-[12deg] place-items-center rounded-full bg-primary text-center text-[2.1cqw] leading-tight font-semibold tracking-[0.12em] text-primary-foreground uppercase shadow-md">
        <span>
          Độc
          <br />
          quyền
          <br />
          {d.ornament}
        </span>
      </div>

      <div className={cn("absolute top-[80cqw] right-[7cqw] w-[26cqw] rotate-[4deg] bg-card p-[1.2cqw]", SHADOW)}>{s(1, "aspect-[4/5] w-full")}</div>
      <div className={cn("absolute top-[91cqw] right-[31cqw] w-[19cqw] -rotate-[5deg] bg-card p-[1.2cqw]", SHADOW)}>{s(2, "aspect-square w-full")}</div>

      <div className="absolute inset-x-[7cqw] top-[118cqw]">
        <p className="text-[2.2cqw] font-semibold tracking-[0.3em] text-primary uppercase">Câu chuyện trang bìa</p>
        <p className="report-display mt-[1.4cqw] text-[9.5cqw] leading-[0.95]">{d.english}</p>
        <p className={cn("report-script mt-[1cqw] leading-tight text-primary italic", fit(d.name, "text-[5.8cqw]", "text-[4.4cqw]"))}>{d.name}</p>
        <ol className="mt-[2.4cqw] border-t border-foreground/15">
          {d.powers.map((p, i) => (
            <li key={p} className="flex gap-[2cqw] border-b border-foreground/15 py-[1.1cqw] text-[2.6cqw] leading-snug">
              <span className="report-display text-primary">{pad(i + 1)}</span>
              {p}
            </li>
          ))}
        </ol>
      </div>
      <div className="absolute inset-x-[7cqw] bottom-[5.5cqw] flex items-end justify-between gap-[3cqw]">
        <p className="text-[2.2cqw] leading-relaxed font-medium tracking-[0.2em] text-primary uppercase">
          Khám phá nguyên mẫu
          <br />
          của bạn {d.ornament}
        </p>
        <Barcode seed={d.slug} className="h-[6cqw] w-[20cqw] text-foreground/70" />
      </div>
    </>
  );
}

const SPROCKETS: CSSProperties = {
  backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 1.2cqw, var(--background) 1.2cqw 3.2cqw, transparent 3.2cqw 4.6cqw)",
};

/** Travel journal: a film strip of three frames, a one-way ticket "to yourself" and a passport stamp. */
function Film({ s, d }: LayoutProps) {
  const short = d.english.replace(/^The\s+/i, "");
  const rows: [string, string][] = [
    ["Nguyên mẫu", short],
    ["Hiếm gặp", d.population ? `${d.population}%` : "—"],
    ["Ngày", d.today || "—"],
    ["Cổng", d.ornament],
  ];
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--background),var(--secondary))]" />
      <PatternLayer slug={d.slug} />

      <header className="absolute inset-x-[7cqw] top-[6cqw] flex items-center justify-between text-[2.3cqw] tracking-[0.32em] uppercase">
        <span className="font-semibold text-muted-foreground">La Methode</span>
        <span className="text-primary">Nhật ký hành trình</span>
      </header>

      <div
        className={cn("absolute top-[14cqw] left-[6cqw] w-[44cqw] -rotate-[3deg] rounded-[1.2cqw] px-[5cqw] py-[3.4cqw]", SHADOW)}
        style={{ background: "color-mix(in srgb, var(--primary) 72%, var(--foreground))" }}
      >
        <span aria-hidden className="absolute inset-y-[1.4cqw] left-[1.3cqw] w-[2.2cqw]" style={SPROCKETS} />
        <span aria-hidden className="absolute inset-y-[1.4cqw] right-[1.3cqw] w-[2.2cqw]" style={SPROCKETS} />
        <div className="flex flex-col gap-[2.6cqw]">
          {[0, 1, 2].map((i) => (
            <div key={i}>{s(i, "aspect-[4/3] w-full rounded-[0.6cqw]")}</div>
          ))}
        </div>
      </div>

      <div className="absolute top-[17cqw] right-[5cqw] w-[41cqw] rotate-[4deg] drop-shadow-[0_1.6cqw_2cqw_rgba(70,45,35,0.25)]">
        <div className="card-ticket bg-card px-[4.4cqw] py-[3.6cqw]">
          <p className="text-[2cqw] font-semibold tracking-[0.3em] text-primary uppercase">Vé một chiều</p>
          <p className="mt-[2cqw] text-[1.8cqw] tracking-[0.2em] text-muted-foreground uppercase">Điểm đến</p>
          <p className="report-display text-[5.2cqw] leading-tight">Chính mình</p>
          <div className="my-[2.2cqw] border-t border-dashed border-primary/45" />
          <dl className="grid grid-cols-2 gap-x-[2cqw] gap-y-[1.6cqw]">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[1.6cqw] tracking-[0.18em] text-muted-foreground uppercase">{k}</dt>
                <dd className="truncate text-[2.7cqw] font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <Barcode seed={d.slug} className="mt-[2.6cqw] h-[5cqw] w-full text-foreground/70" />
        </div>
      </div>

      <Doodle kind="route" dashed className="top-[66cqw] right-[22cqw] w-[20cqw]" />
      <CircleText text="ĐÃ ĐẾN ✦ LA METHODE ✦ ĐÃ ĐẾN ✦ " className="top-[74cqw] right-[7cqw] size-[27cqw] -rotate-[14deg] border-[0.5cqw] border-primary/70 text-primary/85">
        <span className="grid size-[15cqw] place-items-center rounded-full border border-dashed border-primary/60">
          <span className="report-display text-[6cqw] leading-none">{d.ornament}</span>
        </span>
      </CircleText>
      <Sparkle className="top-[104cqw] left-[56cqw] w-[3.4cqw] opacity-80" />

      <div className="absolute inset-x-[7cqw] top-[110cqw]">
        <p className="report-script text-[5.2cqw] leading-none text-primary">hành trình của tôi —</p>
        <p className="report-display mt-[2cqw] text-[11.5cqw] leading-[0.95]">{d.english}</p>
        <p className={cn("report-script mt-[1cqw] leading-tight text-primary", fit(d.name, "text-[6.2cqw]", "text-[4.6cqw]"))}>{d.name}</p>
        <div className="mt-[3cqw] flex flex-wrap gap-[1.6cqw]">
          {d.powers.map((p) => (
            <span key={p} className="inline-flex items-center gap-[1.4cqw] rounded-full border border-primary/40 bg-card/85 py-[1cqw] pr-[2.6cqw] pl-[1.6cqw] text-[2.6cqw] leading-snug">
              <span className="size-[1.6cqw] shrink-0 rounded-full border border-primary/60" />
              {p}
            </span>
          ))}
        </div>
      </div>
      <Footer d={d} />
    </>
  );
}
