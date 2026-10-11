import type { Metadata } from "next";
import { Sparkles, Gem, Layers, Globe2 } from "lucide-react";
import Scene3DLazy from "@/components/three/Scene3DLazy";
import ScrollStory from "@/components/ScrollStory";
import { TextAnimate } from "@/components/ui/text-animate";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Marquee } from "@/components/ui/marquee";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Iphone } from "@/components/ui/iphone";
import { Globe } from "@/components/ui/globe";

export const metadata: Metadata = { title: "Showcase" };

const stats = [
  { value: 120, suffix: "+", label: "Khách hàng" },
  { value: 98, suffix: "%", label: "Hài lòng" },
  { value: 8, suffix: " năm", label: "Kinh nghiệm" },
];

const words = ["Élégance", "Précision", "Harmonie", "Savoir-faire", "Raffinement", "Équilibre"];

const features = [
  {
    Icon: Sparkles,
    name: "Tinh tế",
    description: "Từng chi tiết được chăm chút.",
    href: "/about",
    cta: "Tìm hiểu",
    className: "col-span-3 lg:col-span-1",
    background: <DotPattern className="opacity-60 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]" />,
  },
  {
    Icon: Globe2,
    name: "Vươn xa",
    description: "Phục vụ khách hàng ở nhiều quốc gia.",
    href: "/about",
    cta: "Tìm hiểu",
    className: "col-span-3 lg:col-span-2",
    background: <Globe className="top-0 h-[600px] w-[600px] opacity-70 [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)]" />,
  },
  {
    Icon: Layers,
    name: "Phương pháp",
    description: "Quy trình rõ ràng, có hệ thống.",
    href: "/about",
    cta: "Tìm hiểu",
    className: "col-span-3 lg:col-span-2",
    background: <div className="absolute inset-0 bg-gradient-to-br from-brand/15 to-transparent" />,
  },
  {
    Icon: Gem,
    name: "Cá nhân hoá",
    description: "Giải pháp dành riêng cho bạn.",
    href: "/contact",
    cta: "Liên hệ",
    className: "col-span-3 lg:col-span-1",
    background: <div className="absolute inset-0 bg-gradient-to-tl from-muted to-transparent" />,
  },
];

export default function ShowcasePage() {
  return (
    <>
      {/* Hero: animated text + 3D scene */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <TextAnimate
            as="h1"
            animation="blurInUp"
            by="word"
            once
            className="font-serif text-5xl leading-tight sm:text-6xl"
          >
            Nghệ thuật của sự chỉn chu
          </TextAnimate>
          <BlurFade delay={0.4}>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Trang mẫu kết hợp Three.js, GSAP, Lenis, Motion và Magic UI trên cùng một hệ màu.
            </p>
            <ShimmerButton className="mt-8">Bắt đầu ngay</ShimmerButton>
          </BlurFade>
        </div>
        <div className="h-[380px] sm:h-[460px]">
          <Scene3DLazy />
        </div>
      </section>

      {/* Marquee */}
      <Marquee pauseOnHover className="border-y border-border py-6 [--duration:30s]">
        {words.map((w) => (
          <span key={w} className="mx-8 font-serif text-3xl text-muted-foreground">
            {w}
          </span>
        ))}
      </Marquee>

      {/* Stats */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-20 sm:grid-cols-3 sm:px-6">
        {stats.map((s, i) => (
          <BlurFade key={s.label} delay={0.1 * i} inView>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-center">
              <p className="font-serif text-5xl">
                <NumberTicker value={s.value} />
                {s.suffix}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              <BorderBeam size={80} duration={8} delay={i * 2} />
            </div>
          </BlurFade>
        ))}
      </section>

      {/* Pinned scroll story */}
      <ScrollStory />

      {/* Bento grid */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <h2 className="mb-10 text-center font-serif text-4xl sm:text-5xl">Giá trị cốt lõi</h2>
        <BentoGrid>
          {features.map((f) => (
            <BentoCard key={f.name} {...f} />
          ))}
        </BentoGrid>
      </section>

      {/* Device mockup */}
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pb-24 sm:px-6 lg:flex-row">
        <div className="flex-1">
          <h2 className="font-serif text-4xl sm:text-5xl">Trên mọi thiết bị</h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Khung iPhone từ Magic UI — thay ảnh chụp màn hình thật của bạn vào prop <code>src</code>.
          </p>
        </div>
        <div className="w-[280px]">
          <Iphone />
        </div>
      </section>
    </>
  );
}
