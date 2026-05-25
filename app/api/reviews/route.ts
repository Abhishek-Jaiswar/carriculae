import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Curriculum } from "@/lib/models/Curriculum";
import { Subject } from "@/lib/models/Subject";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const [subjects, curricula] = await Promise.all([
    Subject.find({ userId }).lean(),
    Curriculum.find({ userId }).lean(),
  ]);

  const titleById = new Map(subjects.map((s) => [String(s._id), s.title as string]));

  const now = Date.now();
  const due: Array<{
    subjectId: string;
    subjectTitle: string;
    topicId: string;
    topicTitle: string;
    nextReviewAt: string;
    reviewLevel: number;
  }> = [];

  for (const c of curricula) {
    const sid = String(c.subjectId);
    const subjectTitle = titleById.get(sid) || "Subject";
    for (const t of c.topics || []) {
      const next = t.nextReviewAt ? new Date(t.nextReviewAt).getTime() : null;
      if (t.status === "done" && next !== null && next <= now) {
        due.push({
          subjectId: sid,
          subjectTitle,
          topicId: String(t._id),
          topicTitle: String(t.title || ""),
          nextReviewAt: new Date(next).toISOString(),
          reviewLevel: Number(t.reviewLevel) || 1,
        });
      }
    }
  }

  due.sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime());

  return NextResponse.json({ due, count: due.length });
}
