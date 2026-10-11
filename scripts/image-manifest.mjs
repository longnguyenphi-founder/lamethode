// Writes src/content/report-images.json: which report images exist for each archetype.
// The report page reads this list instead of the disk, so it also works on hosts where
// public/ is served from a CDN and is not on the server's filesystem (e.g. Vercel).
// Runs automatically before `npm run dev`, `npm run build` and after `npm run images:optimize`.
// usage: npm run images:manifest
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, "$1");
const project = path.resolve(here, "..");
const root = path.join(project, "public", "images", "report");
const out = path.join(project, "src", "content", "report-images.json");

const NAMES = ["hero", "portrait", "core", "love", "symbol"];
const EXTENSIONS = ["webp", "png", "jpg", "jpeg", "avif"];

export function writeImageManifest() {
  const manifest = {};
  const slugs = fs.existsSync(root) ? fs.readdirSync(root).filter((d) => fs.statSync(path.join(root, d)).isDirectory()).sort() : [];
  for (const slug of slugs) {
    manifest[slug] = {};
    for (const name of NAMES) {
      const ext = EXTENSIONS.find((e) => fs.existsSync(path.join(root, slug, `${name}.${e}`)));
      manifest[slug][name] = ext ? `/images/report/${slug}/${name}.${ext}` : null;
    }
  }
  const json = JSON.stringify(manifest, null, 2) + "\n";
  // Only touch the file when something changed, so the dev server does not reload for nothing.
  if (!fs.existsSync(out) || fs.readFileSync(out, "utf8") !== json) fs.writeFileSync(out, json);
  return manifest;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const m = writeImageManifest();
  const found = Object.values(m).reduce((n, imgs) => n + Object.values(imgs).filter(Boolean).length, 0);
  console.log(`report-images.json: ${found} ảnh / ${Object.keys(m).length} nguyên mẫu`);
}
