import { DEFAULT_GROQ_MODEL, groqJsonCompletion } from "@/lib/ai/groq";

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export async function generateTopicQuiz(input: {
  subjectTitle: string;
  topicTitle: string;
  topicDescription: string;
  subtopics: string[];
  resources: Array<{ title?: string; url?: string; type?: string }>;
}): Promise<QuizQuestion[]> {
  const prompt = `Create exactly 5 multiple-choice quiz questions to verify understanding.

Subject: ${input.subjectTitle}
Topic: ${input.topicTitle}
Description: ${input.topicDescription}
Subtopics: ${input.subtopics.join(", ") || "none"}
Resources: ${input.resources.map((r) => `${r.type || "article"}:${r.title || r.url || ""}`).join(", ") || "none"}

Return ONLY JSON object:
{
  "questions": [
    {
      "question": "string",
      "options": ["A","B","C","D"],
      "correctIndex": 0,
      "explanation": "short explanation"
    }
  ]
}

Rules:
- exactly 5 questions
- exactly 4 options per question
- correctIndex between 0 and 3
- no markdown`;

  const parsed = await groqJsonCompletion<{ questions?: unknown }>({
    model: DEFAULT_GROQ_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: "You produce strict machine-readable JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  const questionsRaw = Array.isArray(parsed.questions) ? parsed.questions : [];

  const questions = questionsRaw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const q = item as Record<string, unknown>;
      const question = String(q.question || "").trim().slice(0, 400);
      const options = Array.isArray(q.options)
        ? q.options.map((opt) => String(opt || "").trim().slice(0, 200)).filter(Boolean).slice(0, 4)
        : [];
      const correctIndex = Number(q.correctIndex);
      const explanation = String(q.explanation || "").trim().slice(0, 300);
      if (!question || options.length !== 4) return null;
      if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) return null;
      return { question, options, correctIndex, explanation };
    })
    .filter((q): q is QuizQuestion => Boolean(q))
    .slice(0, 5);

  if (questions.length !== 5) {
    throw new Error("Quiz generation returned invalid payload.");
  }

  return questions;
}
