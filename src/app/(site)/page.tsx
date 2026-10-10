import Hero from "@/components/Hero";

const pillars = [
  {
    title: "Tinh tế",
    text: "Mỗi chi tiết đều được chăm chút, từ ý tưởng đến trải nghiệm cuối cùng.",
  },
  {
    title: "Phương pháp",
    text: "Quy trình rõ ràng, có hệ thống, giúp kết quả nhất quán và bền vững.",
  },
  {
    title: "Cá nhân hoá",
    text: "Giải pháp được thiết kế riêng, phù hợp với nhu cầu của từng khách hàng.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:grid-cols-3 sm:px-6">
          {pillars.map((p, i) => (
            <div key={p.title}>
              <p className="font-serif text-sm text-brand">0{i + 1}</p>
              <h2 className="mt-2 font-serif text-2xl">{p.title}</h2>
              <p className="mt-3 text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
