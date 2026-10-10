import Link from "next/link";

const nav = [
  // The logo already links home, so "Trang chủ" is dropped on narrow screens.
  { href: "/", label: "Trang chủ", desktopOnly: true },
  { href: "/about", label: "Giới thiệu" },
  { href: "/showcase", label: "Showcase" },
  { href: "/contact", label: "Liên hệ" },
];

export default function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-wide whitespace-nowrap sm:text-2xl"
        >
          La Methode
        </Link>
        <nav className="flex gap-4 text-[13px] whitespace-nowrap text-muted-foreground sm:gap-8 sm:text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors hover:text-foreground ${item.desktopOnly ? "hidden sm:inline" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
