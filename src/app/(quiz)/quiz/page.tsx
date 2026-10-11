import type { Metadata } from "next";
import AuraQuiz from "@/components/quiz/AuraQuiz";

export const metadata: Metadata = {
  title: "Aura Introspection",
  description: "15 câu hỏi để khám phá nguyên mẫu (archetype) bên trong bạn.",
};

export default function QuizPage() {
  return <AuraQuiz />;
}
