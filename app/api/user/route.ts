import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findOneAndUpdate(
    { userId },
    {},
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();

  const update: Record<string, unknown> = {};
  if (typeof body.dailyGoalMinutes === "number") {
    update.dailyGoalMinutes = Math.max(10, Math.min(480, Math.round(body.dailyGoalMinutes)));
  }
  if (typeof body.name === "string") {
    update.name = body.name.trim().slice(0, 60);
  }

  const user = await User.findOneAndUpdate(
    { userId },
    update,
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json(user);
}
