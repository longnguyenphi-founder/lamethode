import { QUESTIONS } from "@/lib/quiz/questions";
import { computeResult } from "@/lib/quiz/scoring";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LETTERS = ["A", "B", "C", "D"];

const HEADERS = [
  "Thời gian",
  "Email",
  "Nguyên mẫu chính",
  "Nguyên mẫu phụ",
  "Điểm",
  ...QUESTIONS.map((q) => `Câu ${q.id}`),
];

// Cells starting with these characters would be evaluated as formulas by Sheets.
function safeCell(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { email, answers } = (body ?? {}) as { email?: unknown; answers?: unknown };

  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  if (
    !Array.isArray(answers) ||
    answers.length !== QUESTIONS.length ||
    !answers.every((a, i) => Number.isInteger(a) && a >= 0 && a < QUESTIONS[i].options.length)
  ) {
    return Response.json({ ok: false, error: "invalid_answers" }, { status: 400 });
  }

  // Recompute on the server — never trust a result sent by the client.
  const result = computeResult(answers as number[]);
  const scores = Object.entries(result.scores)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([code, n]) => `${code}:${n}`)
    .join(", ");

  const row = [
    new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
    email.trim().toLowerCase(),
    result.primary.name,
    result.secondary?.name ?? "",
    scores,
    ...(answers as number[]).map((a, i) => `${LETTERS[a]}. ${QUESTIONS[i].options[a].text}`),
  ].map(safeCell);

  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_SECRET;

  if (!webhook || !secret) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[subscribe] GOOGLE_SHEETS_WEBHOOK_URL/SECRET not set — row not stored:", row);
      return Response.json({ ok: true, stored: false, primary: result.primary.code, secondary: result.secondary?.code ?? null });
    }
    return Response.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, headers: HEADERS, row }),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res.ok || !data?.ok) {
      console.error("[subscribe] Sheets webhook failed:", res.status, data);
      return Response.json({ ok: false, error: "storage_failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[subscribe] Sheets webhook error:", err);
    return Response.json({ ok: false, error: "storage_failed" }, { status: 502 });
  }

  return Response.json({ ok: true, stored: true, primary: result.primary.code, secondary: result.secondary?.code ?? null });
}
