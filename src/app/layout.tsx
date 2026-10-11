import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import { cn } from "@/lib/utils";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: {
    default: "La Methode",
    template: "%s | La Methode",
  },
  description: "La Methode — phương pháp của sự tinh tế.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={cn("h-full antialiased", serif.variable, sans.variable)}
      // Browser extensions (e.g. page translators) add classes to <html> before React hydrates.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
