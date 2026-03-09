"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Clock, Flame, Plus, Target, TrendingUp } from "lucide-react";

import { SubjectIcon } from "@/components/app-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface ProgressData {
  user: {
    currentStreak: number;
    longestStreak: number;
    totalMinutesLearned: number;
  } | null;
  todayMinutes: number;
  dailyGoalMinutes: number;
  weeklyData: { date: string; label: string; minutes: number }[];
}

interface Subject {
  _id: string;
  title: string;
  icon: string;
  completedTopics: number;
  totalTopics: number;
}

export default function DashboardPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/progress"), fetch("/api/subjects")])
      .then(async ([progressRes, subjectsRes]) => {
        const progressJson = await progressRes.json();
        const subjectsJson = await subjectsRes.json();
        setProgress(progressJson);
        setSubjects(subjectsJson);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full space-y-6 p-4 md:p-8">
        <Skeleton className="h-10 w-52" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const todayMinutes = progress?.todayMinutes ?? 0;
  const dailyGoal = progress?.dailyGoalMinutes ?? 60;
  const todayPct = Math.min((todayMinutes / Math.max(dailyGoal, 1)) * 100, 100);
  const totalHours = Math.round(((progress?.user?.totalMinutesLearned ?? 0) / 60) * 10) / 10;

  return (
    <div className="w-full space-y-6 p-4 md:p-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Learning overview</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/subjects/new">
            <Plus />
            New Subject
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card size="sm">
          <CardContent className="pt-4">
            <div className="mb-2 flex items-center justify-between text-muted-foreground">
              <Flame className="size-4" />
              <span className="text-xs">Current streak</span>
            </div>
            <p className="text-2xl font-semibold">{progress?.user?.currentStreak ?? 0}d</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-4">
            <div className="mb-2 flex items-center justify-between text-muted-foreground">
              <Target className="size-4" />
              <span className="text-xs">Today</span>
            </div>
            <p className="text-2xl font-semibold">
              {todayMinutes}/{dailyGoal}m
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-4">
            <div className="mb-2 flex items-center justify-between text-muted-foreground">
              <Clock className="size-4" />
              <span className="text-xs">Total learned</span>
            </div>
            <p className="text-2xl font-semibold">{totalHours}h</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-4">
            <div className="mb-2 flex items-center justify-between text-muted-foreground">
              <TrendingUp className="size-4" />
              <span className="text-xs">Best streak</span>
            </div>
            <p className="text-2xl font-semibold">{progress?.user?.longestStreak ?? 0}d</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Minutes studied over last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid h-44 grid-cols-7 items-end gap-2">
              {progress?.weeklyData.map((d) => {
                const max = Math.max(...(progress.weeklyData.map((x) => x.minutes) || [1]), 1);
                const h = Math.max((d.minutes / max) * 100, d.minutes > 0 ? 6 : 0);
                return (
                  <div key={d.date} className="flex flex-col items-center gap-1">
                    <div className="flex h-28 w-full items-end">
                      <div className="w-full rounded-md bg-muted" style={{ height: `${h}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{d.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={todayPct} />
            <p className="text-sm text-muted-foreground">
              {todayMinutes >= dailyGoal ? "Goal reached today." : `${dailyGoal - todayMinutes}m remaining`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.slice(0, 6).map((subject) => {
                const pct =
                  subject.totalTopics > 0
                    ? Math.round((subject.completedTopics / subject.totalTopics) * 100)
                    : 0;
                return (
                  <Link
                    key={subject._id}
                    href={`/dashboard/subjects/${subject._id}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <SubjectIcon icon={subject.icon} className="size-4" />
                        <span className="truncate text-sm font-medium">{subject.title}</span>
                      </div>
                      <Badge variant="outline">{pct}%</Badge>
                    </div>
                    <Progress value={pct} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              <BookOpen className="mr-2 size-4" />
              No subjects yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
