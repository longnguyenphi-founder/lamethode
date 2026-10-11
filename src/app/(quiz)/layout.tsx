import { Playfair_Display } from "next/font/google";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
});

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} flex flex-1 flex-col`}>{children}</div>;
}
