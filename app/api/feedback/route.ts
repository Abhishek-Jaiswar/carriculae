import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { CurriculumFeedback } from "@/lib/models/CurriculumFeedback";
import { Subject } from "@/lib/models/Subject";

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const subjectId = String(body.subjectId || "").trim();
  const topicId = String(body.topicId || "").trim();
  const targetType = String(body.targetType || "topic");
  const resourceUrl = String(body.resourceUrl || "").trim().slice(0, 400);
  const sentiment = String(body.sentiment || "").trim();
  const note = String(body.note || "").trim().slice(0, 2000);

  if (!subjectId) {
    return NextResponse.json({ error: "subjectId is required." }, { status: 400 });
  }
  if (!["up", "down", "issue"].includes(sentiment)) {
    return NextResponse.json({ error: "Invalid sentiment." }, { status: 400 });
  }
  if (!["topic", "resource", "curriculum"].includes(targetType)) {
    return NextResponse.json({ error: "Invalid targetType." }, { status: 400 });
  }

  await connectDB();
  const subject = await Subject.findOne({ _id: subjectId, userId });
  if (!subject) return NextResponse.json({ error: "Subject not found." }, { status: 404 });

  const doc = await CurriculumFeedback.create({
    userId,
    subjectId,
    topicId,
    targetType,
    resourceUrl,
    sentiment,
    note,
  });

  return NextResponse.json({ id: doc._id, ok: true });
}
