import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Curriculum } from "@/lib/models/Curriculum";
import { Subject } from "@/lib/models/Subject";
import { generateTopicQuiz } from "@/lib/quiz";
import { getFirstIncompleteTopicId } from "@/lib/topic-progress";

type TopicDoc = {
  _id: unknown;
  title: string;
  description?: string;
  subtopics?: Array<{ title?: string }>;
  resources?: Array<{ title?: string; url?: string; type?: string }>;
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

  await connectDB();
  const { id, topicId } = await params;

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
  if (topic.quiz?.status === "passed") {
    return NextResponse.json({ error: "Quiz already passed for this topic." }, { status: 409 });
  }

  let questions = topic.quiz?.questions || [];
  if (!questions.length) {
    questions = await generateTopicQuiz({
      subjectTitle: subject.title,
      topicTitle: topic.title,
      topicDescription: topic.description || "",
      subtopics: (topic.subtopics || []).map((s) => String(s.title || "")).filter(Boolean),
      resources: (topic.resources || []).map((r) => ({
        title: r.title,
        url: r.url,
        type: r.type,
      })),
    });

    await Curriculum.findOneAndUpdate(
      { subjectId: id, userId, "topics._id": topicId },
      {
        $set: {
          "topics.$.quiz.status": "ready",
          "topics.$.quiz.questions": questions,
          "topics.$.quiz.cooldownUntil": null,
          "topics.$.quiz.lastAttemptAt": null,
        },
      }
    );
  }

  return NextResponse.json({
    quiz: {
      status: "ready",
      attemptCount: topic.quiz?.attemptCount || 0,
      cooldownUntil: topic.quiz?.cooldownUntil || null,
      questions: questions.map((q) => ({
        question: q.question,
        options: q.options,
      })),
    },
  });
}
