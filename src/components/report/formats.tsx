"use client";

import { Children, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "./extras";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MOTION = "(prefers-reduced-motion: no-preference)";
const pad = (n: number) => String(n).padStart(2, "0");

/* ───────────── Swipe deck (dating-app style) ─────────────
 * Pinned pile of cards. Scrolling swipes each one away: "myth" cards fly left under an ✕ stamp,
 * "truth" cards fly right under a ♡ stamp; the next card rises from below. The ✕ / ♡ buttons
 * swipe on tap too, the first card wiggles "swipe me" until you start, a counter tracks progress
 * and the glow behind the pile turns from grey (myths) to the archetype colour (truths). */
export function SwipeDeck({
  cards,
  noLabel,
  yesLabel,
}: {
  cards: { kind: "no" | "yes"; node: ReactNode }[];
  noLabel: string;
  yesLabel: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const lenis = useLenis();
  const total = cards.length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        const els = gsap.utils.toArray<HTMLElement>("[data-swipe-card]");
        const glowNo = root.current!.querySelector("[data-glow-no]");
        const glowYes = root.current!.querySelector("[data-glow-yes]");
        els.forEach((el, i) => gsap.set(el, { scale: 1 - Math.min(i, 3) * 0.04, y: Math.min(i, 3) * 14 }));
        const setPhase = (yes: boolean) => {
          gsap.to(glowYes, { opacity: yes ? 1 : 0, duration: 0.6 });
          gsap.to(glowNo, { opacity: yes ? 0 : 1, duration: 0.6 });
        };
        setPhase(els[0]?.dataset.swipeCard === "yes");

        // "Swipe me" wiggle on the first card until the deck starts moving.
        const wiggle = gsap.to(els[0]?.querySelector("[data-wiggle]") ?? [], {
          rotate: 2.5,
          x: 8,
          duration: 0.55,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          repeatDelay: 0.9,
        });

        let current = -1;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${els.length * 60}%`,
            scrub: 0.7,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (self.progress > 0.01 && wiggle.isActive()) wiggle.pause(0);
              const i = Math.min(els.length - 1, Math.floor(self.progress * (els.length - 0.4)));
              if (i !== current) {
                current = i;
                if (counter.current) counter.current.textContent = pad(i + 1);
                setPhase(els[i]?.dataset.swipeCard === "yes");
              }
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
        trigger.current = tl.scrollTrigger ?? null;
        els.slice(0, -1).forEach((el, i) => {
          const yes = el.dataset.swipeCard === "yes";
          const at = i + 0.5; // read first, then swipe
          tl.to(el, { rotate: yes ? 4 : -4, x: yes ? 24 : -24, duration: 0.15, ease: "power1.out" }, at - 0.1) // lean before the throw
            .to(el.querySelector(yes ? "[data-stamp-yes]" : "[data-stamp-no]"), { opacity: 1, scale: 1, duration: 0.2 }, at)
            .to(root.current!.querySelector(yes ? "[data-btn-yes]" : "[data-btn-no]"), { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1 }, at)
            .to(el, { xPercent: yes ? 140 : -140, rotate: yes ? 22 : -22, duration: 0.45, ease: "power2.in" }, at + 0.15);
          els.slice(i + 1, i + 5).forEach((next, k) => tl.to(next, { scale: 1 - k * 0.04, y: k * 14, duration: 0.4, ease: "power2.out" }, at + 0.25));
        });
        tl.to({}, { duration: 0.5 });
        return () => wiggle.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Tapping ✕ / ♡ scrolls exactly one card further, so the swipe plays out.
  const advance = () => {
    haptic();
    const st = trigger.current;
    if (!st) return;
    const step = (st.end - st.start) / (total - 0.4);
    const next = Math.min(st.end, st.start + (Math.floor((window.scrollY - st.start) / step) + 1) * step + step * 0.55);
    if (lenis) lenis.scrollTo(next, { duration: 0.9 });
    else window.scrollTo({ top: next, behavior: "smooth" });
  };

  return (
    <div ref={root} className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-10 motion-reduce:min-h-0">
      <div aria-hidden className="pointer-events-none absolute inset-0 motion-reduce:hidden">
        <div data-glow-no className="absolute top-1/2 left-1/2 size-[min(120vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--muted-foreground)_16%,transparent),transparent_65%)]" />
        <div data-glow-yes className="absolute top-1/2 left-1/2 size-[min(120vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--primary)_28%,transparent),transparent_65%)] opacity-0" />
      </div>

      <div className="relative mb-6 flex w-[min(88vw,440px)] items-center gap-3 text-[11px] font-medium tracking-[0.25em] text-muted-foreground uppercase motion-reduce:hidden">
        <span>Quẹt</span>
        <span className="relative h-px flex-1 bg-border">
          <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-primary" />
        </span>
        <span className="tabular-nums">
          <span ref={counter} className="text-primary">01</span> / {pad(total)}
        </span>
      </div>

      <div className="relative grid w-[min(88vw,440px)] motion-reduce:gap-5">
        {cards.map((c, i) => (
          <div
            key={i}
            data-swipe-card={c.kind}
            className="relative col-start-1 row-start-1 origin-bottom will-change-transform motion-reduce:col-auto motion-reduce:row-auto"
            style={{ zIndex: cards.length - i }}
          >
            <div data-wiggle className="h-full origin-bottom">
              {c.node}
            </div>
            <span
              data-stamp-no
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 scale-150 rounded-2xl border-4 border-current bg-card/90 px-5 py-2 text-2xl font-bold tracking-widest whitespace-nowrap text-muted-foreground uppercase opacity-0"
              aria-hidden
            >
              ✕ Ảo tưởng
            </span>
            <span
              data-stamp-yes
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 scale-150 rounded-2xl border-4 border-current bg-card/90 px-5 py-2 text-2xl font-bold tracking-widest whitespace-nowrap text-primary uppercase opacity-0"
              aria-hidden
            >
              ♡ Đây rồi
            </span>
          </div>
        ))}
      </div>

      <div className="relative z-20 mt-14 flex items-center gap-8 motion-reduce:hidden">
        <button type="button" onClick={advance} className="group flex flex-col items-center gap-2 text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          <span data-btn-no className="grid size-14 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition group-hover:-translate-y-0.5 group-active:scale-90">
            <X className="size-6" />
          </span>
          {noLabel}
        </button>
        <button type="button" onClick={advance} className="group flex flex-col items-center gap-2 text-[11px] tracking-[0.2em] text-primary uppercase">
          <span data-btn-yes className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition group-hover:-translate-y-0.5 group-active:scale-90">
            <Heart className="size-6 fill-current" />
          </span>
          {yesLabel}
        </button>
      </div>
    </div>
  );
}

/* ───────────── Chat thread ─────────────
 * A question from La Methode, then "typing…" and the replies pop in one by one as you scroll. */
export function ChatScene({ threads, botName }: { threads: { prompt: ReactNode; replies: ReactNode[] }[]; botName: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        gsap.utils.toArray<HTMLElement>("[data-bubble]").forEach((b) => {
          const typing = b.parentElement?.querySelector("[data-typing]");
          const mine = b.dataset.bubble === "me";
          const tl = gsap.timeline({ scrollTrigger: { trigger: b, start: "top 88%", toggleActions: "play none none reverse" } });
          if (typing) tl.fromTo(typing, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }).to(typing, { autoAlpha: 0, duration: 0.15 }, "+=0.3");
          tl.from(b, { autoAlpha: 0, y: 18, scale: 0.85, transformOrigin: mine ? "100% 100%" : "0% 100%", duration: 0.45, ease: "back.out(1.8)" }, typing ? "-=0.1" : 0);
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mx-auto w-full max-w-xl space-y-12">
      {threads.map((t, ti) => (
        <div key={ti} className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_14px_32px_-18px_color-mix(in_srgb,var(--primary)_45%,transparent)]">
          <div className="flex items-center gap-3 border-b border-border px-5 py-3">
            <span className="report-display grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">LM</span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{botName}</p>
              <p className="text-[11px] text-muted-foreground">đang hoạt động</p>
            </div>
            <span className="ml-auto text-[11px] tracking-[0.2em] text-primary uppercase">Tình huống {pad(ti + 1)}</span>
          </div>
          <div className="space-y-3 px-4 py-6 sm:px-6">
            <div data-bubble="bot" className="max-w-[85%] rounded-2xl rounded-bl-md bg-secondary px-4 py-3 text-[15px] leading-relaxed">
              {t.prompt}
            </div>
            {t.replies.map((r, i) => (
              <div key={i} className="relative flex flex-col items-end">
                <div data-typing className="typing-dots invisible absolute top-2 right-3 z-10 rounded-full bg-secondary px-3 py-2 text-primary" aria-hidden>
                  <span /><span /><span />
                </div>
                <div data-bubble="me" className="max-w-[88%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-[15px] leading-relaxed text-primary-foreground">
                  {r}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────── Sticky-note board ─────────────
 * Notes pinned at slight angles drop onto the board with a little bounce. */
export function NotesBoard({ notes }: { notes: { tone: "a" | "b"; node: ReactNode }[] }) {
  const root = useRef<HTMLDivElement>(null);
  const tilt = (i: number) => [-3, 2.5, -1.5, 3, -2.5, 1.5, -2, 2][i % 8];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        gsap.utils.toArray<HTMLElement>("[data-note]").forEach((n, i) => {
          gsap.from(n, {
            y: -90,
            scale: 1.18,
            rotate: tilt(i) + (i % 2 ? 9 : -9),
            autoAlpha: 0,
            duration: 0.8,
            ease: "bounce.out",
            scrollTrigger: { trigger: n, start: "top 88%", toggleActions: "play none none reverse" },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {notes.map((n, i) => (
        <div key={i} data-note style={{ rotate: `${tilt(i)}deg` }} className={cn("relative", i % 3 === 1 && "lg:mt-10", i % 3 === 2 && "lg:mt-4")}>
          <span className="absolute -top-2.5 left-1/2 z-10 size-5 -translate-x-1/2 rounded-full bg-primary shadow-[0_3px_6px_rgba(0,0,0,0.18)] ring-2 ring-card" aria-hidden />
          <div
            className={cn(
              "min-h-44 rounded-sm p-6 pt-7 shadow-[0_18px_30px_-18px_rgba(0,0,0,0.35)]",
              n.tone === "a" ? "bg-[color-mix(in_srgb,var(--secondary)_85%,white)]" : "bg-[color-mix(in_srgb,var(--primary)_14%,var(--card))]",
            )}
          >
            {n.node}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────── Checklist ─────────────
 * Each row ticks itself and its title gets a highlighter stroke as it passes through the screen. */
export function ChecklistScene({ children }: { children: ReactNode }) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        gsap.utils.toArray<HTMLElement>("[data-check-row]").forEach((row) => {
          const st = { trigger: row, start: "top 85%", end: "top 45%", scrub: 0.6 };
          gsap.from(row, { x: -40, autoAlpha: 0, ease: "none", scrollTrigger: st });
          gsap.fromTo(row.querySelector("[data-check] path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: st });
          gsap.fromTo(row.querySelector("[data-check] rect"), { fill: "transparent" }, { fill: "var(--primary)", ease: "none", scrollTrigger: st });
          gsap.to(row.querySelector(".marker-sweep"), { backgroundSize: "100% 100%", ease: "none", scrollTrigger: st });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="space-y-4">
      {Children.toArray(children).map((c, i) => (
        <li key={i} data-check-row>
          {c}
        </li>
      ))}
    </ol>
  );
}

/** Checkbox drawn by ChecklistScene. */
export function CheckMark() {
  return (
    <svg data-check viewBox="0 0 28 28" className="size-7 shrink-0" aria-hidden>
      <rect x="1.5" y="1.5" width="25" height="25" rx="8" stroke="var(--primary)" strokeWidth="1.5" fill="var(--primary)" />
      <path d="M8 14.5l4 4 8-9" fill="none" stroke="var(--primary-foreground)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" />
    </svg>
  );
}

/* ───────────── Spotlight list ─────────────
 * Large type, one line in focus at a time: the row crossing the middle of the screen lights up. */
export function SpotlightList({ children }: { children: ReactNode }) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        gsap.utils.toArray<HTMLElement>("[data-spot-row]").forEach((row) => {
          gsap.set(row, { opacity: 0.22 });
          ScrollTrigger.create({
            trigger: row,
            start: "top 62%",
            end: "bottom 38%",
            onToggle: (self) =>
              gsap.to(row, { opacity: self.isActive ? 1 : 0.22, x: self.isActive ? 12 : 0, duration: 0.5, ease: "power2.out" }),
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="divide-y divide-border">
      {Children.toArray(children).map((c, i) => (
        <li key={i} data-spot-row className="py-8 sm:py-10">
          {c}
        </li>
      ))}
    </ol>
  );
}

/* ───────────── Staircase (level up) ─────────────
 * Steps climb diagonally; scrolling walks the camera up one step at a time, the active step glows
 * and a level badge counts up. */
export function Staircase({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const level = useRef<HTMLSpanElement>(null);
  const steps = Children.toArray(children);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION, desktop: "(min-width: 768px)" }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;
        const els = gsap.utils.toArray<HTMLElement>("[data-step]");
        const dx = desktop ? 70 : 14;
        const gap = 28;
        // Lay the steps out as a rising staircase.
        let y = 0;
        const ys = els.map((el) => {
          const top = y;
          y -= el.offsetHeight + gap;
          return top;
        });
        const look = (i: number, active: number) => (i === active ? { opacity: 1, scale: 1 } : Math.abs(i - active) === 1 ? { opacity: 0.32, scale: 0.94 } : { opacity: 0, scale: 0.9 });
        els.forEach((el, i) => gsap.set(el, { position: "absolute", left: 0, right: 0, x: i * dx, y: ys[i], ...look(i, 0) }));
        const stage = root.current!.querySelector<HTMLElement>("[data-stair-stage]")!;
        gsap.set(stage, { height: els[0].offsetHeight });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${els.length * 55}%`,
            scrub: 0.7,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (level.current) level.current.textContent = String(Math.min(els.length, Math.round(self.progress * (els.length - 1)) + 1));
            },
          },
        });
        els.slice(1).forEach((_, k) => {
          const active = k + 1;
          tl.to(stage, { x: -active * dx, y: -ys[active], duration: 1, ease: "power2.inOut" }, k);
          els.forEach((el, i) => {
            if (Math.abs(i - active) <= 2) tl.to(el, { ...look(i, active), duration: 0.6 }, k + 0.25);
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-4 py-10 sm:px-6 motion-reduce:min-h-0">
      <div className="relative z-20 mx-auto mb-4 flex w-full max-w-3xl items-center gap-3 motion-reduce:hidden">
        <span className="rounded-full bg-primary px-4 py-1.5 text-[12px] font-semibold tracking-[0.2em] text-primary-foreground uppercase">
          Level <span ref={level}>1</span> / {steps.length}
        </span>
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">Leo lên từng bậc ↗</span>
      </div>
      <div className="relative mx-auto h-[min(72svh,640px)] w-full max-w-3xl overflow-hidden [mask-image:linear-gradient(transparent,#000_14%,#000_86%,transparent)] motion-reduce:h-auto motion-reduce:overflow-visible motion-reduce:[mask-image:none]">
        <div data-stair-stage className="absolute inset-x-0 top-[38%] will-change-transform motion-reduce:relative motion-reduce:top-0 motion-reduce:space-y-5">
          {steps.map((s, i) => (
            <div key={i} data-step className="will-change-transform">
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
