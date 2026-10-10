"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const pad = (n: number) => String(n).padStart(2, "0");
/** A tiny tap on phones that support it. */
export const haptic = (ms = 12) => {
  try {
    navigator.vibrate?.(ms);
  } catch {}
};

/* ───────────── Intro reveal ─────────────
 * "Decoding your aura": a glyph spins in, the archetype name types itself, then the curtain lifts.
 * Tap, scroll or swipe to skip; plays once per session; skipped for reduced motion, deep links
 * (#section) and when the page hydrates late (slow network) so it never holds the reader back. */
export function IntroReveal({ english, name, ornament }: { english: string; name: string; ornament: string }) {
  const root = useRef<HTMLDivElement>(null);
  const playing = useRef(false);
  const lenis = useLenis();

  const lenisRef = useRef(lenis);
  // Lenis can become available a tick later: keep scrolling locked while the intro plays.
  useEffect(() => {
    lenisRef.current = lenis;
    if (playing.current) lenis?.stop();
  }, [lenis]);

  useGSAP(
    () => {
      const el = root.current!;
      const key = `lm-intro-${english}`;
      let seen = false;
      try {
        seen = sessionStorage.getItem(key) === "1";
      } catch {}
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // The hero's own entrance starts as the curtain lifts (ReportMotion listens for this).
      const lift = () => {
        delete document.documentElement.dataset.intro;
        window.dispatchEvent(new Event("lm:intro-lift"));
      };
      const finish = () => {
        el.style.display = "none";
        playing.current = false;
        lenisRef.current?.start();
      };
      // Hydrating this late means the reader has already been looking at the page — do not cover it again.
      const late = performance.now() > 3000;
      if (seen || reduced || late || window.location.hash) {
        lift();
        finish();
        return;
      }
      playing.current = true;
      el.style.animation = "none"; // JS is in charge now — cancel the CSS failsafe
      document.documentElement.dataset.intro = "playing";
      lenisRef.current?.stop();
      const tl = gsap.timeline({
        onComplete: () => {
          try {
            sessionStorage.setItem(key, "1");
          } catch {}
          finish();
        },
      });
      tl.from("[data-intro-glyph]", { scale: 0, rotate: -120, duration: 0.7, ease: "back.out(2)" })
        .from("[data-intro-line]", { opacity: 0, y: 10, duration: 0.4 }, "-=0.2")
        .from("[data-intro-char]", { yPercent: 110, opacity: 0, stagger: 0.035, duration: 0.5, ease: "power3.out" }, "-=0.1")
        .fromTo("[data-intro-name]", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power2.inOut" }, "-=0.25")
        .call(lift, undefined, "+=0.35")
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "power4.inOut" });
      const skip = () => {
        if (playing.current) tl.progress(1);
      };
      // Any intent to scroll (trackpad, wheel, swipe, keys) skips straight to the page.
      const opts = { passive: true } as const;
      el.addEventListener("click", skip);
      window.addEventListener("wheel", skip, opts);
      window.addEventListener("touchmove", skip, opts);
      window.addEventListener("keydown", skip);
      return () => {
        el.removeEventListener("click", skip);
        window.removeEventListener("wheel", skip);
        window.removeEventListener("touchmove", skip);
        window.removeEventListener("keydown", skip);
        // Never leave scrolling locked if this unmounts mid-intro.
        if (playing.current) {
          playing.current = false;
          lenisRef.current?.start();
        }
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="intro-failsafe fixed inset-0 z-[100] grid cursor-pointer place-items-center bg-background motion-reduce:hidden"
      style={{ clipPath: "inset(0 0 0% 0)" }}
      aria-hidden
    >
      <div className="text-center">
        <p data-intro-glyph className="mx-auto grid size-16 place-items-center rounded-full border border-primary/40 text-3xl text-primary">
          {ornament}
        </p>
        <p data-intro-line className="mt-6 text-[11px] font-medium tracking-[0.35em] text-muted-foreground uppercase">
          Đang giải mã hào quang của bạn…
        </p>
        <p className="report-display mt-4 overflow-hidden text-[clamp(2.4rem,9vw,5rem)] leading-tight">
          {english.split("").map((c, i) => (
            <span key={i} data-intro-char className="inline-block whitespace-pre">
              {c}
            </span>
          ))}
        </p>
        <p data-intro-name className="report-script mt-1 text-[clamp(1.4rem,5vw,2.4rem)] text-primary">
          {name}
        </p>
        <p className="mt-10 text-[10px] tracking-[0.3em] text-muted-foreground/70 uppercase">Chạm hoặc cuộn để bỏ qua</p>
      </div>
    </div>
  );
}

/* ───────────── Chapter dock ─────────────
 * Floating pill at the bottom: current chapter + progress dots; tap to open the chapter list and
 * jump. It hides while you scroll down and comes back when you scroll up or pause. */
export function ChapterDock({ chapters, ornament }: { chapters: string[]; ornament: string }) {
  const dock = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>("[data-chapter]");
      els.forEach((el, i) =>
        ScrollTrigger.create({ trigger: el, start: "top 55%", onEnter: () => setActive(i), onLeaveBack: () => setActive(i - 1) }),
      );

      let pastHero = false;
      let hiddenByScroll = false;
      let idle: ReturnType<typeof setTimeout> | undefined;
      const apply = () => gsap.to(dock.current, { yPercent: pastHero && !hiddenByScroll ? 0 : 180, autoAlpha: pastHero && !hiddenByScroll ? 1 : 0, duration: 0.45, ease: "power3.out" });
      gsap.set(dock.current, { yPercent: 180, autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: "[data-hero]",
        start: "bottom 40%",
        onEnter: () => ((pastHero = true), apply()),
        onLeaveBack: () => ((pastHero = false), apply()),
      });
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const hide = self.direction === 1 && Math.abs(self.getVelocity()) > 250;
          if (hide !== hiddenByScroll && (hide || self.direction === -1)) {
            hiddenByScroll = hide;
            apply();
          }
          clearTimeout(idle);
          idle = setTimeout(() => {
            if (hiddenByScroll) {
              hiddenByScroll = false;
              apply();
            }
          }, 900);
        },
      });
      return () => clearTimeout(idle);
    },
  );

  const jump = (i: number) => {
    haptic();
    setOpen(false);
    const el = i < 0 ? null : document.querySelectorAll<HTMLElement>("[data-chapter]")[i];
    if (lenis) lenis.scrollTo(el ?? 0, { duration: 1.4 });
    else if (el) el.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div ref={dock} className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2" style={{ visibility: "hidden" }}>
      {open && (
        <ol className="absolute bottom-full left-1/2 mb-3 w-[min(84vw,300px)] -translate-x-1/2 overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)]">
          {chapters.map((c, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => jump(i)}
                className={cn("flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm transition hover:bg-secondary", i === active && "bg-secondary font-semibold")}
              >
                <span className="report-display w-6 text-primary">{pad(i + 1)}</span>
                {c}
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => jump(-1)} className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-sm text-muted-foreground transition hover:bg-secondary">
              <ChevronUp className="size-4" /> Lên đầu trang
            </button>
          </li>
        </ol>
      )}
      <button
        type="button"
        onClick={() => {
          haptic(8);
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-label="Danh sách chương"
        className="flex items-center gap-3 rounded-full border border-border bg-card/95 py-2 pr-4 pl-3 text-[12px] whitespace-nowrap shadow-[0_12px_30px_-14px_rgba(0,0,0,0.35)]"
      >
        <span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">{ornament}</span>
        <span className="max-w-[46vw] truncate font-medium">
          {active < 0 ? "Mở đầu" : `Chương ${pad(active + 1)} · ${chapters[active]}`}
        </span>
        <span className="flex gap-1" aria-hidden>
          {chapters.map((_, i) => (
            <span key={i} className={cn("size-1.5 rounded-full transition-all", i <= active ? "bg-primary" : "bg-primary/25", i === active && "w-4")} />
          ))}
        </span>
      </button>
    </div>
  );
}

