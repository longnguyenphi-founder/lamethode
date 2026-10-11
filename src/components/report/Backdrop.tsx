"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** SVG tile as a CSS url(); white = visible in the mask, so the theme colour shows through. */
const tile = (size: number, body: string) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${body}</svg>`,
  )}")`;

const flower = (x: number, y: number, s: number) =>
  `<g transform='translate(${x} ${y}) scale(${s})'>${[0, 72, 144, 216, 288]
    .map((a) => `<ellipse cx='0' cy='-7' rx='3.6' ry='7' transform='rotate(${a})' fill='white'/>`)
    .join("")}<circle r='2.4' fill='white'/></g>`;
const heart = (x: number, y: number, s: number) =>
  `<path transform='translate(${x} ${y}) scale(${s})' d='M0 6 C0 -2 10 -2 10 6 C10 -2 20 -2 20 6 C20 13 10 18 10 22 C10 18 0 13 0 6 Z' fill='white'/>`;
const star = (x: number, y: number, r: number) =>
  `<path d='M${x} ${y - r} L${x + r * 0.28} ${y - r * 0.28} L${x + r} ${y} L${x + r * 0.28} ${y + r * 0.28} L${x} ${y + r} L${x - r * 0.28} ${y + r * 0.28} L${x - r} ${y} L${x - r * 0.28} ${y - r * 0.28} Z' fill='white'/>`;
const fan = (dx: number, dy: number) =>
  `<g transform='translate(${dx} ${dy})' fill='none' stroke='white' stroke-width='1.4'><path d='M0 40 A40 40 0 0 1 80 40'/><path d='M12 40 A28 28 0 0 1 68 40'/><path d='M24 40 A16 16 0 0 1 56 40'/></g>`;
const leaf = (x: number, y: number, r: number) =>
  `<path transform='translate(${x} ${y}) rotate(${r})' d='M0 0 C6 -10 18 -10 22 0 C18 10 6 10 0 0 Z M0 0 L22 0' fill='white' stroke='white' stroke-width='0.6'/>`;
const contour = (s: number) =>
  `<path transform='translate(80 80) scale(${s}) translate(-80 -80)' d='M80 22 C124 20 146 62 128 100 C110 140 52 140 34 104 C16 68 38 24 80 22 Z' fill='none' stroke='white' stroke-width='${1.3 / s}'/>`;

export const PATTERNS: Record<string, { image: string; size: number; opacity: number }> = {
  innocent: { image: tile(120, flower(30, 30, 1) + flower(88, 82, 0.6) + "<circle cx='92' cy='26' r='1.8' fill='white'/>"), size: 120, opacity: 0.09 },
  sage: { image: tile(28, "<circle cx='14' cy='14' r='1.3' fill='white'/>"), size: 28, opacity: 0.16 },
  lover: { image: tile(96, heart(14, 18, 1) + heart(64, 62, 0.6)), size: 96, opacity: 0.08 },
  ruler: { image: tile(80, fan(0, 0) + fan(-40, 40) + fan(40, 40)), size: 80, opacity: 0.1 },
  magician: { image: tile(120, star(24, 28, 7) + star(84, 70, 4.5) + "<circle cx='46' cy='96' r='1.6' fill='white'/><circle cx='104' cy='16' r='1.2' fill='white'/>"), size: 120, opacity: 0.14 },
  jester: { image: tile(44, "<circle cx='11' cy='11' r='4' fill='white'/><circle cx='33' cy='33' r='4' fill='white'/>"), size: 44, opacity: 0.08 },
  hero: { image: tile(64, "<path d='M4 42 L32 22 L60 42' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"), size: 64, opacity: 0.08 },
  rebel: { image: tile(36, "<path d='M-4 40 L40 -4' stroke='white' stroke-width='1.6'/><circle cx='27' cy='27' r='1.5' fill='white'/>"), size: 36, opacity: 0.08 },
  creator: { image: tile(140, "<path d='M14 34 q 16 -22 32 0 t 32 0 t 32 0' fill='none' stroke='white' stroke-width='2.2' stroke-linecap='round'/><path d='M40 104 q 12 -16 24 0 t 24 0' fill='none' stroke='white' stroke-width='2' stroke-linecap='round'/><circle cx='118' cy='96' r='3' fill='white'/><circle cx='20' cy='112' r='2' fill='white'/>"), size: 140, opacity: 0.1 },
  everyman: { image: tile(40, "<rect width='20' height='40' fill='white' opacity='0.5'/><rect width='40' height='20' fill='white' opacity='0.5'/>"), size: 40, opacity: 0.07 },
  caregiver: { image: tile(110, leaf(14, 30, -30) + leaf(66, 80, 25) + leaf(76, 22, 160)), size: 110, opacity: 0.1 },
  explorer: { image: tile(160, [1, 0.78, 0.56, 0.34].map(contour).join("")), size: 160, opacity: 0.12 },
};

/**
 * Fixed full-page pattern unique to each archetype. It drifts a little slower than the content
 * (transform only, compositor-friendly) and fades out toward the edges of the screen.
 */
export default function Backdrop({ slug }: { slug: string }) {
  const layer = useRef<HTMLDivElement>(null);
  const p = PATTERNS[slug];

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(layer.current, { y: () => -window.innerHeight * 0.6, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.5 } });
    });
    return () => mm.revert();
  });

  if (!p) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        ref={layer}
        className="absolute inset-x-0 top-0 h-[180%] bg-primary will-change-transform"
        style={{
          opacity: p.opacity,
          maskImage: p.image,
          WebkitMaskImage: p.image,
          maskSize: `${p.size}px ${p.size}px`,
          WebkitMaskSize: `${p.size}px ${p.size}px`,
          maskRepeat: "repeat",
          WebkitMaskRepeat: "repeat",
        }}
      />
      {/* Soft vignette so the pattern stays a texture and never fights the text */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_45%,transparent_35%,var(--background)_100%)]" />
    </div>
  );
}
