// Visual identity of each archetype's report page. Every colour is applied by
// overriding the shared design tokens on the report root, so shadcn, Magic UI
// and custom components all pick up the archetype's palette automatically.
// The same palette and mood drive the image prompts in docs/image-prompts/.

export type FontKey =
  | "cormorant" | "playfair" | "garamond" | "notoDisplay" | "fraunces"
  | "bricolage" | "prata" | "spaceGrotesk" | "lora" | "beVietnam" | "literata";

export type ScriptFontKey = "greatVibes" | "dancing" | null;

export type HeroLayout = "centered" | "split" | "fullbleed" | "framed" | "poster";
export type Ambient = "petals" | "sparkles" | "rays" | "confetti" | "blobs" | "grid" | "bokeh" | "scribble" | "linen";
export type CardStyle = "soft" | "outline" | "sharp" | "glass";
export type HeadingStyle = "numbered" | "ornament" | "eyebrow" | "stamp";
export type StrengthsLayout = "bento" | "numbered" | "cards";
export type JourneyLayout = "horizontal" | "vertical" | "pinned";
/** How cards are dealt in the scroll decks: rise from below, fan in from the side, flip up, or zoom in. */
export type DeckStyle = "rise" | "fan" | "flip" | "zoom";
/** Card personality: silhouette, decoration and number style (see DeckCard). */
export type CardLook = {
  radius: string; // CSS border-radius shared by cards and their stack shade
  frame: "plain" | "ticket" | "offset";
  deco: "petal" | "lines" | "seal" | "double" | "stars" | "tape" | "stripe" | "scribble" | "paint" | "stitch" | "stamp" | "sprig";
  numeral: "ghost" | "outline" | "circle";
};
export type OrbShape = "petal" | "drop" | "heart" | "crown" | "crystal" | "bubbles" | "shield" | "spike" | "knot" | "cube" | "nest" | "gyro";

export type ReportTheme = {
  slug: string;
  mood: string; // short name of the visual concept
  palette: {
    background: string;
    surface: string;
    foreground: string;
    muted: string;
    accent: string; // main highlight colour
    accentSoft: string; // tinted bands / chips
    border: string;
    accentForeground: string; // text on solid accent
  };
  display: FontKey;
  script: ScriptFontKey;
  uppercaseTitle: boolean;
  hero: HeroLayout;
  ambient: Ambient;
  card: CardStyle;
  heading: HeadingStyle;
  strengths: StrengthsLayout;
  journey: JourneyLayout;
  ornament: string; // small glyph used in dividers
  orb: { shape: OrbShape; color: string; color2: string }; // live 3D accent
  deck: [DeckStyle, DeckStyle]; // alternated between sections
  look: CardLook;
};

export const THEMES: Record<string, ReportTheme> = {
  innocent: {
    slug: "innocent",
    mood: "Morning Light",
    palette: { background: "#fff9f4", surface: "#ffffff", foreground: "#4b3a35", muted: "#7f6a62", accent: "#d98f86", accentSoft: "#f8e1d8", border: "#f1e2da", accentForeground: "#3f2a26" },
    display: "cormorant", script: "greatVibes", uppercaseTitle: true,
    hero: "centered", ambient: "petals", card: "soft", heading: "ornament",
    strengths: "cards", journey: "horizontal", ornament: "❀",
    orb: { shape: "petal", color: "#f3c4bb", color2: "#ffffff" },
    deck: ["rise", "zoom"],
    look: { radius: "2.5rem 0.75rem 2.5rem 0.75rem", frame: "plain", deco: "petal", numeral: "ghost" },
  },
  sage: {
    slug: "sage",
    mood: "Quiet Library",
    palette: { background: "#f8f5ee", surface: "#fdfbf6", foreground: "#3d3a34", muted: "#69675e", accent: "#7a9070", accentSoft: "#e6ecdc", border: "#e4e2d4", accentForeground: "#ffffff" },
    display: "garamond", script: null, uppercaseTitle: false,
    hero: "split", ambient: "grid", card: "outline", heading: "numbered",
    strengths: "numbered", journey: "vertical", ornament: "§",
    orb: { shape: "drop", color: "#b9c8ac", color2: "#f3efe0" },
    deck: ["flip", "rise"],
    look: { radius: "1.5rem", frame: "plain", deco: "lines", numeral: "outline" },
  },
  lover: {
    slug: "lover",
    mood: "Velvet Rose",
    palette: { background: "#fcf1f1", surface: "#fffafa", foreground: "#5a2a35", muted: "#86555e", accent: "#c4506a", accentSoft: "#f6d2d9", border: "#f0d6db", accentForeground: "#ffffff" },
    display: "playfair", script: "greatVibes", uppercaseTitle: false,
    hero: "fullbleed", ambient: "bokeh", card: "glass", heading: "eyebrow",
    strengths: "bento", journey: "pinned", ornament: "♡",
    orb: { shape: "heart", color: "#d65c78", color2: "#f8c9d3" },
    deck: ["fan", "zoom"],
    look: { radius: "2.5rem 0.75rem 2.5rem 0.75rem", frame: "plain", deco: "seal", numeral: "circle" },
  },
  ruler: {
    slug: "ruler",
    mood: "Champagne Crown",
    palette: { background: "#fbf7ef", surface: "#fffdf8", foreground: "#3b3226", muted: "#74664f", accent: "#a8864a", accentSoft: "#efe4cb", border: "#e8dfcc", accentForeground: "#ffffff" },
    display: "notoDisplay", script: null, uppercaseTitle: true,
    hero: "framed", ambient: "rays", card: "sharp", heading: "ornament",
    strengths: "numbered", journey: "horizontal", ornament: "♛",
    orb: { shape: "crown", color: "#c9a45c", color2: "#f6efe2" },
    deck: ["flip", "zoom"],
    look: { radius: "0.35rem", frame: "plain", deco: "double", numeral: "outline" },
  },
  magician: {
    slug: "magician",
    mood: "Twilight Alchemy",
    palette: { background: "#f6f3fb", surface: "#fcfbff", foreground: "#3a3150", muted: "#6c6185", accent: "#8a72c4", accentSoft: "#e3dbf5", border: "#e6e0f2", accentForeground: "#ffffff" },
    display: "fraunces", script: null, uppercaseTitle: false,
    hero: "split", ambient: "sparkles", card: "glass", heading: "eyebrow",
    strengths: "bento", journey: "pinned", ornament: "✧",
    orb: { shape: "crystal", color: "#b5a2ea", color2: "#efe9ff" },
    deck: ["zoom", "flip"],
    look: { radius: "2rem", frame: "plain", deco: "stars", numeral: "ghost" },
  },
  jester: {
    slug: "jester",
    mood: "Sunny Carnival",
    palette: { background: "#fff6ef", surface: "#ffffff", foreground: "#4a3029", muted: "#86655a", accent: "#ec7a5a", accentSoft: "#ffe0bf", border: "#f6e0d2", accentForeground: "#ffffff" },
    display: "bricolage", script: "dancing", uppercaseTitle: true,
    hero: "poster", ambient: "confetti", card: "soft", heading: "stamp",
    strengths: "cards", journey: "horizontal", ornament: "✺",
    orb: { shape: "bubbles", color: "#f28a68", color2: "#ffcf8a" },
    deck: ["fan", "rise"],
    look: { radius: "1.75rem", frame: "plain", deco: "tape", numeral: "circle" },
  },
  hero: {
    slug: "hero",
    mood: "Bronze Dawn",
    palette: { background: "#fcf5f1", surface: "#fffaf8", foreground: "#45302b", muted: "#7d625a", accent: "#bd6a55", accentSoft: "#f7dbd1", border: "#f0ddd5", accentForeground: "#ffffff" },
    display: "prata", script: null, uppercaseTitle: true,
    hero: "poster", ambient: "rays", card: "sharp", heading: "numbered",
    strengths: "numbered", journey: "vertical", ornament: "▲",
    orb: { shape: "shield", color: "#d08a73", color2: "#f9ddd2" },
    deck: ["rise", "flip"],
    look: { radius: "1.25rem", frame: "ticket", deco: "stripe", numeral: "outline" },
  },
  rebel: {
    slug: "rebel",
    mood: "Wild Rouge",
    palette: { background: "#fbf1ee", surface: "#fffaf8", foreground: "#43222a", muted: "#80545b", accent: "#b23a4c", accentSoft: "#f5cdc6", border: "#efd2cc", accentForeground: "#ffffff" },
    display: "spaceGrotesk", script: null, uppercaseTitle: true,
    hero: "poster", ambient: "scribble", card: "outline", heading: "stamp",
    strengths: "cards", journey: "pinned", ornament: "✕",
    orb: { shape: "spike", color: "#c43f53", color2: "#f7c5be" },
    deck: ["fan", "flip"],
    look: { radius: "0.4rem", frame: "offset", deco: "scribble", numeral: "circle" },
  },
  creator: {
    slug: "creator",
    mood: "Atelier Peach",
    palette: { background: "#fff5ee", surface: "#fffcf9", foreground: "#45302a", muted: "#7f6157", accent: "#de8a57", accentSoft: "#d5e8e0", border: "#f3e0d3", accentForeground: "#ffffff" },
    display: "lora", script: "dancing", uppercaseTitle: false,
    hero: "split", ambient: "blobs", card: "soft", heading: "eyebrow",
    strengths: "bento", journey: "horizontal", ornament: "✎",
    orb: { shape: "knot", color: "#ec9a68", color2: "#bfe0d4" },
    deck: ["fan", "zoom"],
    look: { radius: "2.5rem 0.75rem 2.5rem 0.75rem", frame: "plain", deco: "paint", numeral: "ghost" },
  },
  everyman: {
    slug: "everyman",
    mood: "Linen Home",
    palette: { background: "#f9f6f4", surface: "#fffdfc", foreground: "#3e3a48", muted: "#6b6576", accent: "#6f84c0", accentSoft: "#e8e9f8", border: "#ebe4e8", accentForeground: "#ffffff" },
    display: "beVietnam", script: null, uppercaseTitle: false,
    hero: "centered", ambient: "linen", card: "soft", heading: "eyebrow",
    strengths: "cards", journey: "vertical", ornament: "●",
    orb: { shape: "cube", color: "#a3b2e3", color2: "#f6e1e7" },
    deck: ["rise", "fan"],
    look: { radius: "1.75rem", frame: "plain", deco: "stitch", numeral: "circle" },
  },
  caregiver: {
    slug: "caregiver",
    mood: "Garden Embrace",
    palette: { background: "#faf6f0", surface: "#fffdf9", foreground: "#3c3a33", muted: "#6f6b61", accent: "#86a782", accentSoft: "#f6dccb", border: "#ebe3d6", accentForeground: "#ffffff" },
    display: "lora", script: "greatVibes", uppercaseTitle: false,
    hero: "centered", ambient: "petals", card: "soft", heading: "ornament",
    strengths: "cards", journey: "vertical", ornament: "❦",
    orb: { shape: "nest", color: "#9dbb98", color2: "#f6d3be" },
    deck: ["rise", "zoom"],
    look: { radius: "2rem", frame: "plain", deco: "sprig", numeral: "ghost" },
  },
  explorer: {
    slug: "explorer",
    mood: "Desert Horizon",
    palette: { background: "#f8f4ec", surface: "#fffcf6", foreground: "#33372f", muted: "#686c61", accent: "#b9824f", accentSoft: "#dbe8ee", border: "#e9e1d2", accentForeground: "#ffffff" },
    display: "literata", script: null, uppercaseTitle: true,
    hero: "fullbleed", ambient: "bokeh", card: "outline", heading: "numbered",
    strengths: "numbered", journey: "horizontal", ornament: "✦",
    orb: { shape: "gyro", color: "#c79059", color2: "#a9cde0" },
    deck: ["fan", "rise"],
    look: { radius: "1.25rem", frame: "ticket", deco: "stamp", numeral: "outline" },
  },
};
