import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Curriculum } from "@/lib/models/Curriculum";
import { Subject } from "@/lib/models/Subject";
import { nextScheduleAfterReviewComplete } from "@/lib/spaced-repetition";

type TopicDoc = {
  _id: unknown;
  status?: string;
  reviewLevel?: number;
  nextReviewAt?: Date | null;
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

  const topic = (curriculum.topics || []).find((t: TopicDoc) => String(t._id) === topicId) as
    | TopicDoc
    | undefined;
  if (!topic) return NextResponse.json({ error: "Topic not found." }, { status: 404 });

  if (topic.status !== "done") {
    return NextResponse.json({ error: "Complete the topic before marking reviews." }, { status: 409 });
  }

  const dueAt = topic.nextReviewAt ? new Date(topic.nextReviewAt) : null;
  if (!dueAt || dueAt.getTime() > Date.now()) {
    return NextResponse.json({ error: "No spaced review is due for this topic yet." }, { status: 409 });
  }

  const currentLevel = Math.max(1, Number(topic.reviewLevel) || 1);
  const next = nextScheduleAfterReviewComplete(currentLevel);

  await Curriculum.findOneAndUpdate(
    { subjectId: id, userId, "topics._id": topicId },
    {
      $set: {
        "topics.$.reviewLevel": next.reviewLevel,
        "topics.$.nextReviewAt": next.nextReviewAt,
      },
    }
  );

  return NextResponse.json({
    ok: true,
    reviewLevel: next.reviewLevel,
    nextReviewAt: next.nextReviewAt,
  });
}
