"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const steps = [
  { title: "Lắng nghe", text: "Hiểu rõ mong muốn và câu chuyện của bạn." },
  { title: "Thiết kế", text: "Phác hoạ giải pháp riêng, tinh gọn và có chủ đích." },
  { title: "Hoàn thiện", text: "Chăm chút từng chi tiết cho đến khi trọn vẹn." },
];

// Apple-style pinned section: the panel stays fixed while each step
// fades in as the user scrolls.
export default function ScrollStory() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(".story-step");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: `+=${items.length * 100}%`,
          scrub: true,
          pin: true,
        },
      });
      items.forEach((item, i) => {
        if (i > 0) tl.from(item, { opacity: 0, y: 60, duration: 1 });
        if (i < items.length - 1) tl.to(item, { opacity: 0, y: -60, duration: 1 }, "+=0.5");
      });
    },
    { scope: container },
  );

  return (
    <section ref={container} className="relative h-screen overflow-hidden border-y border-border">
      <div className="mx-auto flex h-full max-w-4xl items-center justify-center px-4">
        {steps.map((s, i) => (
          <div key={s.title} className="story-step absolute text-center">
            <p className="font-serif text-sm text-brand">0{i + 1}</p>
            <h2 className="mt-3 font-serif text-5xl sm:text-7xl">{s.title}</h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
