"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Ambient } from "@/lib/report/themes";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Deterministic 0–1 value so server and client render the same decorations.
function seeded(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  // Rounded so server and browser serialise identical style strings (no hydration mismatch).
  return Math.round((x - Math.floor(x)) * 1000) / 1000;
}
const pct = (n: number) => `${(seeded(n) * 100).toFixed(2)}%`;

export function AmbientLayer({ variant }: { variant: Ambient }) {
  const items = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className="amb-layer" aria-hidden>
      {variant === "petals" &&
        items.map((i) => (
          <span
            key={i}
            className="amb-petal"
            style={{ left: pct(i), animationDuration: `${(14 + seeded(i + 1) * 12).toFixed(2)}s`, animationDelay: `-${(seeded(i + 2) * 20).toFixed(2)}s`, scale: (0.6 + seeded(i + 3) * 0.8).toFixed(2) }}
          />
        ))}
      {variant === "sparkles" &&
        [...items, ...items.map((i) => i + 20)].map((i) => (
          <span key={i} className="amb-star" style={{ left: pct(i), top: pct(i + 40), animationDuration: `${(2.5 + seeded(i + 5) * 3).toFixed(2)}s`, animationDelay: `-${(seeded(i + 6) * 4).toFixed(2)}s` }} />
        ))}
      {variant === "rays" && <span className="amb-rays" />}
      {variant === "confetti" &&
        items.map((i) => (
          <span
            key={i}
            className="amb-confetti"
            style={{
              left: pct(i + 9),
              background: i % 3 === 0 ? "var(--primary)" : i % 3 === 1 ? "var(--secondary)" : "color-mix(in srgb, var(--primary) 40%, #ffd166)",
              animationDuration: `${(10 + seeded(i + 4) * 10).toFixed(2)}s`,
              animationDelay: `-${(seeded(i + 8) * 18).toFixed(2)}s`,
            }}
          />
        ))}
      {variant === "blobs" && (
        <>
          <span className="amb-blob" style={{ left: "-10%", top: "-10%", color: "var(--primary)" }} />
          <span className="amb-blob" style={{ right: "-15%", top: "20%", color: "var(--secondary)", animationDelay: "-6s" }} />
        </>
      )}
      {variant === "grid" && <span className="amb-gridlines" />}
      {variant === "linen" && <span className="amb-linen" />}
      {variant === "bokeh" &&
        items.slice(0, 9).map((i) => {
          const size = Math.round(80 + seeded(i + 11) * 220);
          return (
            <span
              key={i}
              className="amb-bokeh"
              style={{ left: pct(i + 13), top: pct(i + 17), width: size, height: size, animationDuration: `${(7 + seeded(i) * 6).toFixed(2)}s`, animationDelay: `-${(seeded(i + 2) * 6).toFixed(2)}s` }}
            />
          );
        })}
      {variant === "scribble" && (
        <svg className={cn("amb-scribble", "absolute inset-0 h-full w-full")} viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M40 120 C 220 40, 320 220, 520 140 S 820 40, 980 160 S 1160 260, 1180 200" />
          <path d="M60 700 C 260 600, 300 760, 520 680 S 860 560, 1140 690" style={{ animationDelay: "1.2s" }} />
          <path d="M900 60 l 40 60 l 30 -50 l 40 70" style={{ animationDelay: "2s" }} />
        </svg>
      )}
    </div>
  );
}

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return <motion.div className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-primary" style={{ scaleX }} aria-hidden />;
}

export function ReactionTabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  return (
    <Tabs defaultValue={tabs[0]?.id}>
      <div data-lenis-prevent className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <TabsList variant="line" className="h-auto w-max gap-2 sm:gap-4">
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="px-2 py-2 text-[13px] whitespace-nowrap sm:text-sm">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((t) => (
        <TabsContent key={t.id} value={t.id} className="pt-6">
          {t.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function AccordionList({
  items,
  className,
  itemClassName,
}: {
  items: { id: string; title: ReactNode; content: ReactNode }[];
  className?: string;
  itemClassName?: string;
}) {
  return (
    <Accordion className={className} defaultValue={[items[0]?.id]}>
      {items.map((it) => (
        <AccordionItem key={it.id} value={it.id} className={itemClassName}>
          <AccordionTrigger className="py-4 text-left text-[15px] hover:no-underline sm:text-base">{it.title}</AccordionTrigger>
          <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{it.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/** Desktop: pins the section and slides the life stages horizontally. Mobile: plain vertical stack. */
export function PinnedJourney({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - el.clientWidth;
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: true, pin: true, invalidateOnRefresh: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="lg:flex lg:h-screen lg:items-center lg:overflow-hidden">
      <div ref={track} className="flex flex-col gap-6 lg:w-full lg:flex-row lg:gap-8 lg:pr-[20vw]">
        {children}
      </div>
    </div>
  );
}
