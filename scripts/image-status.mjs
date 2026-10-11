// Lists which report images exist in public/images/report/<slug>/ and which are still missing.
// usage: npm run images:status
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, "$1");
const root = path.resolve(here, "..", "public", "images", "report");

const ARCHETYPES = ["innocent", "sage", "lover", "ruler", "magician", "jester", "hero", "rebel", "creator", "everyman", "caregiver", "explorer"];
const IMAGES = ["hero", "portrait", "core", "love", "symbol"];
const EXT = ["webp", "png", "jpg", "jpeg", "avif"];

let done = 0;
const missing = [];
console.log("\n  Nguyên mẫu   hero  portrait  core  love  symbol");
console.log("  " + "─".repeat(50));
ARCHETYPES.forEach((slug) => {
  const marks = IMAGES.map((name) => {
    const ok = EXT.some((e) => fs.existsSync(path.join(root, slug, `${name}.${e}`)));
    if (ok) done++;
    else missing.push(`${slug}/${name}`);
    return ok ? "✓" : "·";
  });
  console.log(`  ${slug.padEnd(11)}  ${marks[0]}     ${marks[1]}        ${marks[2]}     ${marks[3]}     ${marks[4]}`);
});
const total = ARCHETYPES.length * IMAGES.length;
console.log("  " + "─".repeat(50));
console.log(`  Đã có ${done}/${total} ảnh (✓ = có, · = còn thiếu)\n`);
if (missing.length && missing.length <= 10) console.log("  Còn thiếu: " + missing.join(", ") + "\n");
