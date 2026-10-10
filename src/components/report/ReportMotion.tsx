"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * One scroll-motion engine for the whole report. Server-rendered markup opts in with data attributes:
 *   data-reveal          rise + unblur when entering the viewport (batched, staggered)
 *   data-split           heading words slide up from a line mask
 *   data-words           words light up one by one while scrolling (scrubbed)
 *   data-clip            image frame opens like a shutter while its media zooms out (scrubbed)
 *   data-parallax="0.3"  drifts against the scroll at the given speed
 *   data-hero / data-hero-media / data-hero-title   hero depth effect while scrolling away
 *   data-skew            skews with scroll velocity (marquees)
 *   data-tilt            3D tilt toward the pointer
 *   data-spotlight       soft light that follows the pointer (see .spotlight in globals.css)
 */
export default function ReportMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1024px)" }, (ctx) => {
      const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
      if (!motion) return;
      // No blur filters: they re-rasterise every frame and were a main source of scroll jank.

      // Hero entrance — held back while the intro curtain is still down
      const heroIn = () => {
        gsap.from("[data-hero-title] > *", { y: 60, opacity: 0, duration: 1.2, ease: "power4.out", stagger: 0.12, delay: 0.1 });
        gsap.from("[data-hero-media]", { scale: 1.12, opacity: 0, duration: 1.6, ease: "power3.out", delay: 0.2 });
      };
      if (document.documentElement.dataset.intro === "playing") window.addEventListener("lm:intro-lift", heroIn, { once: true });
      else heroIn();

      // Hero depth while scrolling away
      document.querySelectorAll<HTMLElement>("[data-hero]").forEach((hero) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
        tl.to(hero.querySelectorAll("[data-hero-media]"), { scale: 0.86, yPercent: 12, borderRadius: "3rem", ease: "none" }, 0)
          .to(hero.querySelectorAll("[data-hero-title]"), { yPercent: -35, opacity: 0.15, ease: "none" }, 0);
      });

      // Section reveals
      gsap.set("[data-reveal]", { opacity: 0, y: desktop ? 56 : 36 });
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 90%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, duration: desktop ? 1.1 : 0.8, ease: "power3.out", stagger: 0.1 }),
      });

      // Headings: words rise from masked lines
      document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
        // linesClass → masks get "split-line-mask", padded in globals.css so Vietnamese diacritics aren't clipped.
        const split = SplitText.create(el, { type: "lines,words", mask: "lines", linesClass: "split-line" });
        gsap.from(split.words, {
          yPercent: 115,
          duration: 1,
          ease: "power4.out",
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      // Reading reveal: words brighten as the paragraph scrolls through
      document.querySelectorAll<HTMLElement>("[data-words]").forEach((el) => {
        const split = SplitText.create(el, { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          { opacity: 1, ease: "none", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: true } },
        );
      });

      // Image shutters
      document.querySelectorAll<HTMLElement>("[data-clip]").forEach((frame) => {
        const media = frame.querySelector("[data-media]");
        const st = { trigger: frame, start: "top 92%", end: "top 30%", scrub: true };
        gsap.fromTo(frame, { clipPath: "inset(16% 14% 16% 14%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: st });
        if (media) gsap.fromTo(media, { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: st });
      });

      // Parallax drift
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = Number(el.dataset.parallax) || 0.2;
        gsap.fromTo(el, { yPercent: speed * 60 }, {
          yPercent: speed * -60,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      // Velocity skew for marquees
      const skewTargets = gsap.utils.toArray<HTMLElement>("[data-skew]");
      if (skewTargets.length) {
        const setSkew = gsap.quickTo(skewTargets, "skewX", { duration: 0.5, ease: "power3" });
        ScrollTrigger.create({ onUpdate: (self) => setSkew(gsap.utils.clamp(-12, 12, self.getVelocity() / -250)) });
      }
    });

    // Fonts and images change layout after load — recompute trigger positions.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);
    return () => {
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  });

  // Pointer effects: tilt and spotlight (skipped for reduced motion and touch-only devices)
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!fine.matches) return;

    function onMove(e: PointerEvent) {
      const target = e.target as HTMLElement | null;
      const spot = target?.closest<HTMLElement>("[data-spotlight]");
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      const tilt = target?.closest<HTMLElement>("[data-tilt]");
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
        if (el === tilt) {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(el, { rotateY: x * 10, rotateX: -y * 10, transformPerspective: 900, duration: 0.6, ease: "power3.out" });
        } else if (el.dataset.tilting) {
          gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "power3.out" });
        }
        el.dataset.tilting = el === tilt ? "1" : "";
      });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
