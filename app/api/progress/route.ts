import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { LearningSession } from "@/lib/models/LearningSession";
import { Subject } from "@/lib/models/Subject";
import { User } from "@/lib/models/User";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const [user, subjects, sessions] = await Promise.all([
    User.findOne({ userId }),
    Subject.find({ userId }),
    LearningSession.find({ userId }).sort({ sessionDate: -1 }),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const todayMinutes = sessions
    .filter((s) => s.sessionDate.toISOString().split("T")[0] === today)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const heatmap: Record<string, number> = {};
  sessions.forEach((s) => {
    const day = s.sessionDate.toISOString().split("T")[0];
    heatmap[day] = (heatmap[day] || 0) + s.durationMinutes;
  });

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    return {
      date: key,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      minutes: heatmap[key] || 0,
    };
  });

  const subjectTime = subjects.map((s) => ({
    name: s.title,
    minutes: s.totalMinutesSpent,
    color: s.color,
  }));

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoTime = weekAgo.getTime();

  let sessionsLast7Days = 0;
  let minutesLast7Days = 0;
  for (const s of sessions) {
    const t = new Date(s.sessionDate).getTime();
    if (t >= weekAgoTime) {
      sessionsLast7Days += 1;
      minutesLast7Days += s.durationMinutes;
    }
  }

  const topicsCompletedTotal = subjects.reduce((acc, s) => acc + (s.completedTopics || 0), 0);
  const attempts = Math.max(0, user?.quizAttempts || 0);
  const passes = Math.max(0, user?.quizPasses || 0);
  const quizPassRatePercent =
    attempts > 0 ? Math.round((passes / attempts) * 100) : null;

  return NextResponse.json({
    user,
    todayMinutes,
    dailyGoalMinutes: user?.dailyGoalMinutes || 60,
    weeklyData,
    subjectTime,
    heatmap,
    totalSessions: sessions.length,
    recentSessions: sessions.slice(0, 5),
    metrics: {
      sessionsLast7Days,
      minutesLast7Days,
      topicsCompletedTotal,
      quizAttempts: attempts,
      quizPasses: passes,
      quizPassRatePercent,
    },
  });
}
