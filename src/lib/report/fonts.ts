import {
  Be_Vietnam_Pro, Bricolage_Grotesque, Cormorant_Garamond, Dancing_Script, EB_Garamond, Fraunces,
  Great_Vibes, Literata, Lora, Noto_Serif_Display, Playfair_Display, Prata, Space_Grotesk,
} from "next/font/google";
import type { FontKey, ScriptFontKey } from "./themes";

// Display fonts for the archetype reports — all with Vietnamese glyphs.
// next/font requires literal options, hence the repetition.

const cormorant = Cormorant_Garamond({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600"], display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin", "vietnamese"], display: "swap" });
const garamond = EB_Garamond({ subsets: ["latin", "vietnamese"], display: "swap" });
const notoDisplay = Noto_Serif_Display({ subsets: ["latin", "vietnamese"], display: "swap" });
const fraunces = Fraunces({ subsets: ["latin", "vietnamese"], display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin", "vietnamese"], display: "swap" });
const prata = Prata({ subsets: ["latin", "vietnamese"], weight: "400", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "vietnamese"], display: "swap" });
const lora = Lora({ subsets: ["latin", "vietnamese"], display: "swap" });
const beVietnam = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], display: "swap" });
const literata = Literata({ subsets: ["latin", "vietnamese"], display: "swap" });
const greatVibes = Great_Vibes({ subsets: ["latin", "vietnamese"], weight: "400", display: "swap" });
const dancing = Dancing_Script({ subsets: ["latin", "vietnamese"], display: "swap" });

const DISPLAY: Record<FontKey, { style: { fontFamily: string } }> = {
  cormorant, playfair, garamond, notoDisplay, fraunces, bricolage, prata, spaceGrotesk, lora, beVietnam, literata,
};

export function displayFont(key: FontKey) {
  return DISPLAY[key].style.fontFamily;
}

export function scriptFont(key: ScriptFontKey) {
  if (key === "greatVibes") return greatVibes.style.fontFamily;
  if (key === "dancing") return dancing.style.fontFamily;
  return null;
}
