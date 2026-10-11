// Verifies that every source line made it into the JSON (except intentionally removed chatbot lines).
// usage: REPORT_WORK_DIR=<dir with txt/> node verify.mjs <jsonDir>
import fs from "node:fs";
import path from "node:path";

const root = process.env.REPORT_WORK_DIR;
const jsonDir = process.argv[2];
const norm = (s) =>
  s
    .replace(/\*\*|__/g, "")
    .replace(/(^|\s)[_*](?=\S)|(?<=\S)[_*](?=\s|$|[.,!?:)"])/g, "$1")
    .replace(/^-\s+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// Structural lines the report stores in another form (title → english/name, % → population number).
const STRUCTURAL = [/^bạn trội nguyên mẫu/, /^chia sẻ nguyên mẫu$/, /^người nổi tiếng giống như bạn$/, /^có khoảng \d+% dân số/];

// Chatbot leftovers that to-json.mjs drops on purpose (norm() already stripped the leading _ or *).
const REMOVED = [/^\(p\/s/, /có muốn tui/, /^bà thấy trong công việc hiện tại/];
let problems = 0;

for (const file of fs.readdirSync(path.join(root, "txt"))) {
  const slug = file.match(/The_(\w+)\.md$/)[1].toLowerCase();
  const json = fs.readFileSync(path.join(jsonDir, `${slug}.json`), "utf8");
  const data = JSON.parse(json);
  const haystack = norm(
    JSON.stringify(data, (k, v) => v)
      .replace(/\\"/g, '"')
      .replace(/","|":"|\{"|"\}|\["|"\]/g, " "),
  );
  const missing = [];
  for (const raw of fs.readFileSync(path.join(root, "txt", file), "utf8").split("\n")) {
    const line = norm(raw).replace(/^để hoàn thiện trọn bộ hồ sơ[^.]*\.\s*/, "");
    if (!line || line === "la methode" || REMOVED.some((r) => r.test(line))) continue;
    if (/^phần i/.test(line) || STRUCTURAL.some((r) => r.test(line))) continue;
    // Compare in chunks so a line stored as title/text (or a power stored as title + english) still matches.
    const chunks = line
      .split(/:\s+|\s\((?=[^()]*\)$)/)
      .map((c) => c.replace(/^(💡|🌟|✨|🛑|🌱|🌸|👑|💕)\s*/u, "").replace(/^1\.\s*/, "").replace(/\)$/, "").trim())
      .filter((c) => c.length > 3);
    if (!chunks.every((c) => haystack.includes(c))) missing.push(raw.slice(0, 140));
  }
  problems += missing.length;
  console.log(`${slug.padEnd(10)} ${missing.length ? `${missing.length} line(s) not found:` : "OK — all content present"}`);
  missing.forEach((m) => console.log("   - " + m));
}
process.exitCode = problems ? 1 : 0;
