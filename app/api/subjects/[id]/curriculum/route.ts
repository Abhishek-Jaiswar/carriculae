import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Curriculum } from "@/lib/models/Curriculum";
import { Subject } from "@/lib/models/Subject";
import { User } from "@/lib/models/User";

type ResourceInput = {
  title?: unknown;
  url?: unknown;
  type?: unknown;
};

type TopicInput = {
  title?: unknown;
  description?: unknown;
  estimatedMinutes?: unknown;
  resources?: unknown;
  subtopics?: unknown;
};

type SubtopicInput = {
  title?: unknown;
  done?: unknown;
};

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const rawTopics = Array.isArray(body.topics) ? (body.topics as TopicInput[]) : null;

  if (!rawTopics || rawTopics.length === 0) {
    return NextResponse.json({ error: "Topics are required." }, { status: 400 });
  }

  const topics = rawTopics
    .map((topic, index) => {
      const title = String(topic.title || "").trim();
      if (!title) return null;

      const resources = Array.isArray(topic.resources)
        ? (topic.resources as ResourceInput[]).map((resource) => ({
            title: String(resource.title || "").trim(),
            url: String(resource.url || "").trim(),
            type: ["video", "article", "book", "other"].includes(String(resource.type))
              ? String(resource.type)
              : "article",
          }))
        : [];
      const subtopics = Array.isArray(topic.subtopics)
        ? (topic.subtopics as SubtopicInput[])
            .map((subtopic) => ({
              title: String(subtopic.title || "").trim(),
              done: false,
            }))
            .filter((subtopic) => subtopic.title)
        : [];

      return {
        title,
        description: String(topic.description || "").trim(),
        estimatedMinutes: Math.max(15, Math.min(120, Math.round(Number(topic.estimatedMinutes || 30)))),
        resources: resources.filter((r) => r.title || r.url),
        subtopics,
        order: index,
        status: "todo" as const,
        actualMinutes: 0,
        notes: "",
        completedAt: null,
      };
    })
    .filter(Boolean);

  if (topics.length === 0) {
    return NextResponse.json({ error: "No valid topics to save." }, { status: 400 });
  }

  await connectDB();

  const subject = await Subject.findOne({ _id: id, userId });
  if (!subject) return NextResponse.json({ error: "Subject not found." }, { status: 404 });
  const existingCurriculum = await Curriculum.findOne({ subjectId: id, userId });
  if (existingCurriculum?.aiGenerated && (existingCurriculum.topics?.length || 0) > 0) {
    return NextResponse.json(
      { error: "AI curriculum already generated for this subject." },
      { status: 409 }
    );
  }

  const curriculum = await Curriculum.findOneAndUpdate(
    { subjectId: id, userId },
    { $set: { aiGenerated: true, topics }, $setOnInsert: { subjectId: id, userId } },
    { returnDocument: "after", upsert: true }
  );

  await Subject.findByIdAndUpdate(id, {
    totalTopics: topics.length,
    completedTopics: 0,
  });

  await User.findOneAndUpdate(
    { userId },
    { $addToSet: { achievements: "ai_explorer" } },
    { upsert: true }
  );

  return NextResponse.json({ curriculum, topicsCount: topics.length });
}
