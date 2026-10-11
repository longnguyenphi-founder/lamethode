// Rebuilds src/content/reports/*.json from content-source/reports/.
// Accepts .docx files and Google Docs "Download as Markdown" exports (.md).
// usage: npm run reports:build
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/(\w:)/, "$1");
const project = path.resolve(here, "../..");
const sourceDir = path.join(project, "content-source", "reports");
const outDir = path.join(project, "src", "content", "reports");
const work = fs.mkdtempSync(path.join(os.tmpdir(), "report-content-"));
fs.mkdirSync(path.join(work, "xml"));
fs.mkdirSync(path.join(work, "txt"));

// Windows ships bsdtar as tar.exe, which can read zip (.docx); elsewhere fall back to unzip.
const tar = process.platform === "win32" ? path.join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe") : null;
const env = { ...process.env, REPORT_WORK_DIR: work };
const run = (script, args = []) => execFileSync(process.execPath, [path.join(here, script), ...args], { env, stdio: "inherit" });

for (const file of fs.readdirSync(sourceDir)) {
  const slug = file.match(/The_(\w+)\.(docx|md)$/i)?.[1];
  if (!slug) {
    console.warn(`skipping ${file} — name must end with The_<Archetype>.docx or .md`);
    continue;
  }
  const name = `La_Methode_The_${slug}`;
  const src = path.join(sourceDir, file);
  if (file.endsWith(".docx")) {
    const dest = path.join(work, "xml", name);
    fs.mkdirSync(dest);
    if (tar) execFileSync(tar, ["-xf", src, "-C", dest, "word/document.xml", "word/styles.xml"]);
    else execFileSync("unzip", ["-q", src, "word/document.xml", "word/styles.xml", "-d", dest]);
  } else {
    run("normalize-gdocs-md.mjs", [src, path.join(work, "txt", `${name}.md`)]);
  }
}

run("to-md.mjs");
run("to-json.mjs", [outDir]);
run("verify.mjs", [outDir]);
fs.rmSync(work, { recursive: true, force: true });
