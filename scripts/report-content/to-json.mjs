// Markdown (from to-md.mjs) → structured report JSON for the Next.js app.
import fs from "node:fs";
import path from "node:path";

const root = process.env.REPORT_WORK_DIR; // contains txt/ (see build.mjs)
const outDir = process.argv[2];
if (!outDir) throw new Error("usage: node to-json.mjs <outDir>");
fs.mkdirSync(outDir, { recursive: true });

const SLUG_CODE = {
  innocent: "NNT", everyman: "NBD", hero: "AH", caregiver: "NCS", explorer: "NTH", rebel: "KNL",
  lover: "NTI", creator: "NST", jester: "THE", sage: "HGI", magician: "PTS", ruler: "NLD",
};

const SECTIONS = [
  ["portrait", /^1\. Chân dung của bạn/i],
  ["core", /^Lõi Tính Cách/i],
  ["love", /^Bạn muốn một tình yêu/i],
  ["perception", /^Người khác nghĩ gì/i],
  ["reactions", /^Cách chúng mình phản ứng/i],
  ["strengths", /^Điểm mạnh thật sự/i],
  ["blindspots", /^Những điểm mù/i],
  ["conflict", /^Mâu thuẫn lớn nhất/i],
  ["challenges", /^Những thách thức/i],
  ["growth", /^Hướng phát triển/i],
  ["relationships", /^Làm sao để cải thiện/i],
  ["career", /^Bạn cần làm gì để thăng tiến/i],
  ["journey", /^Vận trình cuộc đời/i],
  ["advice", /^Lời khuyên/i],
];

const ICONS = ["✨", "🛑", "💡", "🌟", "💕", "🌱", "🌸", "👑"];
const isBoldLine = (l) => /^\*\*[^*]+\*\*$/.test(l.trim());
const unbold = (l) => l.trim().replace(/^\*\*|\*\*$/g, "").trim();
const LABEL_RE = /^([^:*]{3,70}):\s+(.+)$/;

// Chatbot leftovers that do not belong in a published report.
function clean(line) {
  if (/^[_*]\(P\/s/.test(line)) return null;
  if (/có muốn tui/.test(line)) return null;
  if (/^Bà thấy trong công việc hiện tại/.test(line)) return null;
  return line.replace(/^Để hoàn thiện trọn bộ hồ sơ[^.]*\.\s*/, "").trim() || null;
}

function toBlock(line, prev) {
  const t = line.trim();
  // Partly-bold closing lines such as "**💡 Chốt hạ:** …" or "🌟 **Chốt hạ:** …"
  if (!isBoldLine(t) && /^(\*\*)?(💡|🌟)/.test(t)) {
    return { type: "tip", text: t.replace(/^(\*\*)?(💡|🌟)\s*(\*\*)?\s*/, "").replace(/\*\*/g, "").trim() };
  }
  if (isBoldLine(t)) {
    const inner = unbold(t);
    const icon = ICONS.find((i) => inner.startsWith(i));
    if (icon === "💡") return { type: "tip", text: inner.replace(/^💡\s*/, "") };
    return { type: "sub", icon: icon ?? null, title: icon ? inner.slice(icon.length).trim() : inner };
  }
  if (t.startsWith("- ")) {
    const body = t.slice(2);
    const m = body.match(/^\*\*(.+?):?\*\*:?\s*(.*)$/);
    if (m && m[2]) return { type: "item", title: m[1].replace(/:$/, ""), text: m[2] };
    return { type: "item", title: null, text: body };
  }
  const bm = t.match(/^\*\*(.+?):\*\*\s*(.+)$/);
  if (bm) return { type: "item", title: bm[1], text: bm[2] };
  const lm = t.match(LABEL_RE);
  // Unbulleted "Label: text" only counts as an item inside a subsection.
  if (lm && (prev?.type === "sub" || prev?.type === "item")) return { type: "item", title: lm[1], text: lm[2] };
  return { type: "p", text: t };
}

for (const file of fs.readdirSync(path.join(root, "txt"))) {
  const lines = fs.readFileSync(path.join(root, "txt", file), "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
  const slug = file.match(/The_(\w+)\.md$/)[1].toLowerCase();

  const title = unbold(lines[0]).match(/The (\w+) \((.+)\)/);
  const report = {
    slug,
    code: SLUG_CODE[slug],
    english: `The ${title[1]}`,
    name: title[2],
    intro: [],
    population: null,
    celebrities: [],
    powers: [],
    sections: [],
  };

  let i = 1;
  while (lines[i] !== "La Methode") report.intro.push(lines[i++]);

  const partStart = lines.findIndex((l) => /^\*\*PHẦN I/.test(l));
  const celebStart = lines.findIndex((l) => /Người nổi tiếng giống như bạn/.test(l)) + 1;
  report.population = Number(lines[celebStart].match(/(\d+)%/)?.[1] ?? 0) || null;
  const BOLD_LABEL_RE = /^\*\*([^*]+?):\*\*\s*(.+)$/;
  for (let j = celebStart + 1; j < partStart; j++) {
    const line = lines[j];
    const next = lines[j + 1] ?? "";
    const label = line.match(BOLD_LABEL_RE) ?? (!isBoldLine(line) ? line.match(LABEL_RE) : null);
    const startsPower = isBoldLine(line) && (LABEL_RE.test(next) || BOLD_LABEL_RE.test(next)) && !isBoldLine(next);
    // Celebrity names are bold in the docx exports but plain in Google Docs ones:
    // a short line without a "Label:" followed by a plain description.
    const isCeleb =
      !report.powers.length &&
      (isBoldLine(line) || (line.length <= 60 && !LABEL_RE.test(line))) &&
      next.length > 60 && !isBoldLine(next);

    if (startsPower) {
      const pm = unbold(line).match(/^(.*?)\s*\(([^)]+)\)$/);
      report.powers.push({ title: pm ? pm[1] : unbold(line), english: pm ? pm[2] : null, lead: null, points: [] });
    } else if (label && report.powers.length) {
      report.powers.at(-1).points.push({ title: label[1], text: label[2] });
    } else if (isCeleb) {
      report.celebrities.push({ name: unbold(line), text: next });
      j++; // skip the description line
    } else if (report.powers.length) {
      // A power block whose bold title is missing in the source: keep its text.
      report.powers.push({ title: null, english: null, lead: line, points: [] });
      console.warn(`  ! ${slug}: power block without a title — "${line.slice(0, 50)}…"`);
    }
  }

  let current = null;
  for (let j = partStart + 1; j < lines.length; j++) {
    const heading = isBoldLine(lines[j]) && SECTIONS.find(([, re]) => re.test(unbold(lines[j])));
    if (heading) {
      current = { id: heading[0], title: unbold(lines[j]).replace(/^1\.\s*/, ""), blocks: [] };
      report.sections.push(current);
      continue;
    }
    const line = clean(lines[j]);
    if (line && current) current.blocks.push(toBlock(line, current.blocks.at(-1)));
  }

  const missing = SECTIONS.map(([id]) => id).filter((id) => !report.sections.some((s) => s.id === id));
  fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify(report, null, 2) + "\n");
  console.log(slug, `celebs:${report.celebrities.length} powers:${report.powers.length} pop:${report.population}% sections:${report.sections.length}`, missing.length ? `MISSING ${missing}` : "");
}
