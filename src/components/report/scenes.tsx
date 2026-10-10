"use client";

import { Children, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import type { Ambient, DeckStyle, OrbShape } from "@/lib/report/themes";
import { cn } from "@/lib/utils";
import { AmbientLayer } from "./client";
import OrbLazy from "./OrbLazy";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const MOTION = "(prefers-reduced-motion: no-preference)";
/** CSS size of the floating orb wrapper — keep in sync with orbSize() below. */
const ORB_BOX = "min(70vw,460px)";
const orbSize = () => Math.min(window.innerWidth * 0.7, 460);
/** Share of the canvas the 3D object actually fills (camera framing in ArchetypeOrb). */
const OBJECT_FILL = 0.55;

/* ───────────── Floating 3D companion ─────────────
 * One fixed WebGL object that keeps moving with the reader:
 *  - over the hero it hides (the hero has its own object);
 *  - while a chapter halo ([data-halo-anchor]) is on screen it flies into the halo and tracks it;
 *  - elsewhere it rides the page edge, swaying up and down with the scroll, switching sides each chapter. */
export function FloatingOrb({ orb }: { orb: { shape: OrbShape; color: string; color2: string } }) {
  const el = useRef<HTMLDivElement>(null);
  // The WebGL loop only runs while the object is actually on screen.
  const [awake, setAwake] = useState(false);

  useGSAP(() => {
    const node = el.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ease = { duration: reduced ? 0 : 1, ease: "power3" };
    const qx = gsap.quickTo(node, "x", ease);
    const qy = gsap.quickTo(node, "y", ease);
    // quickTo needs individual properties: "scale" is a shorthand it cannot reset.
    const qsx = gsap.quickTo(node, "scaleX", ease);
    const qsy = gsap.quickTo(node, "scaleY", ease);
    const qs = (v: number) => {
      qsx(v);
      qsy(v);
    };
    const qoTween = gsap.quickTo(node, "opacity", { duration: reduced ? 0 : 0.6, ease: "power2" });
    let shown = false;
    const qo = (v: number) => {
      qoTween(v);
      if (v > 0 !== shown) {
        shown = v > 0;
        setAwake(shown);
      }
    };
    gsap.set(node, { opacity: 0, scale: 0.3 });

    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const desktop = vw >= 768;

      const hero = document.querySelector("[data-hero]")?.getBoundingClientRect();
      if (hero && hero.bottom > vh * 0.45) {
        qo(0);
        qs(0.3);
        return;
      }

      for (const halo of document.querySelectorAll<HTMLElement>("[data-halo-anchor]")) {
        const r = halo.getBoundingClientRect();
        if (r.bottom > vh * 0.1 && r.top < vh * 0.9) {
          qx(r.left + r.width / 2 - vw / 2);
          qy(r.top + r.height / 2 - vh / 2);
          qs((r.width * 0.8) / (orbSize() * OBJECT_FILL));
          qo(1);
          return;
        }
      }

      const passed = [...document.querySelectorAll("[data-chapter]")].filter((c) => c.getBoundingClientRect().top < vh * 0.5).length;
      const side = passed % 2 === 0 ? 1 : -1;
      const t = window.scrollY / vh;
      // Phones have no margins: the object peeks half off the screen edge so it never sits on text.
      qx(side * vw * (desktop ? 0.44 : 0.5) + Math.sin(t * 1.3) * vw * 0.015);
      qy(Math.sin(t * 0.8) * vh * (desktop ? 0.3 : 0.34));
      qs(desktop ? 0.34 : 0.4);
      qo(desktop ? 1 : 0.85);
    };

    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: update, onRefresh: update });
    update();
    return () => st.kill();
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-0 grid place-items-center" aria-hidden>
      <div ref={el} style={{ width: ORB_BOX, height: ORB_BOX }} className="opacity-0 will-change-transform">
        <OrbLazy {...orb} paused={!awake} />
      </div>
    </div>
  );
}

/** Polar outline in the 200×200 halo box: r(θ) sampled into a closed path. */
function polarPath(r: (t: number) => number, steps = 240) {
  const pts = Array.from({ length: steps }, (_, i) => {
    const t = (i / steps) * Math.PI * 2 - Math.PI / 2;
    return `${(100 + r(t) * Math.cos(t)).toFixed(2)} ${(100 + r(t) * Math.sin(t)).toFixed(2)}`;
  });
  return `M${pts.join(" L")} Z`;
}

/** One drawn emblem per chapter: ring, heart, storm wave, bloom, crescent. */
const HALO_PATHS = [
  "M100 2 A98 98 0 1 1 99.99 2 Z",
  "M100 182 C 40 140, 2 104, 20 58 C 36 16, 86 14, 100 52 C 114 14, 164 16, 180 58 C 198 104, 160 140, 100 182 Z",
  polarPath((t) => 90 + 7 * Math.sin(12 * t)),
  polarPath((t) => 74 + 24 * Math.abs(Math.cos(4 * t))),
  "M148 24 A90 90 0 1 0 148 176 A70 70 0 1 1 148 24 Z",
];

/* ───────────── Chapter scene ─────────────
 * Full-screen interlude: a halo draws itself, the floating object flies into it,
 * the title rises letter by letter and a handwritten line writes in. The page tint shifts. */
export function ChapterScene({
  index,
  total,
  title,
  kicker,
  tint,
  baseTint,
  ornament,
  ambient,
}: {
  index: number;
  total: number;
  title: string;
  kicker: string;
  tint: string;
  baseTint: string;
  ornament: string;
  ambient: Ambient;
}) {
  const root = useRef<HTMLElement>(null);
  const number = String(index + 1).padStart(2, "0");

  useGSAP(
    () => {
      const page = root.current!.closest<HTMLElement>("[data-archetype]");
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 60%",
        onEnter: () => page && gsap.to(page, { "--background": tint, duration: 1.2, ease: "power2.out" }),
        onLeaveBack: () => page && gsap.to(page, { "--background": baseTint, duration: 1.2, ease: "power2.out" }),
      });

      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const split = SplitText.create(root.current!.querySelector("[data-chapter-title]"), { type: "chars,words" });

        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top 70%", toggleActions: "play none none reverse" } })
          .fromTo("[data-halo] path[stroke-dasharray]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 0)
          .from("[data-halo-dash]", { scale: 0.6, opacity: 0, duration: 1.2, ease: "power3.out" }, 0.2)
          .from("[data-chapter-dot]", { scale: 0, duration: 0.5, stagger: 0.08, ease: "back.out(3)" }, 0.3)
          .from("[data-chapter-label]", { y: 16, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.3)
          .from(split.chars, { yPercent: 120, opacity: 0, rotate: 6, stagger: 0.025, duration: 0.9, ease: "back.out(1.7)" }, 0.45)
          .fromTo("[data-chapter-script]", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: "power2.inOut" }, 0.9);

        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=70%", scrub: 0.6, pin: true, anticipatePin: 1 } })
          .to("[data-halo]", { rotate: 14, scale: 1.12, ease: "none", duration: 1 }, 0)
          .to("[data-halo-dash]", { rotate: -120, ease: "none", duration: 1 }, 0)
          .to("[data-chapter-text]", { yPercent: -25, opacity: 0, ease: "power1.in", duration: 0.35 }, 0.65)
          .to("[data-halo-wrap]", { opacity: 0, scale: 0.85, ease: "power1.in", duration: 0.35 }, 0.65);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} data-chapter className="relative flex h-[100svh] items-center justify-center overflow-hidden px-4">
      <AmbientLayer variant={ambient} />
      <div className="amb-mesh opacity-60" aria-hidden />
      <div className="relative flex w-full max-w-3xl flex-col items-center text-center">
        <div data-halo-wrap className="relative" style={{ width: `calc(${ORB_BOX} * 0.58)`, height: `calc(${ORB_BOX} * 0.58)` }}>
          <div data-halo-anchor className="absolute inset-0" />
          <svg data-halo viewBox="0 0 200 200" className="absolute inset-0 size-full overflow-visible" aria-hidden>
            <path d={HALO_PATHS[index % HALO_PATHS.length]} fill="none" stroke="var(--primary)" strokeOpacity="0.6" strokeWidth="1.2" strokeLinejoin="round" pathLength={1} strokeDasharray="1" />
            {index === 4 &&
              [[40, 40], [170, 60], [30, 150], [175, 165]].map(([x, y], i) => (
                <path key={i} d={`M${x} ${y - 6} L${x + 1.6} ${y - 1.6} L${x + 6} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 6} L${x - 1.6} ${y + 1.6} L${x - 6} ${y} L${x - 1.6} ${y - 1.6} Z`} fill="var(--primary)" fillOpacity="0.5" />
              ))}
          </svg>
          <svg data-halo-dash viewBox="0 0 200 200" className="absolute inset-[9%] size-[82%]" aria-hidden>
            <circle cx="100" cy="100" r="98" fill="none" stroke="var(--primary)" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="1.5 7" strokeLinecap="round" />
          </svg>
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-primary" aria-hidden>{ornament}</span>
        </div>

        <div data-chapter-text className="mt-8 flex flex-col items-center sm:mt-10">
          <div data-chapter-label className="flex items-center gap-3 text-[11px] font-medium tracking-[0.35em] text-primary uppercase">
            <span>Chương {number}</span>
            <span className="flex gap-1.5" aria-hidden>
              {Array.from({ length: total }, (_, i) => (
                <span key={i} data-chapter-dot className={cn("size-1.5 rounded-full", i <= index ? "bg-primary" : "bg-primary/25", i === index && "scale-150")} />
              ))}
            </span>
          </div>
          <h2 data-chapter-title className="report-display mt-4 text-[clamp(2.6rem,10vw,6.5rem)] leading-[0.95] text-balance">
            {title}
          </h2>
          <p data-chapter-script className="report-script mt-4 max-w-xl text-[clamp(1.25rem,4.5vw,2rem)] leading-snug text-primary">
            {kicker}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Card deck ─────────────
 * The deck pins in the middle of the screen. Each scroll step deals the next card in (style per
 * archetype), older cards recede under a shade, and the content inside a card ([data-in]) appears
 * line by line once it lands. A counter and progress bar show where you are. */
const DEAL_FROM: Record<DeckStyle, gsap.TweenVars> = {
  rise: { yPercent: 115, rotate: -3 },
  fan: { xPercent: 115, rotate: 10, transformOrigin: "100% 100%" },
  flip: { yPercent: 40, rotateX: -75, opacity: 0, transformPerspective: 1400, transformOrigin: "50% 100%" },
  zoom: { scale: 0.65, opacity: 0, yPercent: 25 },
};
const DEALT: gsap.TweenVars = { xPercent: 0, yPercent: 0, rotate: 0, rotateX: 0, scale: 1, opacity: 1 };

export function StackScene({ children, label, variant = "rise" }: { children: ReactNode; label: string; variant?: DeckStyle }) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const cards = Children.toArray(children);
  const total = String(cards.length).padStart(2, "0");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const els = gsap.utils.toArray<HTMLElement>("[data-stack-card]");
        if (!els.length) return;
        gsap.set(els.slice(1), DEAL_FROM[variant]);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${els.length * 55}%`,
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const i = Math.min(els.length - 1, Math.floor(self.progress * els.length));
              if (counter.current) counter.current.textContent = String(i + 1).padStart(2, "0");
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
        // The first card is already readable when the deck arrives.
        gsap.from(els[0].querySelectorAll("[data-in]"), {
          y: 26,
          opacity: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 75%", toggleActions: "play none none reverse" },
        });
        els.slice(1).forEach((card, k) => {
          const at = k;
          // Content writes itself in while the card is still flying, so a card is never blank.
          tl.to(card, { ...DEALT, ease: "power3.out", duration: 0.6 }, at)
            .from(card.querySelectorAll("[data-in]"), { y: 22, opacity: 0, stagger: 0.05, ease: "power2.out", duration: 0.3 }, at + 0.12)
            .to(els[k], { scale: 0.92, yPercent: -7, ease: "none", duration: 0.6 }, at)
            .to(els[k].querySelector("[data-stack-shade]"), { opacity: 1, ease: "none", duration: 0.6 }, at);
        });
        tl.to({}, { duration: 0.4 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-4 py-10 sm:px-6 motion-reduce:min-h-0 motion-reduce:overflow-visible">
      <div className="mx-auto mb-5 flex w-full max-w-3xl items-center gap-4 text-[11px] font-medium tracking-[0.25em] text-muted-foreground uppercase motion-reduce:hidden">
        <span className="truncate">{label}</span>
        <span className="relative h-px flex-1 bg-border">
          <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-primary" />
        </span>
        <span className="tabular-nums">
          <span ref={counter} className="text-primary">01</span> / {total}
        </span>
      </div>
      <div className="relative mx-auto grid w-full max-w-3xl motion-reduce:gap-5">
        {cards.map((card, i) => (
          <div
            key={i}
            data-stack-card
            className="relative col-start-1 row-start-1 origin-top will-change-transform motion-reduce:col-auto motion-reduce:row-auto"
            style={{ zIndex: i + 1 }}
          >
            {card}
            <div data-stack-shade className="pointer-events-none absolute inset-0 rounded-[var(--card-radius,2rem)] bg-background/70 opacity-0" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────── Horizontal ride (coverflow) ─────────────
 * Pins and slides sideways at a calm pace (1.7× the track length of scroll), snapping card by card.
 * Cards turn in 3D as they approach the centre and turn away as they leave. */
export function HorizontalScene({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const el = track.current!;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth + 32);
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance() * 1.7}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-ride-card]").forEach((card) => {
          gsap
            .timeline({ scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true } })
            .fromTo(card, { rotateY: -24, scale: 0.86, opacity: 0.45, transformPerspective: 1300 }, { rotateY: 0, scale: 1, opacity: 1, ease: "none" })
            .to(card, { rotateY: 24, scale: 0.86, opacity: 0.45, ease: "none" });
          gsap.from(card.querySelectorAll("[data-in]"), {
            y: 24,
            opacity: 0,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 85%", end: "left 40%", scrub: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("relative flex min-h-[100svh] items-center overflow-hidden motion-reduce:min-h-0 motion-reduce:overflow-x-auto", className)}>
      <div ref={track} className="flex w-max items-stretch gap-5 px-4 py-16 will-change-transform sm:gap-8 sm:px-6 lg:pl-[max(1.5rem,calc((100vw-72rem)/2))]">
        {children}
      </div>
    </div>
  );
}

/* ───────────── Sticky split ─────────────
 * Two columns: one side stays put (image, title, live counter, chapter marks) while the other
 * side's cards rise, unmask and settle as they pass, then recede. On phones the fixed side
 * becomes a compact sticky pill with the counter. */
export function StickySplit({
  aside,
  children,
  label,
  marks,
  itemMark,
  side = "left",
}: {
  aside: ReactNode;
  children: ReactNode;
  label: string;
  marks?: string[];
  itemMark?: number[];
  side?: "left" | "right";
}) {
  const root = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const total = String(items.length).padStart(2, "0");

  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>("[data-split-item]");
      const activate = (i: number) => {
        root.current!.querySelectorAll("[data-split-counter]").forEach((c) => (c.textContent = String(i + 1).padStart(2, "0")));
        root.current!.querySelectorAll<HTMLElement>("[data-split-bar]").forEach((b) => (b.style.transform = `scaleY(${(i + 1) / els.length})`));
        const mark = itemMark?.[i] ?? -1;
        root.current!.querySelectorAll<HTMLElement>("[data-split-mark]").forEach((m, k) => m.toggleAttribute("data-active", k === mark));
      };
      els.forEach((el, i) => ScrollTrigger.create({ trigger: el, start: "top 60%", end: "bottom 60%", onToggle: (self) => self.isActive && activate(i) }));
      activate(0);

      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        els.forEach((el, i) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 90, rotate: i % 2 ? 2.5 : -2.5, scale: 0.94, clipPath: "inset(14% 0% 14% 0% round 2rem)" },
            { opacity: 1, y: 0, rotate: 0, scale: 1, clipPath: "inset(0% 0% 0% 0% round 2rem)", ease: "none", scrollTrigger: { trigger: el, start: "top 98%", end: "top 58%", scrub: 0.6 } },
          );
          gsap.from(el.querySelectorAll("[data-in]"), { y: 22, opacity: 0, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "top 45%", scrub: 0.6 } });
          gsap.to(el, { scale: 0.95, opacity: 0.5, ease: "none", immediateRender: false, scrollTrigger: { trigger: el, start: "bottom 32%", end: "bottom 2%", scrub: 0.6 } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const counter = (
    <div className="mt-8 flex items-end gap-4">
      <span className="report-display text-7xl leading-none text-primary tabular-nums">
        <span data-split-counter>01</span>
      </span>
      <span className="pb-2 text-sm text-muted-foreground">/ {total}</span>
      <span className="relative ml-auto h-24 w-px bg-border" aria-hidden>
        <span data-split-bar className="absolute inset-0 origin-top bg-primary transition-transform duration-500" />
      </span>
    </div>
  );

  return (
    <div ref={root} className="relative">
      <div className="sticky top-3 z-20 mx-auto mb-6 flex w-fit max-w-full items-center gap-3 rounded-full border border-border bg-card/90 px-4 py-2 text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase shadow-sm backdrop-blur lg:hidden">
        <span className="truncate">{label}</span>
        <span className="tabular-nums">
          <span data-split-counter className="text-primary">01</span> / {total}
        </span>
      </div>
      <div className={cn("grid gap-10 lg:gap-16", side === "left" ? "lg:grid-cols-[0.9fr_1.1fr]" : "lg:grid-cols-[1.1fr_0.9fr]")}>
        <aside className={cn("lg:sticky lg:top-24 lg:self-start", side === "right" && "lg:order-2")}>
          {aside}
          {marks && (
            <ol className="mt-8 hidden space-y-3 lg:block">
              {marks.map((m, i) => (
                <li
                  key={i}
                  data-split-mark
                  className="flex items-center gap-3 text-sm text-muted-foreground transition-all duration-500 data-[active]:translate-x-2 data-[active]:font-semibold data-[active]:text-foreground"
                >
                  <span className="h-px w-6 bg-current" aria-hidden />
                  {m}
                </li>
              ))}
            </ol>
          )}
          <div className="hidden lg:block">{counter}</div>
        </aside>
        <div className="flex flex-col gap-6">
          {items.map((it, i) => (
            <div key={i} data-split-item className="will-change-transform">
              {it}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────── Flip grid ─────────────
 * Cards start face-down (big number on the back) and flip over one after another while scrolling. */
export function FlipGrid({ children, backs }: { children: ReactNode; backs: ReactNode[] }) {
  const root = useRef<HTMLDivElement>(null);
  const cards = Children.toArray(children);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        gsap.utils.toArray<HTMLElement>("[data-flip]").forEach((el, i) => {
          gsap.fromTo(
            el,
            { rotateY: 180 },
            { rotateY: 0, ease: "power1.inOut", scrollTrigger: { trigger: el, start: `top ${92 - i * 6}%`, end: `top ${52 - i * 6}%`, scrub: 0.8 } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid gap-5 md:grid-cols-3 [perspective:1600px]">
      {cards.map((card, i) => (
        <div key={i} data-flip className="relative [transform-style:preserve-3d] will-change-transform">
          <div className="h-full [backface-visibility:hidden]">{card}</div>
          <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] motion-reduce:hidden" aria-hidden>
            {backs[i]}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────── Counter-scroll columns ─────────────
 * Desktop: two columns drift in opposite directions while each card slides in from its own side.
 * Phones: one column, cards alternate sliding in from the left and right. */
export function CounterScroll({ left, right, leftLabel, rightLabel }: { left: ReactNode[]; right: ReactNode[]; leftLabel: string; rightLabel: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION, desktop: "(min-width: 1024px)" }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;
        if (desktop) {
          const st = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8 };
          gsap.fromTo("[data-col='left']", { y: 120 }, { y: -120, ease: "none", scrollTrigger: st });
          gsap.fromTo("[data-col='right']", { y: -60 }, { y: 160, ease: "none", scrollTrigger: st });
        }
        gsap.utils.toArray<HTMLElement>("[data-col-card]").forEach((card) => {
          const fromLeft = card.dataset.colCard === "left";
          gsap.fromTo(
            card,
            { x: fromLeft ? -80 : 80, rotate: fromLeft ? -5 : 5, opacity: 0 },
            { x: 0, rotate: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: card, start: "top 95%", end: "top 60%", scrub: 0.6 } },
          );
          gsap.from(card.querySelectorAll("[data-in]"), { y: 18, opacity: 0, stagger: 0.1, ease: "none", scrollTrigger: { trigger: card, start: "top 85%", end: "top 50%", scrub: 0.6 } });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const column = (cards: ReactNode[], key: "left" | "right", label: string) => (
    <div data-col={key} className="flex flex-col gap-5 will-change-transform">
      <p className="text-[11px] font-medium tracking-[0.28em] text-primary uppercase">{label}</p>
      {cards.map((c, i) => (
        <div key={i} data-col-card={key}>
          {c}
        </div>
      ))}
    </div>
  );

  return (
    <div ref={root} className="grid gap-12 py-10 lg:grid-cols-2 lg:gap-10 lg:py-24">
      {column(left, "left", leftLabel)}
      {column(right, "right", rightLabel)}
    </div>
  );
}

/* ───────────── 3D carousel ─────────────
 * Pinned ring of cards; scrolling turns the ring, snapping card by card. Cards turning away fade. */
const CAROUSEL_CARD_W = "min(78vw,360px)";
export function Carousel3D({ children, label }: { children: ReactNode; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const cards = Children.toArray(children);
  const n = cards.length;
  const angle = 360 / Math.max(n, 3);
  // Ring radius as a multiple of the card width, with breathing room between cards.
  const depth = (1 / (2 * Math.tan(Math.PI / Math.max(n, 3)))) * 1.18;
  const radius = `calc(${CAROUSEL_CARD_W} * ${depth.toFixed(3)})`;

  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>("[data-ring-card]");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Plain list: drop the ring transforms set inline for the 3D layout.
        els.forEach((c) => (c.style.transform = "none"));
        return;
      }
      const paint = (rot: number) => {
        stage.current!.style.transform = `translateZ(calc(${radius} * -1)) rotateY(${rot}deg)`;
        els.forEach((c, i) => {
          const a = (((i * angle + rot) % 360) + 360) % 360;
          const d = Math.min(a, 360 - a);
          c.style.opacity = String(Math.max(0.12, 1 - d / 110));
        });
        const front = Math.round(-rot / angle);
        if (counter.current) counter.current.textContent = String(Math.min(n, Math.max(1, front + 1))).padStart(2, "0");
      };
      paint(0);

      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const state = { rot: 0 };
        gsap.to(state, {
          rot: -(n - 1) * angle,
          ease: "none",
          onUpdate: () => paint(state.rot),
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${n * 45}%`,
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-10 motion-reduce:min-h-0">
      <div className="mb-8 flex items-center gap-4 text-[11px] font-medium tracking-[0.25em] text-muted-foreground uppercase motion-reduce:hidden">
        <span>{label}</span>
        <span className="tabular-nums">
          <span ref={counter} className="text-primary">01</span> / {String(n).padStart(2, "0")}
        </span>
      </div>
      <div className="[perspective:1800px] motion-reduce:[perspective:none]">
        <div
          ref={stage}
          className="relative h-[min(62svh,500px)] [transform-style:preserve-3d] motion-reduce:h-auto motion-reduce:[transform:none]"
          style={{ width: CAROUSEL_CARD_W }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              data-ring-card
              className="absolute inset-0 [backface-visibility:hidden] motion-reduce:relative motion-reduce:mb-5 motion-reduce:[transform:none]"
              style={{ transform: `rotateY(${i * angle}deg) translateZ(${radius})` }}
            >
              {card}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-8 text-[11px] tracking-[0.25em] text-muted-foreground uppercase motion-reduce:hidden">Cuộn để xoay ↻</p>
    </div>
  );
}
