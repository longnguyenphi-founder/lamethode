// Minimal docx document.xml → Markdown: headings, list items, bold runs, tables.
import fs from "node:fs";
import path from "node:path";

const root = process.env.REPORT_WORK_DIR; // contains xml/ in, txt/ out (see build.mjs)
const decode = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

function styleNames(stylesXml) {
  const map = {};
  for (const m of stylesXml.matchAll(/<w:style\b[^>]*w:styleId="([^"]+)"[^>]*>[\s\S]*?<w:name w:val="([^"]+)"/g)) map[m[1]] = m[2];
  return map;
}

function runs(pXml) {
  let out = "";
  for (const r of pXml.matchAll(/<w:r\b[\s\S]*?<\/w:r>/g)) {
    const bold = /<w:b\/>|<w:b w:val="(1|true)"\/>/.test(r[0]);
    const italic = /<w:i\/>|<w:i w:val="(1|true)"\/>/.test(r[0]);
    let t = [...r[0].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:(tab|br)\/>/g)]
      .map((x) => (x[1] !== undefined ? decode(x[1]) : x[2] === "tab" ? " " : "\n"))
      .join("");
    if (!t.trim()) { out += t; continue; }
    if (bold) t = `**${t.trim()}** `;
    else if (italic) t = `_${t.trim()}_ `;
    out += t;
  }
  return out.replace(/\*\* \*\*/g, " ").replace(/\s+$/, "");
}

function para(pXml, styles) {
  const text = runs(pXml);
  if (!text.trim()) return "";
  const sid = pXml.match(/<w:pStyle w:val="([^"]+)"/)?.[1];
  const name = (styles[sid] ?? sid ?? "").toLowerCase();
  const h = name.match(/heading (\d)/) || name.match(/^title$/) && ["", "1"];
  if (h) return `${"#".repeat(Number(h[1]))} ${text.replace(/\*\*/g, "").trim()}`;
  if (/<w:numPr>/.test(pXml) || name.includes("list")) return `- ${text.trim()}`;
  return text.trim();
}

for (const dir of fs.readdirSync(path.join(root, "xml"))) {
  const doc = fs.readFileSync(path.join(root, "xml", dir, "word/document.xml"), "utf8");
  const styles = styleNames(fs.readFileSync(path.join(root, "xml", dir, "word/styles.xml"), "utf8"));
  const body = doc.match(/<w:body>([\s\S]*)<\/w:body>/)[1];
  const lines = [];
  for (const block of body.matchAll(/<w:tbl>[\s\S]*?<\/w:tbl>|<w:p\b[\s\S]*?<\/w:p>/g)) {
    const b = block[0];
    if (b.startsWith("<w:tbl>")) {
      const rows = [...b.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)].map((tr) =>
        [...tr[0].matchAll(/<w:tc>[\s\S]*?<\/w:tc>/g)].map((tc) =>
          [...tc[0].matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].map((p) => para(p[0], styles)).filter(Boolean).join(" / "),
        ),
      );
      if (rows.length) {
        lines.push("", `| ${rows[0].join(" | ")} |`, `|${rows[0].map(() => " --- ").join("|")}|`);
        rows.slice(1).forEach((r) => lines.push(`| ${r.join(" | ")} |`));
        lines.push("");
      }
    } else {
      const p = para(b, styles);
      if (p) lines.push(p);
    }
  }
  fs.writeFileSync(path.join(root, "txt", `${dir}.md`), lines.join("\n"));
  console.log(dir, lines.length, "lines");
}
