import type { Metadata } from "next";

export const metadata: Metadata = { title: "Giới thiệu" };

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="font-serif text-4xl sm:text-5xl">Về La Methode</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        Nội dung giới thiệu về La Methode — câu chuyện thương hiệu, sứ mệnh và
        giá trị cốt lõi. Hãy thay đoạn văn này bằng nội dung thực tế của dự án.
      </p>
    </section>
  );
}
