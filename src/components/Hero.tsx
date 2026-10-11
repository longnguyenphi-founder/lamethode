"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Sparkles } from "lucide-react";

gsap.registerPlugin(useGSAP);

export default function Hero() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".hero-item", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.15,
      });
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32"
    >
      <p className="hero-item mb-4 text-xs uppercase tracking-[0.3em] text-brand">
        Bienvenue
      </p>
      <h1 className="hero-item font-serif text-5xl font-medium leading-tight sm:text-7xl">
        La Methode
      </h1>
      <p className="hero-item mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
        Phương pháp của sự tinh tế — nơi chất lượng và sự chỉn chu gặp nhau.
      </p>
      <div className="hero-item mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/quiz"
          className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground shadow-[0_10px_30px_-12px_rgba(217,150,127,0.7)] transition hover:bg-primary/85"
        >
          <Sparkles className="size-4 text-brand" aria-hidden />
          Làm bài khảo sát
        </Link>
        <Link
          href="/about"
          className="rounded-full border border-border px-7 py-3 text-sm transition-colors hover:border-foreground"
        >
          Khám phá
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-border px-7 py-3 text-sm transition-colors hover:border-foreground"
        >
          Liên hệ
        </Link>
      </div>
    </section>
  );
}
