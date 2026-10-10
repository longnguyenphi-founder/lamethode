"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, ChevronDown, Home, Loader2, Mail, RotateCcw, Sparkles } from "lucide-react";
import { QUESTIONS } from "@/lib/quiz/questions";
import { computeResult } from "@/lib/quiz/scoring";
import { cn } from "@/lib/utils";

type Stage =
  | { kind: "asking" }
  | { kind: "selected"; index: number } // brief confirmation before the choice moves into the thread
  | { kind: "typing" }; // mindful pause before the next question

type EmailStep = "off" | "asking" | "sending" | "sent";

const TOTAL = QUESTIONS.length;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const enter = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

const iconButton =
  "grid size-8 place-items-center rounded-full text-aura-ink-muted transition hover:bg-white/70 hover:text-aura-ink focus-visible:ring-2 focus-visible:ring-aura-rose/60 focus-visible:outline-none";
const focusRing = "focus-visible:ring-2 focus-visible:ring-aura-rose/60 focus-visible:outline-none";
const userBubble =
  "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-aura-rose to-aura-clay px-4 py-3 text-[13px] leading-relaxed font-medium text-aura-ink shadow-[0_10px_24px_-10px_rgba(199,130,142,0.8)]";
const systemCard =
  "max-w-[90%] rounded-2xl rounded-tl-md border border-white/70 bg-white/60 px-4 py-3 text-[13px] leading-relaxed text-aura-ink-muted";
const tagLabel = "text-[10px] font-medium tracking-[0.18em] text-aura-ink-muted uppercase";

export default function AuraQuiz() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [answers, setAnswers] = useState<number[]>([]);
  const [stage, setStage] = useState<Stage>({ kind: "asking" });
  const [emailStep, setEmailStep] = useState<EmailStep>("off");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);

  const threadRef = useRef<HTMLDivElement>(null);
  const lastHistoryRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const viaKeyboard = useRef(false);

  const done = answers.length === TOTAL;
  const current = done ? null : QUESTIONS[answers.length];
  const step = Math.min(answers.length + 1, TOTAL);
  const progress = (answers.length + (stage.kind === "asking" ? 0 : 1)) / TOTAL;
  const emailActive = emailStep === "asking" || emailStep === "sending";

  // Advance the conversation: selected → typing → next question.
  useEffect(() => {
    if (stage.kind === "selected") {
      const t = setTimeout(() => {
        setAnswers((a) => [...a, stage.index]);
        setStage({ kind: "typing" });
      }, reduceMotion ? 120 : 380);
      return () => clearTimeout(t);
    }
    if (stage.kind === "typing") {
      const t = setTimeout(() => setStage({ kind: "asking" }), reduceMotion ? 150 : 950);
      return () => clearTimeout(t);
    }
  }, [stage, reduceMotion]);

  // Keep the current question fully visible, with the previous exchange above it when there is room.
  // During the email step, follow the newest message at the bottom instead.
  useLayoutEffect(() => {
    const thread = threadRef.current;
    const currentEl = currentRef.current;
    if (!thread || !currentEl) return;
    const behavior = reduceMotion ? "auto" : "smooth";
    if (emailStep !== "off") {
      thread.scrollTo({ top: thread.scrollHeight, behavior });
      return;
    }
    const historyTop = lastHistoryRef.current ? lastHistoryRef.current.offsetTop - 8 : 0;
    const bottomAlign = currentEl.offsetTop + currentEl.offsetHeight - thread.clientHeight + 16;
    const top = Math.min(Math.max(historyTop, bottomAlign), currentEl.offsetTop - 8);
    thread.scrollTo({ top: Math.max(0, top), behavior });
  }, [answers.length, stage.kind, emailStep, reduceMotion]);

  useEffect(() => {
    if (emailStep === "asking") emailInputRef.current?.focus({ preventScroll: true });
  }, [emailStep]);

  // Keyboard users keep their place: when a new option group mounts (after the
  // typing indicator's exit animation), focus moves to its first option.
  const attachOptions = useCallback((el: HTMLDivElement | null) => {
    optionsRef.current = el;
    if (el && viaKeyboard.current) {
      el.querySelector("button")?.focus({ preventScroll: true });
    }
  }, []);

  function choose(index: number, e: React.MouseEvent) {
    if (stage.kind !== "asking") return;
    viaKeyboard.current = e.detail === 0; // Enter/Space fire click with detail 0
    setStage({ kind: "selected", index });
  }

  function restart() {
    viaKeyboard.current = false;
    setAnswers([]);
    setStage({ kind: "asking" });
    setEmailStep("off");
    setEmail("");
    setEmailError(null);
    threadRef.current?.scrollTo({ top: 0 });
  }

  function rejectEmail(message: string) {
    setEmailError(message);
    setShake((n) => n + 1);
    emailInputRef.current?.focus();
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (emailStep !== "asking") return;
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      rejectEmail("Email chưa đúng định dạng, bạn kiểm tra lại giúp mình nhé.");
      return;
    }
    setEmailError(null);
    setEmailStep("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, answers }),
      });
      const data = (await res.json()) as { ok: boolean; primary?: string; secondary?: string | null };
      if (!res.ok || !data.ok) throw new Error();
      setEmailStep("sent");
      const params = new URLSearchParams({ p: data.primary ?? "" });
      if (data.secondary) params.set("s", data.secondary);
      setTimeout(() => router.push(`/report?${params}`), reduceMotion ? 300 : 1600);
    } catch {
      setEmailStep("asking");
      rejectEmail("Chưa gửi được, bạn thử lại sau giây lát nhé.");
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="aura-canvas flex min-h-dvh flex-1 justify-center font-sans text-aura-ink sm:items-center sm:p-8">
        <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-aura-glass backdrop-blur-[20px] sm:h-[min(880px,calc(100dvh-4rem))] sm:max-w-[520px] sm:rounded-[2rem] sm:border sm:border-aura-glass-border sm:shadow-[0_30px_80px_-24px_rgba(199,130,142,0.45)]">
          {/* Top bar */}
          <header className="px-5 pt-5 pb-3 sm:px-7 sm:pt-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <Link href="/" aria-label="Về trang chủ" className={cn(iconButton, "-ml-2")}>
                  <Home className="size-4" />
                </Link>
                <span className="size-2.5 rounded-full bg-gradient-to-br from-aura-rose to-aura-peach shadow-[0_0_10px_rgba(223,152,153,0.8)]" />
                <span className="ml-1 text-[11px] font-medium tracking-[0.22em] text-aura-ink-muted uppercase">
                  Aura Introspection
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-aura-ink-muted tabular-nums" aria-live="polite">
                  {done ? "Hoàn thành" : `Câu ${step} / ${TOTAL}`}
                </span>
                <button type="button" onClick={restart} aria-label="Làm lại từ đầu" className={iconButton}>
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            </div>
            <div
              className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-white/60"
              role="progressbar"
              aria-label="Tiến độ"
              aria-valuemin={0}
              aria-valuemax={TOTAL}
              aria-valuenow={answers.length}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-aura-rose via-aura-clay to-aura-peach shadow-[0_0_8px_rgba(223,152,153,0.9)]"
                initial={false}
                animate={{ width: `${Math.max(progress, 0.02) * 100}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </header>

          {/* Conversation thread — data-lenis-prevent keeps native scrolling inside the card */}
          <div
            ref={threadRef}
            data-lenis-prevent
            className={cn(
              "relative flex-1 overflow-y-auto overscroll-contain px-5 pt-2 sm:px-7",
              emailActive ? "pb-20" : "pb-10", // room for the floating email hint
            )}
          >
            <div className="flex flex-col gap-3">
              {answers.map((optionIndex, i) => {
                const q = QUESTIONS[i];
                return (
                  <motion.div
                    key={q.id}
                    ref={i === answers.length - 1 ? lastHistoryRef : undefined}
                    className="flex flex-col gap-3"
                    {...enter}
                  >
                    <div>
                      <p className={cn(tagLabel, "mb-1.5")}>{q.category}</p>
                      <p className={systemCard}>{q.text}</p>
                    </div>
                    <p className={userBubble}>{q.options[optionIndex].text}</p>
                  </motion.div>
                );
              })}
            </div>

            <div ref={currentRef} className="mt-3">
              <AnimatePresence mode="wait" initial={false}>
                {stage.kind === "typing" ? (
                  <TypingIndicator key="typing" label="Đang chuẩn bị câu hỏi tiếp theo" />
                ) : current ? (
                  <motion.section key={current.id} aria-labelledby={`q-${current.id}`} exit={{ opacity: 0 }} {...enter}>
                    {answers.length > 0 && (
                      <p className="mb-4 text-center text-[10px] tracking-[0.3em] text-aura-ink-muted uppercase">
                        Suy ngẫm
                      </p>
                    )}
                    <p className={cn(tagLabel, "mb-2 flex items-center gap-1.5")}>
                      <Sparkles className="size-3 text-aura-rose" aria-hidden />
                      {current.category}
                    </p>
                    <h1
                      id={`q-${current.id}`}
                      className="rounded-3xl border border-white/80 bg-white/80 px-5 py-5 font-display text-[22px] leading-snug font-medium shadow-[0_12px_40px_-20px_rgba(51,44,48,0.25)] sm:px-6 sm:py-6 sm:text-[26px]"
                    >
                      {current.text}
                    </h1>
                    <div
                      ref={attachOptions}
                      role="group"
                      aria-labelledby={`q-${current.id}`}
                      className="mt-4 flex flex-col gap-2.5"
                    >
                      {current.options.map((opt, i) => {
                        const selected = stage.kind === "selected" && stage.index === i;
                        const dimmed = stage.kind === "selected" && !selected;
                        return (
                          <motion.button
                            key={opt.text}
                            type="button"
                            onClick={(e) => choose(i, e)}
                            disabled={stage.kind !== "asking"}
                            aria-pressed={selected}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: dimmed ? 0.4 : 1, y: 0 }}
                            transition={{ duration: 0.35, delay: stage.kind === "asking" ? 0.08 * i : 0 }}
                            className={cn(
                              "w-full rounded-2xl border px-5 py-3.5 text-left text-sm leading-relaxed transition-[background-color,box-shadow,scale] duration-200",
                              "border-aura-rose/20 bg-aura-pill hover:bg-white hover:shadow-[0_0_0_4px_rgba(223,152,153,0.12),0_10px_28px_-12px_rgba(199,130,142,0.55)] active:scale-[0.98]",
                              focusRing,
                              "disabled:cursor-default",
                              selected &&
                                "scale-[0.98] border-aura-rose/50 bg-white shadow-[0_0_0_4px_rgba(223,152,153,0.18),0_10px_28px_-12px_rgba(199,130,142,0.7)]",
                            )}
                          >
                            {opt.text}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.section>
                ) : (
                  <ResultCard
                    key="result"
                    answers={answers}
                    onRestart={restart}
                    onDetails={() => setEmailStep("asking")}
                    detailsRequested={emailStep !== "off"}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Email step — continues the conversation below the result */}
            {emailStep !== "off" && (
              <motion.div {...enter} className="mt-6 flex flex-col gap-3">
                <div>
                  <p className={cn(tagLabel, "mb-1.5 flex items-center gap-1.5")}>
                    <Sparkles className="size-3 text-aura-rose" aria-hidden />
                    Bước cuối cùng
                  </p>
                  <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-white/80 bg-white/80 px-4 py-4 shadow-[0_12px_40px_-20px_rgba(51,44,48,0.25)]">
                    <p className="font-display text-lg leading-snug">Báo cáo chi tiết của bạn đã sẵn sàng.</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-aura-ink-muted">
                      Hãy để lại email ở ô phía dưới rồi nhấn nút gửi — chúng mình sẽ mở báo cáo ngay cho bạn.
                    </p>
                  </div>
                </div>
                {emailStep === "sent" && (
                  <>
                    <motion.p {...enter} className={userBubble}>
                      {email.trim()}
                    </motion.p>
                    <motion.div {...enter} className="flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded-full bg-gradient-to-br from-aura-rose to-aura-clay">
                        <Check className="size-3.5 text-aura-ink" />
                      </span>
                      <p className="text-[13px] text-aura-ink-muted" role="status">
                        Đã ghi nhận — đang mở báo cáo của bạn…
                      </p>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer — ambient until the email step, then it becomes the email field */}
          <footer className="relative border-t border-white/60 px-5 py-4 sm:px-7">
            {emailActive ? (
              <form onSubmit={submitEmail} noValidate className="relative">
                <AnimatePresence>
                  {!email && emailStep === "asking" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="pointer-events-none absolute -top-14 left-1/2 flex -translate-x-1/2 flex-col items-center"
                      aria-hidden
                    >
                      <span className="flex items-center gap-1.5 rounded-full bg-aura-ink px-3.5 py-1.5 text-[11px] font-medium whitespace-nowrap text-white shadow-lg">
                        <Sparkles className="size-3 text-aura-peach" />
                        Nhập email vào đây rồi nhấn gửi
                      </span>
                      <motion.span
                        animate={reduceMotion ? undefined : { y: [0, 4, 0] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ChevronDown className="size-4 text-aura-ink" />
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  key={shake}
                  animate={shake && !reduceMotion ? { x: [0, -9, 9, -6, 6, -3, 0] } : undefined}
                  transition={{ duration: 0.45 }}
                  className="aura-glow-ring rounded-full p-[1.5px]"
                >
                  <div className="flex items-center gap-2 rounded-full bg-white/95 py-1.5 pr-1.5 pl-4">
                    <Mail className="size-4 shrink-0 text-aura-clay" aria-hidden />
                    <label htmlFor="report-email" className="sr-only">
                      Email nhận báo cáo
                    </label>
                    <input
                      ref={emailInputRef}
                      id="report-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="email.cua.ban@gmail.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      disabled={emailStep === "sending"}
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? "report-email-error" : undefined}
                      className="min-w-0 flex-1 bg-transparent text-sm text-aura-ink placeholder:text-aura-ink-muted/70 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={emailStep === "sending"}
                      aria-label="Gửi email và xem báo cáo"
                      className={cn(
                        "relative grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-aura-rose to-aura-clay text-aura-ink shadow-[0_8px_20px_-8px_rgba(199,130,142,0.9)] transition active:scale-95",
                        focusRing,
                      )}
                    >
                      {emailStep === "asking" && EMAIL_RE.test(email.trim()) && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-aura-rose/50 motion-reduce:hidden" aria-hidden />
                      )}
                      {emailStep === "sending" ? (
                        <Loader2 className="relative size-4 animate-spin" />
                      ) : (
                        <ArrowRight className="relative size-4" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {emailError && (
                  <p id="report-email-error" role="alert" className="mt-2 text-center text-xs text-[#9b3b4a]">
                    {emailError}
                  </p>
                )}
              </form>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/60 py-1.5 pr-1.5 pl-4">
                <input
                  readOnly
                  tabIndex={-1}
                  aria-label="Hãy chọn một đáp án ở trên"
                  placeholder={emailStep === "sent" ? "Cảm ơn bạn ✦" : "Lắng nghe trực giác của bạn ở trên…"}
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-aura-ink italic placeholder:text-aura-ink-muted focus:outline-none"
                />
                <Sparkles className="size-3.5 shrink-0 text-aura-rose/70" aria-hidden />
                <button
                  type="button"
                  aria-label="Đến đáp án đầu tiên"
                  onClick={() => optionsRef.current?.querySelector("button")?.focus()}
                  disabled={done || stage.kind !== "asking"}
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full bg-white text-aura-ink shadow-sm transition hover:shadow-md disabled:opacity-50",
                    focusRing,
                  )}
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            )}
          </footer>
        </div>
      </div>
    </MotionConfig>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-white/70 bg-white/60 px-4 py-3.5"
      role="status"
      aria-label={label}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-aura-clay"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </motion.div>
  );
}

function ResultCard({
  answers,
  onRestart,
  onDetails,
  detailsRequested,
}: {
  answers: number[];
  onRestart: () => void;
  onDetails: () => void;
  detailsRequested: boolean;
}) {
  const { primary, secondary } = computeResult(answers);

  return (
    <motion.section {...enter} aria-labelledby="result-title" className="flex flex-col gap-4">
      <p className="text-center text-[10px] tracking-[0.3em] text-aura-ink-muted uppercase">Hào quang của bạn</p>
      <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/75 px-6 py-8 text-center shadow-[0_20px_50px_-24px_rgba(199,130,142,0.6)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 left-1/2 size-48 -translate-x-1/2 rounded-full bg-gradient-to-br from-aura-rose/50 via-aura-peach/60 to-aura-lavender blur-2xl"
        />
        <p className="relative text-[11px] tracking-[0.2em] text-aura-ink-muted uppercase">Nguyên mẫu chính</p>
        <h1 id="result-title" className="relative mt-3 font-display text-4xl leading-tight font-medium">
          {primary.name}
        </h1>
        <p className="relative mt-1 font-display text-lg text-aura-clay italic">The {primary.english}</p>
        <p className="relative mx-auto mt-4 max-w-xs text-sm leading-relaxed text-aura-ink-muted">{primary.motivation}</p>
        {secondary && (
          <p className="relative mt-5 text-xs text-aura-ink-muted">
            Nguyên mẫu phụ: <span className="font-medium text-aura-ink">{secondary.name}</span>
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={onRestart}
          className={cn(
            "flex-1 rounded-2xl border border-aura-rose/20 bg-aura-pill px-5 py-3.5 text-sm transition hover:bg-white active:scale-[0.98]",
            focusRing,
          )}
        >
          Làm lại
        </button>
        {!detailsRequested && (
          <button
            type="button"
            onClick={onDetails}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-aura-rose to-aura-clay px-5 py-3.5 text-sm font-medium text-aura-ink shadow-[0_10px_24px_-10px_rgba(199,130,142,0.8)] transition active:scale-[0.98]",
              focusRing,
            )}
          >
            <Sparkles className="size-4" aria-hidden />
            Xem chi tiết
          </button>
        )}
      </div>
    </motion.section>
  );
}
