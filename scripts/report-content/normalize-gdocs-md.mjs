// Normalizes a Google Docs "Download as Markdown" export into the same line format
// that to-md.mjs produces from .docx, so to-json.mjs can parse both.
// usage: node normalize-gdocs-md.mjs <input.md> <output.md>
import fs from "node:fs";

const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error("usage: node normalize-gdocs-md.mjs <input.md> <output.md>");

const lines = fs
  .readFileSync(input, "utf8")
  .split(/\r?\n/)
  .filter((l) => !/^\[image\d+\]:\s*<data:image/.test(l)) // embedded base64 images
  .map((l) =>
    l
      .replace(/!\[[^\]]*\]\[[^\]]*\]/g, "") // image references
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → text
      .replace(/\\([^\w\s])/g, "$1") // markdown escapes such as \! \- \=
      .replace(/^#{1,6}\s+/, "") // headings are bold lines in the docx format
      .replace(/^\s*[*+]\s+/, "- ") // bullets
      .replace(/^(\d+)\.\s+(\*\*)/, "$2$1. ") // "1. **x**" stays a heading-like bold line
      .replace(/\*\*\s*\*\*/g, "")
      .trim()
      // "✨ **1. Title**" (emoji outside the bold) → "**✨ 1. Title**", the heading form the docx exports use
      .replace(/^((?:✨|🛑|💡|🌟|💕|🌱|🌸|👑)\s*)\*\*([^*]+)\*\*$/u, "**$1$2**"),
  )
  // "✨ **2. Title** Paragraph text…" — a heading glued to its paragraph: split into two lines.
  // ("💡 **Chốt hạ:** …" stays one line: a bold label ending in ":" is a closing tip, not a heading.)
  .flatMap((l) => {
    const m = l.match(/^((?:✨|🛑|🌟|💕|🌱|🌸|👑)\s*)\*\*([^*]+[^:*\s])\*\*\s+(\S.*)$/u);
    return m ? [`**${m[1]}${m[2]}**`, m[3]] : [l];
  })
  .filter((l) => l && l !== "La Methode" && l !== "**La Methode**");

// The docx exports keep a "La Methode" marker after the intro; to-json.mjs relies on it.
const shareIdx = lines.findIndex((l) => /^\*\*Chia sẻ nguyên mẫu\*\*$/.test(l));
if (shareIdx > 0) lines.splice(shareIdx, 0, "La Methode");

fs.writeFileSync(output, lines.join("\n"));
console.log(`${output}: ${lines.length} lines`);
