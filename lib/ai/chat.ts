import { DEFAULT_GROQ_MODEL, type GroqMessage, groqTextStream } from "@/lib/ai/groq";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

type SubjectContext = {
  title: string;
  description?: string;
  skillLevel?: string;
  tags?: string[];
};

function normalizeTurns(turns: ChatTurn[]) {
  return turns
    .map((turn) => ({
      role: turn.role,
      content: String(turn.content || "").trim().slice(0, 4000),
    }))
    .filter((turn): turn is ChatTurn => Boolean(turn.content))
    .slice(-12);
}

function buildSystemPrompt(subject?: SubjectContext) {
  const subjectSummary = subject
    ? `Current study context:
- Subject: ${subject.title}
- Skill level: ${subject.skillLevel || "unspecified"}
- Description: ${subject.description?.trim() || "none provided"}
- Tags: ${subject.tags?.join(", ") || "none"}`
    : `Current study context:
- No subject selected yet`;

  return `You are Carriculae's study coach.

Your job:
- explain concepts clearly and accurately
- adapt to the learner's current level
- keep answers practical, structured, and concise unless the user asks for more depth
- when helpful, suggest the next study step, a quick exercise, or a way to verify understanding
- if the user asks for a plan, organize it step by step
- do not pretend to have browsed the web or verified external facts unless the app explicitly provides that capability

Style:
- warm and direct
- avoid markdown tables
- prefer short sections and bullets when clarity improves

${subjectSummary}`;
}

export async function createChatResponseStream(input: {
  messages: ChatTurn[];
  subject?: SubjectContext;
}): Promise<ReadableStream<Uint8Array>> {
  const normalizedTurns = normalizeTurns(input.messages);
  if (!normalizedTurns.length) {
    throw new Error("At least one message is required.");
  }

  const messages: GroqMessage[] = [
    {
      role: "system",
      content: buildSystemPrompt(input.subject),
    },
    ...normalizedTurns.map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
  ];

  return groqTextStream({
    model: DEFAULT_GROQ_MODEL,
    temperature: 0.6,
    messages,
  });
}
