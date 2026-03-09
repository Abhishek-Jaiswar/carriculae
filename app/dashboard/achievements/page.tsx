"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

import { AchievementIcon } from "@/components/app-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ACHIEVEMENTS } from "@/lib/constants";

export default function AchievementsPage() {
  const [earned, setEarned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((u) => {
        setEarned(u.achievements || []);
        setLoading(false);
      });
  }, []);

  const unlocked = ACHIEVEMENTS.filter((a) => earned.includes(a.id));
  const locked = ACHIEVEMENTS.filter((a) => !earned.includes(a.id));
  const pct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  if (loading) {
    return (
      <div className="w-full space-y-4 p-4 md:p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {unlocked.length} of {ACHIEVEMENTS.length} unlocked
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="space-y-3 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Overall Progress</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {unlocked.length} unlocked - {locked.length} remaining
              </p>
            </div>
            <Badge variant="outline" className="text-sm font-bold tabular-nums">
              {pct}%
            </Badge>
          </div>
          <Progress value={pct} />
        </CardContent>
      </Card>

      {unlocked.length > 0 ? (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unlocked</h2>
            <Badge variant="success">{unlocked.length}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {unlocked.map((a) => (
              <Card key={a.id} className="ring-ring/20">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <AchievementIcon icon={a.icon} className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
                  </div>
                  <Badge variant="success" className="ml-auto shrink-0">
                    Done
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {unlocked.length > 0 && locked.length > 0 ? <Separator className="mb-6" /> : null}

      {locked.length > 0 ? (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Locked</h2>
            <Badge variant="secondary">{locked.length}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {locked.map((a) => (
              <Card key={a.id} className="opacity-50">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <AchievementIcon icon={a.icon} className="size-5" />
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{a.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground/60">{a.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
