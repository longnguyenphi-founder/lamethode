import { ARCHETYPES, QUESTIONS, type Archetype, type ArchetypeCode } from "./questions";

/** Scored questions in the last third count ×1.2 — used only to break ties (spec §3.4). */
const LATE_WEIGHT = 1.2;

export type QuizResult = {
  primary: Archetype;
  secondary: Archetype | null;
  scores: Record<ArchetypeCode, number>;
};

/** `answers[i]` is the chosen option index for QUESTIONS[i]. */
export function computeResult(answers: number[]): QuizResult {
  const codes = Object.keys(ARCHETYPES) as ArchetypeCode[];
  const scores = Object.fromEntries(codes.map((c) => [c, 0])) as Record<ArchetypeCode, number>;
  const weighted = { ...scores };

  const scored = QUESTIONS.filter((q) => q.options.some((o) => o.archetype));
  const lateFrom = Math.floor((scored.length * 2) / 3);

  answers.forEach((optionIndex, i) => {
    const code = QUESTIONS[i]?.options[optionIndex]?.archetype;
    if (!code) return;
    const scoredIndex = scored.indexOf(QUESTIONS[i]);
    scores[code] += 1;
    weighted[code] += scoredIndex >= lateFrom ? LATE_WEIGHT : 1;
  });

  const ranked = [...codes].sort(
    (a, b) => scores[b] - scores[a] || weighted[b] - weighted[a],
  );

  return {
    primary: ARCHETYPES[ranked[0]],
    secondary: scores[ranked[1]] > 0 ? ARCHETYPES[ranked[1]] : null,
    scores,
  };
}
