// Converts report images dropped into public/images/report/<slug>/ into web-sized WebP files.
// Originals are moved (not deleted) to content-source/images-original/<slug>/.
// usage: npm run images:optimize
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { writeImageManifest } from "./image-manifest.mjs";

const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, "$1");
const project = path.resolve(here, "..");
const root = path.join(project, "public", "images", "report");
const backup = path.join(project, "content-source", "images-original");

// Widths cover a 2× (Retina) screen at the largest size each image is shown on the page.
const WIDTH = { hero: 1200, heroWide: 2400, portrait: 1000, core: 1000, love: 1600, symbol: 600 };
const NAME_RE = /^(hero|portrait|core|love|symbol)\.(png|jpe?g|avif|tiff?)$/i;
const mb = (bytes) => `${(bytes / 1048576).toFixed(2)} MB`;

let before = 0;
let after = 0;
let count = 0;

function stash(file, slug) {
  const dest = path.join(backup, slug);
  fs.mkdirSync(dest, { recursive: true });
  fs.renameSync(file, path.join(dest, path.basename(file)));
}

for (const slug of fs.readdirSync(root)) {
  const dir = path.join(root, slug);
  if (!fs.statSync(dir).isDirectory()) {
    // Stray images at the top level (e.g. downloads that were also copied into a folder).
    if (/\.(png|jpe?g|webp|avif)$/i.test(slug)) {
      stash(dir, "_unsorted");
      console.log(`  moved stray file ${slug} → content-source/images-original/_unsorted/`);
    }
    continue;
  }
  for (const file of fs.readdirSync(dir)) {
    const m = file.match(NAME_RE);
    if (!m) continue;
    const name = m[1].toLowerCase();
    const src = path.join(dir, file);
    const out = path.join(dir, `${name}.webp`);
    const meta = await sharp(src).metadata();
    const wide = name === "hero" && meta.width / meta.height > 1.3;
    const width = wide ? WIDTH.heroWide : WIDTH[name];

    let img = sharp(src).rotate().resize({ width, withoutEnlargement: true });
    img = name === "symbol"
      ? img.webp({ quality: 85, alphaQuality: 90, effort: 5 })
      : img.flatten({ background: "#ffffff" }).webp({ quality: 80, effort: 5 });
    await img.toFile(out);

    const b = fs.statSync(src).size;
    const a = fs.statSync(out).size;
    before += b;
    after += a;
    count++;
    stash(src, slug);
    console.log(`  ${slug.padEnd(10)} ${name.padEnd(8)} ${mb(b).padStart(9)} → ${mb(a).padStart(8)}`);
  }
}

console.log(count ? `\n  ${count} ảnh: ${mb(before)} → ${mb(after)} (giảm ${(100 - (after / before) * 100).toFixed(0)}%)\n` : "\n  Không có ảnh mới cần nén.\n");
writeImageManifest();
