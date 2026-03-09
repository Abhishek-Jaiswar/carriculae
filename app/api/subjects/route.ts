import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Curriculum } from "@/lib/models/Curriculum";
import { Subject } from "@/lib/models/Subject";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const subjects = await Subject.find({ userId }).sort({ createdAt: -1 });
  return NextResponse.json(subjects);
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { title, description, icon, color, skillLevel, tags } = body;

  const subject = await Subject.create({
    userId,
    title,
    description,
    icon,
    color,
    skillLevel,
    tags,
  });

  await Curriculum.create({
    subjectId: subject._id.toString(),
    userId,
    topics: [],
  });

  return NextResponse.json(subject, { status: 201 });
}
