import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { updateStreakAndAchievements } from "@/lib/streak";
import { LearningSession } from "@/lib/models/LearningSession";
import { Subject } from "@/lib/models/Subject";
import { Curriculum } from "@/lib/models/Curriculum";

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const subjectId = String(body.subjectId || "").trim();
  const topicId = String(body.topicId || "").trim();
  const notes = String(body.notes || "").slice(0, 2000);
  const mood = String(body.mood || "good");
  const durationMinutes = Number(body.durationMinutes || 0);

  if (!subjectId || !topicId || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return NextResponse.json({ error: "Invalid session payload." }, { status: 400 });
  }

  await connectDB();

  const subject = await Subject.findOne({ _id: subjectId, userId });
  if (!subject) return NextResponse.json({ error: "Subject not found." }, { status: 404 });

  const curriculum = await Curriculum.findOne({ subjectId, userId });
  const topic = curriculum?.topics?.find((t: { _id: unknown }) => String(t._id) === topicId);
  if (!topic) return NextResponse.json({ error: "Topic not found." }, { status: 404 });

  const session = await LearningSession.create({
    userId,
    subjectId,
    subjectTitle: subject.title,
    topicId,
    topicTitle: topic.title,
    durationMinutes: Math.max(1, Math.round(durationMinutes)),
    notes,
    mood: ["great", "good", "okay", "tough"].includes(mood) ? mood : "good",
  });

  const user = await updateStreakAndAchievements(
    userId,
    Math.max(1, Math.round(durationMinutes)),
    subjectId
  );

  return NextResponse.json({
    session,
    user: {
      currentStreak: user?.currentStreak ?? 0,
      longestStreak: user?.longestStreak ?? 0,
      totalMinutesLearned: user?.totalMinutesLearned ?? 0,
      achievements: user?.achievements ?? [],
    },
  });
}
