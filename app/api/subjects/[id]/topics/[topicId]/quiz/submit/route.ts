import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Curriculum } from "@/lib/models/Curriculum";
import { Subject } from "@/lib/models/Subject";
import { User } from "@/lib/models/User";
import { rateLimitCheck } from "@/lib/rate-limit";
import { nextReviewAfterPass } from "@/lib/spaced-repetition";
import { getFirstIncompleteTopicId } from "@/lib/topic-progress";

const PASS_PERCENT = 80;
const COOLDOWN_MS = 2 * 60 * 1000;

type TopicDoc = {
  _id: unknown;
  status?: "todo" | "in-progress" | "done";
  reviewLevel?: number;
  quiz?: {
    status?: "not_generated" | "ready" | "passed";
    questions?: Array<{
      question: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    }>;
    attemptCount?: number;
    cooldownUntil?: Date | null;
    lastAttemptAt?: Date | null;
  };
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimitCheck(`quiz_submit:${userId}`, 40, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many quiz submissions. Try again shortly.", retryAfter: rl.retryAfterSec },
      { status: 429 }
    );
  }

  await connectDB();
  const { id, topicId } = await params;
  const body = await req.json();
  const answers = Array.isArray(body.answers) ? body.answers.map((a: unknown) => Number(a)) : [];
  const rawConfidence = body.confidenceBeforeQuiz;
  const confidenceBeforeQuiz =
    typeof rawConfidence === "number" &&
    Number.isFinite(rawConfidence) &&
    rawConfidence >= 1 &&
    rawConfidence <= 5
      ? Math.round(rawConfidence)
      : null;
  const reflection = String(body.reflection || "").trim().slice(0, 2000);

  const [subject, curriculum] = await Promise.all([
    Subject.findOne({ _id: id, userId }),
    Curriculum.findOne({ subjectId: id, userId }),
  ]);
  if (!subject || !curriculum) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const requiredTopicId = getFirstIncompleteTopicId(curriculum.topics || []);
  if (requiredTopicId && requiredTopicId !== topicId) {
    return NextResponse.json(
      { error: "This topic is locked.", requiredTopicId },
      { status: 409 }
    );
  }

  const topic = (curriculum.topics || []).find((t: TopicDoc) => String(t._id) === topicId) as TopicDoc | undefined;
  if (!topic) return NextResponse.json({ error: "Topic not found." }, { status: 404 });

  const questions = topic.quiz?.questions || [];
  if (topic.quiz?.status !== "ready" || !questions.length) {
    return NextResponse.json({ error: "Quiz is not ready. Start quiz first." }, { status: 409 });
  }
  if (answers.length !== questions.length) {
    return NextResponse.json({ error: "Please answer all quiz questions." }, { status: 400 });
  }

  const now = new Date();
  const cooldownUntil = topic.quiz?.cooldownUntil ? new Date(topic.quiz.cooldownUntil) : null;
  if (cooldownUntil && cooldownUntil.getTime() > now.getTime()) {
    return NextResponse.json(
      { error: "Quiz cooldown is active.", cooldownUntil },
      { status: 429 }
    );
  }

  let correctCount = 0;
  const review = questions.map((q, idx) => {
    const selected = Number(answers[idx]);
    const isCorrect = selected === q.correctIndex;
    if (isCorrect) correctCount += 1;
    return {
      question: q.question,
      options: q.options,
      selectedIndex: selected,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation || "",
    };
  });

  const total = questions.length;
  const score = Math.round((correctCount / Math.max(total, 1)) * 100);
  const passed = score >= PASS_PERCENT;
  const nextAttemptCount = (topic.quiz?.attemptCount || 0) + 1;

  const incStats: Record<string, number> = { quizAttempts: 1 };
  if (passed) incStats.quizPasses = 1;
  await User.findOneAndUpdate({ userId }, { $inc: incStats });

  if (passed) {
    const spaced = nextReviewAfterPass(now);
    const updated = await Curriculum.findOneAndUpdate(
      { subjectId: id, userId, "topics._id": topicId },
      {
        $set: {
          "topics.$.quiz.status": "passed",
          "topics.$.quiz.attemptCount": nextAttemptCount,
          "topics.$.quiz.lastAttemptAt": now,
          "topics.$.quiz.cooldownUntil": null,
          "topics.$.quiz.confidenceBeforeQuiz": confidenceBeforeQuiz,
          "topics.$.quiz.reflection": reflection,
          "topics.$.status": "done",
          "topics.$.completedAt": now,
          "topics.$.reviewLevel": spaced.reviewLevel,
          "topics.$.nextReviewAt": spaced.nextReviewAt,
        },
      },
      { returnDocument: "after" }
    );

    const completedCount =
      updated?.topics?.filter((t: { status?: string }) => t.status === "done").length || 0;
    await Subject.findByIdAndUpdate(id, { completedTopics: completedCount });

    return NextResponse.json({
      passed: true,
      score,
      correctCount,
      total,
      review,
      cooldownUntil: null,
      nextReviewAt: spaced.nextReviewAt,
    });
  }

  const nextCooldown = new Date(now.getTime() + COOLDOWN_MS);
  await Curriculum.findOneAndUpdate(
    { subjectId: id, userId, "topics._id": topicId },
    {
      $set: {
        "topics.$.quiz.attemptCount": nextAttemptCount,
        "topics.$.quiz.lastAttemptAt": now,
        "topics.$.quiz.cooldownUntil": nextCooldown,
      },
    }
  );

  return NextResponse.json({
    passed: false,
    score,
    correctCount,
    total,
    review,
    cooldownUntil: nextCooldown,
  });
}
