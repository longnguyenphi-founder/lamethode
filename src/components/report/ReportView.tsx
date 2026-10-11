import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, Home, RotateCcw, Sparkles } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { Marquee } from "@/components/ui/marquee";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";
import type { Archetype } from "@/lib/quiz/questions";
import { getSection, groupBlocks, type Block, type Report, type ReportImages, type SectionId } from "@/lib/report/content";
import { displayFont, scriptFont } from "@/lib/report/fonts";
import type { CardLook, DeckStyle, ReportTheme } from "@/lib/report/themes";
import { AmbientLayer, ReadingProgress } from "./client";
import { Carousel3D, ChapterScene, FlipGrid, FloatingOrb, HorizontalScene, StackScene, StickySplit } from "./scenes";
import { CheckMark, ChatScene, ChecklistScene, NotesBoard, SpotlightList, Staircase, SwipeDeck } from "./formats";
import Backdrop from "./Backdrop";
import { ChapterDock, IntroReveal } from "./extras";
import { StoryCollage } from "./StoryCollage";
import OrbLazy from "./OrbLazy";
import ReportMotion from "./ReportMotion";
import { ItemList, Paragraphs, RichText, SectionHeading, TipQuote, capitalize, cardClass, splitTitle } from "./primitives";

type Props = { report: Report; theme: ReportTheme; images: ReportImages; secondary: Archetype | null };
type SectionProps = { report: Report; theme: ReportTheme; images: ReportImages; index: number };
type Group = ReturnType<typeof groupBlocks>["groups"][number];

const items = (blocks: Block[]) => blocks.filter((b): b is Extract<Block, { type: "item" }> => b.type === "item");
const paras = (blocks: Block[]) => blocks.filter((b): b is Extract<Block, { type: "p" }> => b.type === "p");
const tips = (blocks: Block[]) => blocks.filter((b): b is Extract<Block, { type: "tip" }> => b.type === "tip");
const stripNumber = (t: string) => t.replace(/^(PHẦN\s*)?\d+[.:]\s*/i, "");
const pad = (n: number) => String(n).padStart(2, "0");

// Page order; the position feeds the "numbered"/"stamp" heading styles.
const ORDER: SectionId[] = [
  "portrait", "core", "love", "perception", "reactions", "strengths", "blindspots",
  "challenges", "growth", "relationships", "career", "journey", "advice",
];

const CHAPTERS = [
  { title: "Bạn là ai", kicker: "Những điều làm nên chính bạn — cả ánh sáng lẫn góc khuất." },
  { title: "Trái tim bạn", kicker: "Cách bạn yêu, và cách thế giới nhìn thấy bạn." },
  { title: "Khi giông bão", kicker: "Bạn phản ứng ra sao, mạnh ở đâu, và dễ vấp ở đâu." },
  { title: "Nở rộ", kicker: "Lộ trình để trở thành phiên bản rực rỡ nhất của bạn." },
  { title: "Lời thì thầm", kicker: "Điều mà trái tim bạn cần nghe nhất lúc này." },
];

export default function ReportView({ report, theme, images, secondary }: Props) {
  const p = theme.palette;
  // Scoped design tokens: every shadcn / Magic UI component on this page takes the archetype's palette.
  const rootStyle = {
    "--background": p.background,
    "--foreground": p.foreground,
    "--card": p.surface,
    "--card-foreground": p.foreground,
    "--popover": p.surface,
    "--popover-foreground": p.foreground,
    "--primary": p.accent,
    "--primary-foreground": p.accentForeground,
    "--secondary": p.accentSoft,
    "--secondary-foreground": p.foreground,
    "--muted": p.accentSoft,
    "--muted-foreground": p.muted,
    "--accent": p.accentSoft,
    "--accent-foreground": p.foreground,
    "--border": p.border,
    "--input": p.border,
    "--ring": p.accent,
    "--brand": p.accent,
    "--font-report-display": displayFont(theme.display),
    "--font-report-script": scriptFont(theme.script) ?? displayFont(theme.display),
    "--card-radius": theme.look.radius,
  } as CSSProperties;

  const n = (id: SectionId) => ORDER.indexOf(id) + 1;
  const sp = { report, theme, images };
  // Chapter tints alternate between the base and a soft wash of the accent.
  const tints = [0.45, 0.25, 0.6, 0.3, 0.5].map((t) => mix(p.background, p.accentSoft, t));
  const chapter = (i: number) => (
    <ChapterScene
      index={i}
      total={CHAPTERS.length}
      title={CHAPTERS[i].title}
      kicker={CHAPTERS[i].kicker}
      tint={tints[i]}
      baseTint={i === 0 ? p.background : tints[i - 1]}
      ornament={theme.ornament}
      ambient={theme.ambient}
    />
  );

  return (
    <div style={rootStyle} className="relative flex-1 overflow-x-clip bg-background font-sans text-foreground" data-archetype={report.slug}>
      <IntroReveal english={report.english} name={report.name} ornament={theme.ornament} />
      <ReportMotion />
      <ReadingProgress />
      <Backdrop slug={report.slug} />
      <FloatingOrb orb={theme.orb} />
      <div className="relative z-10">
        <TopBar report={report} />
        <Hero {...sp} />
        <TruthBand report={report} theme={theme} />
        {chapter(0)}
        <Celebrities report={report} theme={theme} />
        <PortraitSection {...sp} index={n("portrait")} />
        <CoreSection {...sp} index={n("core")} />
        {chapter(1)}
        <LoveSection {...sp} index={n("love")} />
        <PerceptionSection {...sp} index={n("perception")} />
        {chapter(2)}
        <ReactionsSection {...sp} index={n("reactions")} />
        <StrengthsSection {...sp} index={n("strengths")} />
        <BlindspotsSection {...sp} index={n("blindspots")} />
        <ChallengesSection {...sp} index={n("challenges")} />
        {chapter(3)}
        <GrowthSection {...sp} index={n("growth")} />
        <RelationshipsSection {...sp} index={n("relationships")} />
        <CareerSection {...sp} index={n("career")} />
        <JourneySection {...sp} index={n("journey")} />
        {chapter(4)}
        <AdviceSection {...sp} index={n("advice")} />
        <Closing report={report} theme={theme} images={images} secondary={secondary} />
      </div>
      <ChapterDock chapters={CHAPTERS.map((c) => c.title)} ornament={theme.ornament} />
    </div>
  );
}

/** Blends two #rrggbb colours (t = share of b). */
function mix(a: string, b: string, t: number) {
  const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/* ───────────────────────────── building blocks ───────────────────────────── */

function Section({ id, children, className, tinted }: { id: string; children: ReactNode; className?: string; tinted?: boolean }) {
  return (
    <section id={id} className={cn("relative scroll-mt-16 px-4 py-20 sm:px-6 sm:py-28 lg:py-32", tinted && "bg-secondary/45", className)}>
      <div className="relative mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/** The card used by every scene, shaped and decorated per archetype (CardLook). data-in children appear line by line. */
function DeckCard({
  theme,
  kicker,
  n,
  title,
  sub,
  children,
  className,
  compact,
}: {
  theme: ReportTheme;
  kicker: string;
  n?: number;
  title?: string | null;
  sub?: string | null;
  children?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const { look } = theme;
  return (
    <article
      data-spotlight
      className={cn(
        "spotlight relative h-full overflow-hidden rounded-[var(--card-radius)] border border-border bg-card",
        look.frame === "offset" ? "shadow-[7px_7px_0_0_var(--primary)]" : "shadow-[0_14px_32px_-18px_color-mix(in_srgb,var(--primary)_45%,transparent)]",
        look.frame === "ticket" && "card-ticket",
        compact ? "p-6 sm:p-7" : "p-6 sm:p-9",
        look.deco === "stripe" && "pl-8 sm:pl-11",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,color-mix(in_srgb,var(--secondary)_85%,transparent),transparent_55%)]" />
      <CardDeco deco={look.deco} ornament={theme.ornament} />
      <div data-in className="relative flex items-start justify-between gap-4">
        {kicker ? <p className="pt-1 text-[11px] font-medium tracking-[0.25em] text-primary uppercase">{kicker}</p> : <span />}
        {n !== undefined && <Numeral n={n} style={look.numeral} />}
      </div>
      {title && (
        <h3 data-in className={cn("report-display relative mt-3 leading-snug", compact ? "text-[clamp(1.25rem,3.8vw,1.6rem)]" : "text-[clamp(1.45rem,4.2vw,2.1rem)]")}>
          {title}
        </h3>
      )}
      {sub && <p data-in className="relative mt-1 text-sm text-primary italic">{sub}</p>}
      {children && (
        <div data-in className={cn("relative leading-relaxed text-muted-foreground", compact ? "mt-3 text-[14px] sm:text-[15px]" : "mt-4 text-[15px] sm:text-base")}>
          {children}
        </div>
      )}
    </article>
  );
}

function Numeral({ n, style }: { n: number; style: CardLook["numeral"] }) {
  if (style === "circle")
    return <span className="report-display grid size-11 shrink-0 place-items-center rounded-full bg-primary text-lg text-primary-foreground shadow-md">{pad(n)}</span>;
  if (style === "outline")
    return <span className="report-display text-5xl leading-none text-transparent opacity-70 [-webkit-text-stroke:1.2px_var(--primary)] sm:text-6xl">{pad(n)}</span>;
  return <span className="report-display text-5xl leading-none text-primary/25 sm:text-6xl">{pad(n)}</span>;
}

/** Decorative layer that gives each archetype's cards their own personality. */
function CardDeco({ deco, ornament }: { deco: CardLook["deco"]; ornament: string }) {
  const base = "pointer-events-none absolute";
  switch (deco) {
    case "petal":
      return (
        <span aria-hidden className={cn(base, "-right-4 -bottom-6 rotate-12 report-display text-[7rem] leading-none text-primary/12")}>
          {ornament}
        </span>
      );
    case "sprig":
      return (
        <svg aria-hidden viewBox="0 0 80 80" className={cn(base, "right-3 bottom-3 size-16 text-primary/35")}>
          <path d="M10 70 C 30 50, 45 35, 70 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {[[22, 56], [34, 44], [46, 32], [58, 21]].map(([x, y], i) => (
            <ellipse key={i} cx={x + (i % 2 ? 6 : -6)} cy={y - 4} rx="7" ry="3.5" transform={`rotate(${i % 2 ? -40 : 40} ${x} ${y})`} fill="currentColor" />
          ))}
        </svg>
      );
    case "lines":
      return (
        <>
          <span aria-hidden className={cn(base, "deco-lines inset-0 opacity-70")} />
          <span aria-hidden className={cn(base, "top-0 right-20 h-14 w-5 bg-primary/80 [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]")} />
        </>
      );
    case "seal":
      return (
        <span
          aria-hidden
          className={cn(base, "right-5 bottom-5 grid size-14 -rotate-12 place-items-center rounded-full bg-primary text-xl text-primary-foreground shadow-[inset_0_-4px_8px_rgba(0,0,0,0.22),0_6px_14px_-4px_rgba(0,0,0,0.25)]")}
        >
          ♥
        </span>
      );
    case "double":
      return (
        <>
          <span aria-hidden className={cn(base, "inset-2 rounded-[calc(var(--card-radius)-0.1rem)] border border-primary/45")} />
          <span aria-hidden className={cn(base, "top-1/2 left-0.5 size-2 -translate-y-1/2 rotate-45 bg-primary")} />
          <span aria-hidden className={cn(base, "top-1/2 right-0.5 size-2 -translate-y-1/2 rotate-45 bg-primary")} />
        </>
      );
    case "stars":
      return (
        <>
          <span aria-hidden className={cn(base, "inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--primary),#f5c8e8,transparent)]")} />
          {[[14, 18, 0], [26, 70, 1.2], [8, 86, 2.1]].map(([t, l, d], i) => (
            <span key={i} aria-hidden className="amb-star" style={{ top: `${t}%`, left: `${l}%`, animationDuration: "3.2s", animationDelay: `-${d}s` }} />
          ))}
        </>
      );
    case "tape":
      return <span aria-hidden className={cn(base, "deco-tape top-0 left-1/2 h-6 w-28 -translate-x-1/2 -rotate-3")} />;
    case "stripe":
      return <span aria-hidden className={cn(base, "inset-y-0 left-0 w-2 bg-[linear-gradient(var(--primary),color-mix(in_srgb,var(--primary)_40%,var(--secondary)))]")} />;
    case "scribble":
      return (
        <svg aria-hidden viewBox="0 0 120 40" className={cn(base, "right-4 bottom-3 w-28 text-primary/55")}>
          <path d="M4 26 C 20 6, 34 36, 50 18 S 80 6, 92 24 S 112 30, 116 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M100 6 l8 8 M108 6 l-8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case "paint":
      return (
        <>
          <span aria-hidden className={cn(base, "-right-10 -bottom-10 size-40 rounded-[42%_58%_63%_37%/41%_44%_56%_59%] bg-primary/18")} />
          <span aria-hidden className={cn(base, "right-24 bottom-6 size-3 rounded-full bg-primary/30")} />
          <span aria-hidden className={cn(base, "right-16 bottom-14 size-2 rounded-full bg-[color-mix(in_srgb,var(--secondary)_70%,var(--primary))]")} />
        </>
      );
    case "stitch":
      return <span aria-hidden className={cn(base, "inset-2.5 rounded-[calc(var(--card-radius)-0.4rem)] border border-dashed border-primary/40")} />;
    case "stamp":
      return (
        <span aria-hidden className={cn(base, "right-4 bottom-4 grid size-16 -rotate-12 place-items-center rounded-full border-2 border-dashed border-primary/45 text-xl text-primary/55")}>
          {ornament}
        </span>
      );
  }
}

type CardSpec = { kicker: string; title?: string | null; sub?: string | null; body: ReactNode; group: number; note?: boolean };

/**
 * Flattens sub-sections into one card per idea: the group's opening paragraph becomes a cover card,
 * each item its own card, and any closing paragraph or tip a "ghi nhớ" card — nothing is dropped.
 */
function groupSpecs(groups: Group[], kickerOf: (title: string, icon: string | null, gi: number) => string): CardSpec[] {
  const specs: CardSpec[] = [];
  groups.forEach((g, gi) => {
    const [title, sub] = splitTitle(stripNumber(g.sub.title));
    const full = kickerOf(title, g.sub.icon, gi);
    // The group label shows once, on its first card; the rest keep only its icon (if any) so the
    // same words are not stamped on every card of the group.
    const lead = full.split(" ")[0];
    const short = /\p{L}/u.test(lead) ? "" : lead;
    let first = true;
    const kickerNext = () => {
      const k = first ? full : short;
      first = false;
      return k;
    };
    let seenItem = false;
    let cover = false;
    for (const b of g.blocks) {
      if (b.type === "item") {
        seenItem = true;
        specs.push({ kicker: kickerNext(), title: b.title, body: <RichText text={b.text} />, group: gi });
      } else if (b.type === "p" && !seenItem && !cover) {
        cover = true;
        specs.push({ kicker: kickerNext(), title, sub, body: <RichText text={capitalize(b.text)} />, group: gi });
      } else if (b.type === "p") {
        // Closing tips are rendered once by each section (TipQuote) — never as a card too.
        specs.push({
          kicker: short ? `${short} Ghi nhớ` : "Ghi nhớ",
          body: <span className="report-display text-[clamp(1.15rem,3.6vw,1.5rem)] leading-snug text-foreground"><RichText text={b.text} /></span>,
          group: gi,
          note: true,
        });
      }
    }
  });
  return specs;
}

const renderSpecs = (specs: CardSpec[], theme: ReportTheme, compact?: boolean) =>
  specs.map((c, i) => (
    <DeckCard
      key={i}
      theme={theme}
      kicker={c.kicker}
      n={c.note ? undefined : i + 1}
      title={c.title}
      sub={c.sub}
      compact={compact}
      // Opaque tint: stacked cards must never show the ones beneath through them.
      className={cn(c.note && "bg-[color-mix(in_srgb,var(--secondary)_65%,var(--card))]")}
    >
      {c.body}
    </DeckCard>
  ));

/** Heading + lead in the normal flow, then the pinned card deck. */
function DeckSection({
  id,
  theme,
  index,
  title,
  lead,
  label,
  variant,
  tinted,
  children,
  after,
}: {
  id: string;
  theme: ReportTheme;
  index: number;
  title: string;
  lead?: Block[];
  label: string;
  variant: DeckStyle;
  tinted?: boolean;
  children: ReactNode;
  after?: ReactNode;
}) {
  return (
    <section id={id} className={cn("relative scroll-mt-16", tinted && "bg-secondary/45")}>
      <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 sm:pt-28">
        <SectionHeading theme={theme} index={index} title={title} />
        {lead && lead.length > 0 && (
          <div data-reveal>
            <Paragraphs blocks={lead} className="max-w-3xl" />
          </div>
        )}
      </div>
      <StackScene label={label} variant={variant}>
        {children}
      </StackScene>
      {after && <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">{after}</div>}
    </section>
  );
}

function Media({
  src,
  alt,
  theme,
  className,
  rounded = "rounded-[2rem]",
  label,
}: {
  src: string | null;
  alt: string;
  theme: ReportTheme;
  className?: string;
  rounded?: string;
  label?: string;
}) {
  return (
    <div data-tilt className={cn("relative will-change-transform", className)}>
      <div data-clip className={cn("relative size-full overflow-hidden", rounded)}>
        <div data-media className="size-full will-change-transform">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt} loading="lazy" className="size-full object-cover" />
          ) : (
            <div role="img" aria-label={alt} className="amb-placeholder relative grid size-full place-items-center">
              <span className="report-display text-7xl text-primary/45 sm:text-8xl">{theme.ornament}</span>
              {label && (
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-card/70 px-3 py-1 text-[10px] tracking-[0.2em] text-muted-foreground uppercase backdrop-blur">
                  {label}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ theme, className, children, beam }: { theme: ReportTheme; className?: string; children: React.ReactNode; beam?: number }) {
  return (
    <article data-reveal data-spotlight className={cn(cardClass(theme.card), "spotlight relative overflow-hidden", className)}>
      {children}
      {beam !== undefined && <BorderBeam size={120} duration={10} delay={beam} />}
    </article>
  );
}

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[11px] font-medium tracking-[0.28em] text-primary uppercase", className)}>{children}</p>;
}

/* ───────────────────────────── chrome ───────────────────────────── */

function TopBar({ report }: { report: Report }) {
  return (
    <div className="absolute inset-x-0 top-0 z-30 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between text-[11px] tracking-[0.2em] uppercase">
        <Link href="/" className="flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-2 backdrop-blur transition hover:bg-card" aria-label="Về trang chủ">
          <Home className="size-3.5" />
          <span className="hidden sm:inline">La Methode</span>
        </Link>
        <span className="rounded-full border border-border/60 bg-card/70 px-3 py-2 text-muted-foreground backdrop-blur">{report.english}</span>
      </div>
    </div>
  );
}

/* ───────────────────────────── hero ───────────────────────────── */

function Hero({ report, theme, images }: Omit<SectionProps, "index">) {
  const words = report.english.split(" ");
  const title = theme.uppercaseTitle ? report.english.toUpperCase() : report.english;
  const lead = report.intro[0] ?? "";

  // Main visual: the generated portrait when available, otherwise the archetype's live 3D object.
  const visual = images.hero ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={images.hero} alt={`${report.english} — chân dung`} className="size-full object-cover" />
  ) : (
    <div className="relative size-full">
      <div className="amb-mesh rounded-full" aria-hidden />
      <OrbLazy {...theme.orb} />
    </div>
  );
  // Floating 3D accent beside a photo: the generated symbol, or the live object.
  const accent = images.hero ? (
    images.symbol ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={images.symbol} alt="" aria-hidden className="size-full object-contain drop-shadow-2xl" />
    ) : (
      <OrbLazy {...theme.orb} />
    )
  ) : null;

  const scriptName = (
    <p className={cn("report-script text-primary", theme.script ? "text-[clamp(2.2rem,8vw,3.6rem)] leading-tight" : "text-[clamp(1.4rem,5vw,2rem)] italic")}>
      {report.name}
    </p>
  );
  const meta = (
    <div className="flex flex-wrap items-center gap-3">
      {report.population && (
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-primary" /> Khoảng <strong className="text-foreground">{report.population}%</strong> dân số giống bạn
        </span>
      )}
      <a href="#truth" className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-xs tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground">
        Cuộn để khám phá <ArrowDown className="size-3.5 animate-bounce" />
      </a>
    </div>
  );
  const leadText = (
    <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
      <RichText text={lead} />
    </p>
  );
  const eyebrow = <Eyebrow className="text-muted-foreground">Báo cáo nguyên mẫu · La Methode</Eyebrow>;

  const base = "relative flex min-h-[100svh] items-center overflow-hidden px-4 pt-24 pb-14 sm:px-6";

  if (theme.hero === "centered" || theme.hero === "framed") {
    const framed = theme.hero === "framed";
    return (
      <section data-hero className={base}>
        <AmbientLayer variant={theme.ambient} />
        <div className={cn("relative mx-auto w-full max-w-5xl text-center", framed && "border border-primary/35 p-2")}>
          <div className={cn(framed && "border border-primary/25 px-4 py-10 sm:px-12")}>
            <div data-hero-title className="flex flex-col items-center gap-4">
              {framed && <p className="text-2xl text-primary" aria-hidden>{theme.ornament}</p>}
              {eyebrow}
              <h1 className={cn("report-display text-[clamp(3rem,13vw,7.5rem)] leading-[0.95] text-balance", framed && "tracking-[0.08em]")}>{title}</h1>
              {scriptName}
            </div>
            <div data-hero-media className={cn("relative mx-auto mt-6 aspect-square w-[min(78vw,420px)]", images.hero && "aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem]")}>
              {visual}
            </div>
            {accent && <div className="absolute top-1/2 right-0 size-28 sm:right-8 sm:size-40" data-parallax="0.5">{accent}</div>}
            <div data-hero-title className="mt-8 flex flex-col items-center gap-6">
              <div className="mx-auto">{leadText}</div>
              {meta}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (theme.hero === "fullbleed") {
    return (
      <section data-hero className={cn(base, "items-end")}>
        <div data-hero-media className="absolute inset-0">
          {images.hero ? visual : <div className="absolute inset-0"><div className="amb-mesh" /></div>}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" aria-hidden />
        <AmbientLayer variant={theme.ambient} />
        {!images.hero && (
          <div className="absolute top-20 right-[-10%] size-[min(90vw,560px)] sm:right-0" data-parallax="0.3">
            <OrbLazy {...theme.orb} />
          </div>
        )}
        <div className="relative mx-auto w-full max-w-6xl">
          <div data-hero-title className="flex max-w-2xl flex-col gap-5">
            {eyebrow}
            <h1 className="report-display text-[clamp(3.2rem,14vw,8rem)] leading-[0.92]">{title}</h1>
            {scriptName}
            {leadText}
            {meta}
          </div>
        </div>
        {accent && <div className="absolute top-24 right-4 size-28 sm:right-16 sm:size-44">{accent}</div>}
      </section>
    );
  }

  if (theme.hero === "split") {
    return (
      <section data-hero className={base}>
        <AmbientLayer variant={theme.ambient} />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div data-hero-title className="order-2 flex flex-col gap-5 lg:order-1">
            {eyebrow}
            <h1 className="report-display text-[clamp(3.2rem,12vw,7.5rem)] leading-[0.92]">{title}</h1>
            {scriptName}
            {leadText}
            {meta}
          </div>
          <div className="relative order-1 mx-auto w-[min(86vw,480px)] lg:order-2">
            <div data-hero-media className={cn("relative", images.hero ? "aspect-[4/5] overflow-hidden rounded-[2rem]" : "aspect-square")}>
              {visual}
            </div>
            {accent && <div className="absolute -bottom-8 -left-6 size-28 sm:size-36" data-parallax="0.6">{accent}</div>}
          </div>
        </div>
      </section>
    );
  }

  // poster
  return (
    <section data-hero className={base}>
      <AmbientLayer variant={theme.ambient} />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div data-hero-title className="flex flex-col gap-5">
          {eyebrow}
          <h1 className="report-display text-[clamp(3.6rem,19vw,10.5rem)] leading-[0.85] font-bold">
            {words.map((w, i) => (
              <span key={i} className={cn("block", i % 2 === 1 && "pl-[10vw] text-primary lg:pl-24")}>
                {theme.uppercaseTitle ? w.toUpperCase() : w}
              </span>
            ))}
          </h1>
          {scriptName}
          {leadText}
          {meta}
        </div>
        <div className="relative mx-auto w-[min(80vw,420px)]">
          <div data-hero-media className={cn("relative", images.hero ? "aspect-[4/5] rotate-2 overflow-hidden rounded-[2rem] shadow-2xl" : "aspect-square")}>
            {visual}
          </div>
          <RotatingBadge text={`${report.english} • La Methode • `} glyph={theme.ornament} />
          {accent && <div className="absolute -bottom-8 -left-8 size-28 sm:size-36" data-parallax="0.6">{accent}</div>}
        </div>
      </div>
    </section>
  );
}

function RotatingBadge({ text, glyph }: { text: string; glyph: string }) {
  return (
    <div className="absolute -top-4 right-0 grid size-24 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg sm:-right-4 sm:size-32" aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full animate-[spin_18s_linear_infinite] motion-reduce:animate-none">
        <defs><path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs>
        {/* textLength stretches the label to exactly one lap of the circle (2πr ≈ 238) */}
        <text fontSize="8.5" fill="currentColor">
          <textPath href="#badge-circle" textLength="236" lengthAdjust="spacing">{text.toUpperCase()}</textPath>
        </text>
      </svg>
      <span className="report-display text-3xl">{glyph}</span>
    </div>
  );
}

/* ───────────────────────────── intro bands ───────────────────────────── */

function TruthBand({ report, theme }: { report: Report; theme: ReportTheme }) {
  const rest = report.intro.slice(1);
  if (!rest.length) return null;
  return (
    <section id="truth" className="relative scroll-mt-10 overflow-hidden bg-secondary/70 px-4 py-24 sm:px-6 sm:py-36">
      <div className="amb-mesh opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-4xl">
        <p className="text-center text-3xl text-primary" aria-hidden>{theme.ornament}</p>
        <Eyebrow className="mt-3 text-center">Sự thật ít ai nói ra</Eyebrow>
        {rest.map((t, i) => (
          <p key={i} data-words className="report-display mt-8 text-[clamp(1.35rem,4.2vw,2.4rem)] leading-snug text-foreground">
            {t}
          </p>
        ))}
      </div>
    </section>
  );
}

function initials(name: string) {
  return name.replace(/\(.*?\)/g, "").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function Celebrities({ report, theme }: { report: Report; theme: ReportTheme }) {
  return (
    <section id="share" className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <Eyebrow>Chia sẻ nguyên mẫu</Eyebrow>
            <h2 data-split className="report-display mt-3 text-[clamp(2.2rem,6vw,3.5rem)] leading-tight">Người nổi tiếng giống như bạn</h2>
          </div>
          {report.population && (
            <div data-reveal className="flex items-end gap-4">
              <span className="report-display text-[clamp(5rem,18vw,9rem)] leading-[0.8] text-primary">
                <NumberTicker value={report.population} className="text-primary" />%
              </span>
              <span className="pb-2 text-sm leading-relaxed text-muted-foreground">
                dân số mang đặc tính cốt lõi
                <br />
                của {report.english} giống bạn
              </span>
            </div>
          )}
        </div>
      </div>

      <div data-skew className="mt-14">
        <Marquee pauseOnHover className="[--duration:45s] [--gap:1.25rem]" repeat={3}>
          {report.celebrities.map((c) => (
            <article key={c.name} data-spotlight className={cn(cardClass(theme.card), "spotlight w-[78vw] max-w-sm shrink-0 p-6 sm:w-[340px]")}>
              <div className="flex items-center gap-3">
                <span className="report-display grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-lg text-primary">{initials(c.name)}</span>
                <h3 className="leading-tight font-semibold">{c.name}</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground"><RichText text={c.text} /></p>
            </article>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto mt-14 grid max-w-6xl gap-5 px-4 sm:px-6 md:grid-cols-2">
        {report.powers.map((pw, i) => (
          <Card key={i} theme={theme} className="h-full p-7 sm:p-9" beam={i * 3}>
            <Eyebrow>Siêu năng lực {String(i + 1).padStart(2, "0")}</Eyebrow>
            {pw.title && <h3 className="report-display mt-3 text-[clamp(1.5rem,4vw,2rem)] leading-snug">{pw.title}</h3>}
            {pw.english && <p className="mt-1 text-sm text-primary italic">{pw.english}</p>}
            {pw.lead && <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground"><RichText text={pw.lead} /></p>}
            <ul className="mt-6 space-y-4">
              {pw.points.map((pt) => (
                <li key={pt.title} className="text-[15px] leading-relaxed text-muted-foreground">
                  <strong className="block font-semibold text-foreground">{pt.title}</strong>
                  <RichText text={pt.text} />
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── sections ───────────────────────────── */

// Bạn thực sự là ai — sticky split: image + marks stay, cards rise on the right.
function PortraitSection({ report, theme, images, index }: SectionProps) {
  const s = getSection(report, "portrait");
  const { lead, groups } = groupBlocks(s.blocks);
  const specs = groupSpecs(groups, (_, icon) => (icon === "🛑" ? "🛑 Góc tối" : "✨ Năng lực cốt lõi"));
  return (
    <Section id={s.id} tinted>
      <SectionHeading theme={theme} index={index} title={s.title} />
      <StickySplit
        label="Bạn thực sự là ai"
        marks={groups.map((g) => splitTitle(stripNumber(g.sub.title))[0])}
        itemMark={specs.map((c) => c.group)}
        aside={
          <>
            <Media src={images.portrait} alt={`${report.english} — chân dung đời thường`} theme={theme} className="aspect-[5/4]" label="Chân dung" />
            <Paragraphs blocks={lead} className="mt-6" />
          </>
        }
      >
        {renderSpecs(specs, theme)}
      </StickySplit>
    </Section>
  );
}

// Lõi tính cách — three tarot cards turn over, then a self-ticking survival checklist on notebook paper.
function CoreSection({ report, theme, images, index }: SectionProps) {
  const s = getSection(report, "core");
  const { lead, groups } = groupBlocks(s.blocks);
  const pillars = items(lead);
  const cautions = groups[0];
  const ROMAN = ["I", "II", "III", "IV", "V"];
  return (
    <>
      <Section id={s.id}>
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <SectionHeading theme={theme} index={index} title={s.title} />
            <div data-reveal><Paragraphs blocks={paras(lead)} /></div>
          </div>
          <div className="mx-auto w-[min(80vw,380px)]" data-parallax="0.25">
            <Media src={images.core} alt={`${report.english} — khoảnh khắc nội tâm`} theme={theme} className="aspect-[4/5]" rounded="rounded-t-[999px] rounded-b-3xl" label="Nội tâm" />
          </div>
        </div>
        <p className="mt-16 mb-6 text-center text-[11px] font-medium tracking-[0.3em] text-primary uppercase">✦ Ba lá bài định mệnh ✦</p>
        <FlipGrid
          backs={pillars.map((_, i) => (
            <div key={i} className="relative grid size-full place-items-center overflow-hidden rounded-[var(--card-radius)] bg-gradient-to-br from-primary to-[color-mix(in_srgb,var(--primary)_55%,var(--secondary))] p-3 text-primary-foreground">
              <div className="grid size-full place-items-center rounded-[calc(var(--card-radius)-0.4rem)] border border-primary-foreground/50 text-center">
                <div>
                  <p className="text-2xl">{theme.ornament}</p>
                  <p className="report-display mt-2 text-6xl leading-none">{ROMAN[i]}</p>
                  <p className="mt-3 text-[11px] tracking-[0.3em] uppercase">Trụ cột</p>
                </div>
              </div>
            </div>
          ))}
        >
          {pillars.map((pl, i) => (
            <DeckCard key={i} theme={theme} kicker={`Lá bài ${ROMAN[i]}`} title={pl.title} compact className="min-h-[22rem]">
              <RichText text={pl.text} />
            </DeckCard>
          ))}
        </FlipGrid>
      </Section>
      {cautions && <CautionsChecklist theme={theme} group={cautions} />}
    </>
  );
}

function CautionsChecklist({ theme, group }: { theme: ReportTheme; group: Group }) {
  const [title] = splitTitle(group.sub.title);
  const ps = paras(group.blocks);
  return (
    <section id="core-cautions" className="relative bg-secondary/45 px-4 py-20 sm:px-6 sm:py-28">
      <div className="deco-lines relative mx-auto max-w-3xl rounded-[var(--card-radius)] border border-border bg-card px-6 py-10 shadow-[0_30px_80px_-40px_color-mix(in_srgb,var(--primary)_70%,transparent)] sm:px-12">
        <p className="text-[11px] font-medium tracking-[0.3em] text-primary uppercase">Cẩm nang sinh tồn · {theme.ornament}</p>
        <h2 data-split className="report-display mt-3 text-[clamp(1.8rem,5vw,2.8rem)] leading-tight">{title}</h2>
        {ps[0] && <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base"><RichText text={ps[0].text} /></p>}
        <div className="mt-8">
          <ChecklistScene>
            {items(group.blocks).map((it, i) => (
              <div key={i} className="flex gap-4 rounded-2xl border border-border bg-card/90 p-5 sm:p-6">
                <CheckMark />
                <div>
                  <p className="font-semibold text-foreground"><span className="marker-sweep">{it.title}</span></p>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground"><RichText text={it.text} /></p>
                </div>
              </div>
            ))}
          </ChecklistScene>
        </div>
        {ps.length > 1 && <p data-words className="report-display mt-10 text-[clamp(1.25rem,3.6vw,1.8rem)] leading-snug">{ps.at(-1)!.text}</p>}
      </div>
    </section>
  );
}

// Tình yêu — swipe like a dating app: the myths go left, what you truly need goes right.
function LoveSection({ report, theme, images, index }: SectionProps) {
  const s = getSection(report, "love");
  const { lead, groups } = groupBlocks(s.blocks);
  const [think, want] = groups;
  const tip = tips(s.blocks).at(-1);
  const myth = think ? groupSpecs([think], () => "✕ Bạn tưởng mình muốn") : [];
  const truth = want ? groupSpecs([want], () => "♡ Bạn thực sự khao khát") : [];
  const card = (c: CardSpec, i: number) => (
    <DeckCard theme={theme} kicker={c.kicker} n={c.note ? undefined : i + 1} title={c.title} sub={c.sub} compact className="min-h-[min(56svh,440px)]">
      {c.body}
    </DeckCard>
  );
  return (
    <section id={s.id} className="relative scroll-mt-16 bg-secondary/45">
      <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 sm:pt-28">
        <SectionHeading theme={theme} index={index} title={s.title} align="center" />
        <div data-reveal>
          <Paragraphs blocks={lead.map((b) => (b.type === "p" ? { ...b, text: capitalize(b.text) } : b))} className="mx-auto max-w-3xl text-center" />
        </div>
        <Media src={images.love} alt={`${report.english} — tình yêu`} theme={theme} className="mx-auto mt-12 aspect-[4/3] max-w-5xl sm:aspect-[16/8]" label="Tình yêu" />
        {myth.length + truth.length > 0 && (
          <p className="mt-16 text-center text-[11px] font-medium tracking-[0.3em] text-primary uppercase">Cuộn để quẹt · ✕ ảo tưởng · ♡ điều bạn thật sự cần</p>
        )}
      </div>
      {myth.length + truth.length > 0 && <SwipeDeck
        noLabel="Ảo tưởng"
        yesLabel="Thật lòng cần"
        cards={[...myth.map((c, i) => ({ kind: "no" as const, node: card(c, i) })), ...truth.map((c, i) => ({ kind: "yes" as const, node: card(c, myth.length + i) }))]}
      />}
      {tip && <div data-reveal className="mx-auto max-w-3xl px-4 pb-20 sm:px-6"><TipQuote text={tip.text} large /></div>}
    </section>
  );
}

// Người khác nghĩ gì — sticky notes pinned to a board, dropping in one by one.
function PerceptionSection({ report, theme, index }: SectionProps) {
  const s = getSection(report, "perception");
  const { groups } = groupBlocks(s.blocks);
  const tip = tips(s.blocks).at(-1);
  const specs = groupSpecs(groups, (_, __, gi) => (gi === 0 ? "✨" : "🫧"));
  return (
    <Section id={s.id}>
      <SectionHeading theme={theme} index={index} title={s.title} align="center" />
      <div className="mb-10 flex flex-wrap justify-center gap-3 text-xs">
        <span className="rounded-full bg-[color-mix(in_srgb,var(--secondary)_85%,white)] px-4 py-1.5">✨ Ấn tượng tích cực</span>
        <span className="rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,var(--card))] px-4 py-1.5">🫧 Dễ bị hiểu lầm</span>
      </div>
      {specs.length === 0 && <Paragraphs blocks={s.blocks.filter((b) => b.type !== "tip")} className="mx-auto max-w-3xl" />}
      <NotesBoard
        notes={specs.map((c) => ({
          tone: c.group === 0 ? ("a" as const) : ("b" as const),
          node: (
            <>
              {c.kicker && <p className="text-[10px] font-medium tracking-[0.25em] text-primary uppercase">{c.kicker}</p>}
              {c.title && <p className={cn("mt-2 leading-snug text-foreground", theme.script ? "report-script text-2xl" : "report-display text-xl")}>{c.title}</p>}
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{c.body}</p>
            </>
          ),
        }))}
      />
      {tip && <div data-reveal className="mt-16"><TipQuote text={tip.text} /></div>}
    </Section>
  );
}

// Cách phản ứng — told as a chat: La Methode asks, "typing…", and your replies pop in.
function ReactionsSection({ report, theme, index }: SectionProps) {
  const s = getSection(report, "reactions");
  const { lead, groups } = groupBlocks(s.blocks);
  const tip = tips(s.blocks).at(-1);
  return (
    <Section id={s.id} tinted>
      <SectionHeading theme={theme} index={index} title={s.title} align="center" />
      <div data-reveal><Paragraphs blocks={lead} className="mx-auto mb-12 max-w-2xl text-center" /></div>
      <ChatScene
        botName="La Methode"
        threads={groups.map((g) => {
          const [title, hint] = splitTitle(stripNumber(g.sub.title));
          const intro = paras(g.blocks)[0];
          return {
            prompt: (
              <>
                <span className="font-semibold">{hint ?? title}</span> — bà sẽ phản ứng thế nào? 👀
                {intro && <span className="mt-1 block text-[13px] text-muted-foreground">{intro.text}</span>}
              </>
            ),
            replies: items(g.blocks).map((it, k) => (
              <span key={k}>
                <strong className="block">{it.title}</strong>
                <span className="opacity-90"><RichText text={it.text} /></span>
              </span>
            )),
          };
        })}
      />
      {tip && <div data-reveal className="mx-auto mt-12 max-w-3xl"><TipQuote text={tip.text} /></div>}
    </Section>
  );
}

// Điểm mạnh — a bento of superpowers: tiles of different sizes, the first one glowing.
function StrengthsSection({ report, theme, index }: SectionProps) {
  const s = getSection(report, "strengths");
  const { lead, groups } = groupBlocks(s.blocks);
  const SPANS = ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4"];
  return (
    <Section id={s.id}>
      <SectionHeading theme={theme} index={index} title={s.title} />
      <div data-reveal><Paragraphs blocks={lead.slice(0, 1)} className="max-w-3xl" /></div>
      <div className="mt-12 grid gap-5 md:grid-cols-6">
        {groups.map((g, i) => {
          const [title, sub] = splitTitle(stripNumber(g.sub.title));
          return (
            <div key={i} data-reveal className={cn(SPANS[i % SPANS.length], "relative")}>
              <DeckCard
                theme={theme}
                kicker=""
                n={i + 1}
                title={title}
                sub={sub}
                className={cn(i === 0 && "bg-[linear-gradient(140deg,color-mix(in_srgb,var(--secondary)_90%,var(--card)),var(--card))]", i === 3 && "bg-[color-mix(in_srgb,var(--secondary)_45%,var(--card))]")}
              >
                <ItemList blocks={g.blocks} />
                <Paragraphs blocks={paras(g.blocks)} className="mt-4" />
              </DeckCard>
              {i === 0 && <BorderBeam size={160} duration={9} />}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// Điểm mù — split mirrored: blind spots scroll on the left, the inner conflict stays on the right.
function BlindspotsSection({ report, theme, index }: SectionProps) {
  const blind = getSection(report, "blindspots");
  const conflict = getSection(report, "conflict");
  const [conflictMain] = splitTitle(conflict.title);
  const conflictParas = paras(conflict.blocks);
  const blindItems = items(blind.blocks);
  return (
    <>
      <Section id={blind.id}>
        <StickySplit
          side="right"
          label="Điểm mù"
          aside={
            <>
              <SectionHeading theme={theme} index={index} title={blind.title} />
              <Paragraphs blocks={paras(blind.blocks)} />
            </>
          }
        >
          {blindItems.map((it, i) => (
            <DeckCard key={i} theme={theme} kicker="" n={i + 1} title={it.title}>
              <RichText text={it.text} />
            </DeckCard>
          ))}
        </StickySplit>
      </Section>

      <section id={conflict.id} className="relative overflow-hidden bg-secondary/55 px-4 py-24 sm:px-6 sm:py-32">
        <div className="amb-mesh opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-center text-[11px] font-medium tracking-[0.3em] text-primary uppercase">{conflictMain}</p>
          {conflictParas[0] && (
            <p data-words className="report-display mx-auto mt-6 max-w-4xl text-center text-[clamp(1.4rem,4.2vw,2.4rem)] leading-snug">
              {conflictParas[0].text}
            </p>
          )}
          <div className="mt-14">
            <FlipGrid
              backs={items(conflict.blocks).map((_, i) => (
                <div key={i} className="grid size-full place-items-center rounded-[2rem] border border-primary/30 bg-card">
                  <p className="report-display text-7xl text-primary/60">{theme.ornament}</p>
                </div>
              ))}
            >
              {items(conflict.blocks).map((it, i) => (
                <DeckCard key={i} theme={theme} kicker="" n={i + 1} title={it.title} compact>
                  <RichText text={it.text} />
                </DeckCard>
              ))}
            </FlipGrid>
          </div>
          {conflictParas.length > 1 && <div data-reveal className="mx-auto mt-12 max-w-3xl"><TipQuote text={conflictParas.at(-1)!.text} large /></div>}
        </div>
      </section>
    </>
  );
}

// Thách thức trong quan hệ — dealt deck, nature vs signs side by side in each card.
function ChallengesSection({ report, theme, index }: SectionProps) {
  const s = getSection(report, "challenges");
  const { lead, groups } = groupBlocks(s.blocks);
  const tip = tips(s.blocks).at(-1);
  return (
    <DeckSection
      id={s.id}
      theme={theme}
      index={index}
      title={s.title}
      lead={lead}
      label="Thử thách"
      variant={theme.deck[0]}
      tinted
      after={tip && <TipQuote text={tip.text} />}
    >
      {groups.map((g, i) => {
        const [title, sub] = splitTitle(stripNumber(g.sub.title));
        return (
          <DeckCard key={i} theme={theme} kicker="" n={i + 1} title={title} sub={sub}>
            <div className="grid gap-3 sm:grid-cols-2">
              {items(g.blocks).map((it, k) => (
                <div key={k} className="rounded-2xl bg-secondary/60 p-4">
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">{it.title}</p>
                  <p className="mt-2 text-[14px] text-foreground/80 sm:text-[15px]"><RichText text={it.text} /></p>
                </div>
              ))}
            </div>
          </DeckCard>
        );
      })}
    </DeckSection>
  );
}

// Hướng phát triển — calm horizontal coverflow.
function GrowthSection({ report, theme, index }: SectionProps) {
  const s = getSection(report, "growth");
  const { lead, groups } = groupBlocks(s.blocks);
  const tip = tips(s.blocks).at(-1);
  return (
    <section id={s.id} className="relative scroll-mt-16 bg-secondary/45">
      <HorizontalScene>
        <div className="flex w-[82vw] max-w-[440px] shrink-0 flex-col justify-center">
          <SectionHeading theme={theme} index={index} title={s.title} />
          <Paragraphs blocks={lead.slice(0, 1)} />
          <p className="mt-8 text-xs tracking-[0.2em] text-muted-foreground uppercase">Cuộn để đi tiếp →</p>
        </div>
        {groups.map((g, i) => {
          const [title, sub] = splitTitle(stripNumber(g.sub.title));
          return (
            <div key={i} data-ride-card className="w-[82vw] max-w-[480px] shrink-0">
              <DeckCard theme={theme} kicker={`Bước ${i + 1}`} n={i + 1} title={title} sub={sub}>
                <ItemList blocks={g.blocks} />
              </DeckCard>
            </div>
          );
        })}
        {tip && (
          <div data-ride-card className="flex w-[82vw] max-w-[520px] shrink-0 items-center">
            <TipQuote text={tip.text} large />
          </div>
        )}
      </HorizontalScene>
    </section>
  );
}

// Quan hệ xã hội — big-type spotlight list: the line in the middle of the screen lights up.
function RelationshipsSection({ report, theme, index }: SectionProps) {
  const s = getSection(report, "relationships");
  const { lead, groups } = groupBlocks(s.blocks);
  const tip = tips(s.blocks).at(-1);
  const specs = groupSpecs(groups, (_, icon) => (icon === "💕" ? "💕 Tình yêu" : "🌟 Bạn bè & đồng nghiệp"));
  return (
    <Section id={s.id}>
      <SectionHeading theme={theme} index={index} title={s.title} />
      <div data-reveal><Paragraphs blocks={lead.slice(0, 1)} className="max-w-3xl" /></div>
      <div className="mt-8">
        <SpotlightList>
          {specs.map((c, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[5rem_1fr] sm:gap-8">
              <span className="report-display text-4xl leading-none text-primary sm:text-6xl">{c.note ? theme.ornament : pad(i + 1)}</span>
              <div>
                {c.kicker && <p className="text-[11px] font-medium tracking-[0.25em] text-primary uppercase">{c.kicker}</p>}
                {c.title && <h3 className="report-display mt-2 text-[clamp(1.5rem,4.6vw,2.6rem)] leading-tight">{c.title}</h3>}
                <div className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">{c.body}</div>
              </div>
            </div>
          ))}
        </SpotlightList>
      </div>
      {tip && <div data-reveal className="mt-12"><TipQuote text={tip.text} /></div>}
    </Section>
  );
}

// Thăng tiến — climb the staircase: each tactic is one step up, LV.1 → LV.n.
function CareerSection({ report, theme, index }: SectionProps) {
  const s = getSection(report, "career");
  const { lead, groups } = groupBlocks(s.blocks);
  const lastGroup = groups.at(-1);
  const closing = lastGroup?.blocks.at(-1)?.type === "p" ? (lastGroup.blocks.at(-1) as { text: string }) : null;
  const trimmed = groups.map((g) => (g === lastGroup && closing ? { ...g, blocks: g.blocks.slice(0, -1) } : g));
  const specs = groupSpecs(trimmed, (title, _, gi) => `Bí kíp ${gi + 1} · ${title}`);
  return (
    <section id={s.id} className="relative scroll-mt-16 bg-secondary/45">
      <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 sm:pt-28">
        <SectionHeading theme={theme} index={index} title={s.title} />
        <div data-reveal><Paragraphs blocks={lead} className="max-w-3xl" /></div>
      </div>
      <Staircase>
        {specs.map((c, i) => (
          <DeckCard key={i} theme={theme} kicker={c.kicker ? `LV.${i + 1} · ${c.kicker}` : `LV.${i + 1}`} title={c.title} sub={c.sub} compact>
            {c.body}
          </DeckCard>
        ))}
      </Staircase>
      {closing && <div data-reveal className="mx-auto max-w-3xl px-4 pb-20 sm:px-6"><TipQuote text={closing.text} /></div>}
    </section>
  );
}

// Vận trình — horizontal coverflow through the three life stages.
function JourneySection({ report, theme, index }: SectionProps) {
  const s = getSection(report, "journey");
  const { lead, groups } = groupBlocks(s.blocks);
  return (
    <section id={s.id} className="relative scroll-mt-16 overflow-hidden">
      <AmbientLayer variant={theme.ambient} />
      <HorizontalScene>
        <div className="flex w-[82vw] max-w-[420px] shrink-0 flex-col justify-center">
          <SectionHeading theme={theme} index={index} title={s.title} />
          <Paragraphs blocks={lead.slice(0, 1)} />
          <p className="mt-8 text-xs tracking-[0.2em] text-muted-foreground uppercase">Cuộn để đi tiếp →</p>
        </div>
        {groups.map((g, i) => {
          const [range, name] = g.sub.title.split(/:\s*/);
          const [vi, en] = splitTitle(name ?? "");
          return (
            <div key={i} data-ride-card className="w-[82vw] max-w-[500px] shrink-0">
              <DeckCard theme={theme} kicker={`${g.sub.icon ?? ""} ${range}`} n={i + 1} title={vi} sub={en}>
                <div className="space-y-4">
                  {items(g.blocks).map((it, k) => (
                    <div key={k}>
                      <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">{it.title}</p>
                      <p className="mt-1"><RichText text={it.text} /></p>
                    </div>
                  ))}
                </div>
              </DeckCard>
            </div>
          );
        })}
      </HorizontalScene>
    </section>
  );
}

// Lời khuyên — the closing quote lights up word by word, then the advice ring turns.
function AdviceSection({ report, theme, images, index }: SectionProps) {
  const s = getSection(report, "advice");
  const lead = paras(s.blocks)[0];
  const allTips = tips(s.blocks);
  const closing = allTips.length > 1 ? allTips.at(-1) : null;
  const listTitle = allTips.length > 1 ? allTips[0].text.replace(/:$/, "") : "Lời khuyên";
  return (
    <section id={s.id} className="relative overflow-hidden bg-secondary/70">
      <AmbientLayer variant={theme.ambient} />
      <div className="relative mx-auto max-w-4xl px-4 pt-24 text-center sm:px-6 sm:pt-32">
        <SectionHeading theme={theme} index={index} title={s.title} align="center" />
        <div className="mx-auto -mt-4 mb-6 size-40 sm:size-52" data-parallax="0.3">
          {images.symbol ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images.symbol} alt="" aria-hidden className="size-full object-contain drop-shadow-2xl" />
          ) : (
            <OrbLazy {...theme.orb} />
          )}
        </div>
        {lead && <p data-words className="report-display text-[clamp(1.4rem,4.4vw,2.4rem)] leading-snug">{capitalize(lead.text)}</p>}
      </div>
      <Carousel3D label={listTitle}>
        {items(s.blocks).map((it, i) => (
          <DeckCard key={i} theme={theme} kicker="" n={i + 1} title={it.title} compact>
            <RichText text={it.text} />
          </DeckCard>
        ))}
      </Carousel3D>
      {closing && <div data-reveal className="relative mx-auto max-w-4xl px-4 pb-24 sm:px-6"><TipQuote text={closing.text} large /></div>}
    </section>
  );
}

function Closing({ report, theme, images, secondary }: { report: Report; theme: ReportTheme; images: ReportImages; secondary: Archetype | null }) {
  return (
    <section className="relative overflow-hidden py-24">
      <div data-reveal className="mx-auto mb-20 max-w-5xl px-4 sm:px-6">
        <StoryCollage
          english={report.english}
          name={report.name}
          population={report.population}
          powers={report.powers.flatMap((p) => (p.title ? [p.title] : []))}
          // Wide (full-bleed) heroes crop badly into small frames — lead with the vertical portrait there.
          photos={theme.hero === "fullbleed" ? [images.portrait, images.hero, images.love, images.core] : [images.hero, images.portrait, images.love, images.core]}
          ornament={theme.ornament}
          slug={report.slug}
        />
      </div>
      <div data-skew>
        <Marquee className="mb-16 [--duration:40s]" repeat={4}>
          {[report.english, theme.ornament, report.name, theme.ornament].map((w, i) => (
            <span key={i} className="report-display mx-6 text-[clamp(2.5rem,8vw,5rem)] whitespace-nowrap text-primary/45">{w}</span>
          ))}
        </Marquee>
      </div>
      <div className="mx-auto grid max-w-5xl gap-5 px-4 sm:px-6 md:grid-cols-2">
        {secondary && (
          <Card theme={theme} className="p-8">
            <Eyebrow>Nguyên mẫu phụ của bạn</Eyebrow>
            <h3 className="report-display mt-3 text-3xl">{secondary.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground italic">The {secondary.english}</p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{secondary.motivation}</p>
          </Card>
        )}
        <Card theme={theme} className={cn("flex flex-col justify-between gap-6 p-8", !secondary && "md:col-span-2")}>
          <div>
            <Eyebrow>Tiếp tục hành trình</Eyebrow>
            <h3 className="report-display mt-3 text-3xl">Hiểu mình là bước đầu của mọi thay đổi</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/quiz" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90">
              <RotateCcw className="size-4" /> Làm lại khảo sát
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm transition hover:border-foreground">
              <Home className="size-4" /> Về trang chủ
            </Link>
          </div>
        </Card>
      </div>
      <p className="mt-16 text-center text-xs tracking-[0.3em] text-muted-foreground uppercase">La Methode · {report.english}</p>
    </section>
  );
}
