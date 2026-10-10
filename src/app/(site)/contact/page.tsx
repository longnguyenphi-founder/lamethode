import type { Metadata } from "next";

export const metadata: Metadata = { title: "Liên hệ" };

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-20 sm:px-6">
      <h1 className="font-serif text-4xl sm:text-5xl">Liên hệ</h1>
      <p className="mt-4 text-muted-foreground">
        Để lại lời nhắn, chúng tôi sẽ phản hồi sớm nhất có thể.
      </p>
      <form className="mt-10 flex flex-col gap-4">
        <input
          name="name"
          placeholder="Họ và tên"
          className="rounded-lg border border-border bg-transparent px-4 py-3 outline-none focus:border-foreground"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="rounded-lg border border-border bg-transparent px-4 py-3 outline-none focus:border-foreground"
        />
        <textarea
          name="message"
          rows={5}
          placeholder="Lời nhắn"
          className="rounded-lg border border-border bg-transparent px-4 py-3 outline-none focus:border-foreground"
        />
        <button
          type="submit"
          className="mt-2 rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground shadow-[0_10px_30px_-12px_rgba(217,150,127,0.7)] transition hover:bg-primary/85"
        >
          Gửi
        </button>
      </form>
    </section>
  );
}
