import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Block } from "@/lib/report/content";
import type { CardStyle, HeadingStyle, ReportTheme } from "@/lib/report/themes";

/** Renders the light inline markup that survives in the content: **bold**, *italic*, _italic_. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**")) return <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>;
        if ((p.startsWith("*") || p.startsWith("_")) && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

/** "Lõi Tính Cách (Bản chất thật sự bên trong)" → ["Lõi Tính Cách", "Bản chất thật sự bên trong"] */
export function splitTitle(title: string): [string, string | null] {
  const paren = title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (paren) return [paren[1], paren[2]];
  const dash = title.split(/\s+[-–]\s+/);
  if (dash.length === 2) return [dash[1], dash[0]];
  return [title, null];
}

/** Lowercase first letter left over from the source ("nếu đã mang…") reads as a typo on the page. */
export const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase("vi") + s.slice(1);

export function cardClass(style: CardStyle) {
  switch (style) {
    case "soft":
      return "rounded-3xl border border-border/70 bg-card shadow-[0_24px_60px_-36px_color-mix(in_srgb,var(--primary)_70%,transparent)]";
    case "outline":
      return "rounded-xl border border-border bg-transparent";
    case "sharp":
      return "rounded-none border border-border bg-card shadow-[6px_6px_0_0_color-mix(in_srgb,var(--primary)_22%,transparent)]";
    case "glass":
      return "rounded-3xl border border-white/70 bg-white/55 shadow-[0_24px_60px_-36px_color-mix(in_srgb,var(--primary)_70%,transparent)] backdrop-blur-md";
  }
}

export function SectionHeading({
  theme,
  index,
  title,
  align = "left",
}: {
  theme: ReportTheme;
  index: number;
  title: string;
  align?: "left" | "center";
}) {
  const [main, sub] = splitTitle(title);
  const style: HeadingStyle = theme.heading;
  const center = align === "center" || style === "ornament";
  const titleClass = cn(
    "report-display text-[2.1rem] leading-[1.1] text-balance sm:text-5xl",
    theme.uppercaseTitle && style !== "ornament" && "uppercase tracking-tight",
  );

  return (
    <header className={cn("mb-10 sm:mb-14", center && "text-center")}>
      {style === "numbered" && (
        <p className="mb-3 flex items-center gap-3 text-xs tracking-[0.25em] text-muted-foreground uppercase">
          <span className="report-display text-2xl tracking-normal text-primary">{String(index).padStart(2, "0")}</span>
          <span className="h-px w-10 bg-border" />
          {sub}
        </p>
      )}
      {style === "ornament" && (
        <p className="mb-4 flex items-center justify-center gap-4 text-primary" aria-hidden>
          <span className="h-px w-12 bg-primary/40" />
          <span className="text-lg">{theme.ornament}</span>
          <span className="h-px w-12 bg-primary/40" />
        </p>
      )}
      {style === "eyebrow" && sub && <p className="mb-3 text-xs font-medium tracking-[0.25em] text-primary uppercase">{sub}</p>}
      {style === "stamp" && (
        <p className="mb-4 inline-block -rotate-2 rounded-md bg-primary px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-primary-foreground uppercase">
          {String(index).padStart(2, "0")} · {sub ?? theme.mood}
        </p>
      )}
      <h2 data-split className={titleClass}>{main}</h2>
      {style === "ornament" && sub && <p className="mt-3 text-sm tracking-wide text-muted-foreground italic">{sub}</p>}
    </header>
  );
}

export function Section({ id, children, className, tinted }: { id: string; children: ReactNode; className?: string; tinted?: boolean }) {
  return (
    <section id={id} className={cn("relative scroll-mt-16 px-4 py-20 sm:px-6 sm:py-28", tinted && "bg-secondary/60", className)}>
      <div className="relative mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function ReportImage({
  src,
  alt,
  className,
  theme,
  rounded = "rounded-[2rem]",
}: {
  src: string | null;
  alt: string;
  className?: string;
  theme: ReportTheme;
  rounded?: string;
}) {
  if (src) {
    // Generated assets live in /public; plain <img> keeps arbitrary formats and transparency.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", rounded, className)} />;
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("grid h-full w-full place-items-center bg-gradient-to-br from-secondary via-card to-background", rounded, className)}
    >
      <span className="report-display text-6xl text-primary/40">{theme.ornament}</span>
    </div>
  );
}

export function Paragraphs({ blocks, className }: { blocks: Block[]; className?: string }) {
  return (
    <div className={cn("space-y-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base", className)}>
      {blocks.map((b, i) =>
        b.type === "p" ? (
          <p key={i}>
            <RichText text={capitalize(b.text)} />
          </p>
        ) : b.type === "tip" ? (
          <TipQuote key={i} text={b.text} />
        ) : b.type === "item" ? (
          <p key={i}>
            {b.title && <strong className="font-semibold text-foreground">{b.title}: </strong>}
            <RichText text={b.text} />
          </p>
        ) : null,
      )}
    </div>
  );
}

export function ItemList({ blocks, numbered, className }: { blocks: Block[]; numbered?: boolean; className?: string }) {
  const items = blocks.filter((b): b is Extract<Block, { type: "item" }> => b.type === "item");
  return (
    <ul className={cn("space-y-5", className)}>
      {items.map((it, i) => (
        <li key={i} className="flex gap-4">
          <span className="report-display mt-0.5 shrink-0 text-lg leading-none text-primary" aria-hidden>
            {numbered ? String(i + 1).padStart(2, "0") : "✦"}
          </span>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {it.title && <strong className="block font-semibold text-foreground">{it.title}</strong>}
            <RichText text={it.text} />
          </p>
        </li>
      ))}
    </ul>
  );
}

export function TipQuote({ text, large }: { text: string; large?: boolean }) {
  return (
    <blockquote
      className={cn(
        "relative rounded-2xl border-l-4 border-primary bg-secondary/70 px-6 py-5 text-foreground",
        large && "px-7 py-8 sm:px-10",
      )}
    >
      <p className={cn("report-display leading-snug", large ? "text-xl sm:text-2xl" : "text-lg")}>
        <RichText text={text.replace(/\*\*/g, "")} />
      </p>
    </blockquote>
  );
}
