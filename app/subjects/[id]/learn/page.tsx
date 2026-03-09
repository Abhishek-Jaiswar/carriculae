"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, use } from "react";
import { ArrowLeft, BookOpen, Pause, Play, Square } from "lucide-react";
import { toast } from "sonner";

import { MoodIcon, ResourceTypeIcon, SubjectIcon } from "@/components/app-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { MOODS } from "@/lib/constants";

interface Topic {
  _id: string;
  title: string;
  description: string;
  status: string;
  estimatedMinutes: number;
  resources: { title: string; url: string; type: string }[];
}

interface Subject {
  _id: string;
  title: string;
  icon: string;
  color: string;
}

export default function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState("good");
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`/api/subjects/${id}`)
      .then((r) => r.json())
      .then(({ subject, curriculum }) => {
        setSubject(subject);
        const pending = curriculum?.topics.filter((t: Topic) => t.status !== "done") || [];
        setTopics(pending);
        if (pending.length > 0) setSelectedTopic(pending[0]);
      });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  const startTimer = () => {
    setRunning(true);
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  };

  const pauseTimer = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const endSession = async () => {
    if (!selectedTopic || elapsed < 10) {
      toast.error("Study at least 10 seconds first.");
      return;
    }

    setSaving(true);
    pauseTimer();
    const minutes = Math.max(1, Math.round(elapsed / 60));
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: id,
        subjectTitle: subject?.title,
        topicId: selectedTopic._id,
        topicTitle: selectedTopic.title,
        durationMinutes: minutes,
        notes,
        mood,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (selectedTopic.status === "todo") {
        await fetch(`/api/subjects/${id}/topics/${selectedTopic._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "in-progress", actualMinutes: minutes }),
        });
      }
      toast.success(`Session saved. ${data.user?.currentStreak || 0} day streak.`);
      router.push(`/subjects/${id}`);
    } else {
      toast.error("Failed to save session");
      setSaving(false);
    }
  };

  if (!subject) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-8">
        <Link href={`/subjects/${id}`}>
          <ArrowLeft className="w-4 h-4" />
          <SubjectIcon icon={subject.icon} className="size-4" />
          {subject.title}
        </Link>
      </Button>

      <h1 className="mb-6 text-2xl font-bold">Learning Session</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Select Topic</CardTitle>
            </CardHeader>
            <CardContent>
              {topics.length === 0 ? (
                <div className="space-y-2 py-6 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">All topics done.</p>
                </div>
              ) : (
                <div className="max-h-64 space-y-1.5 overflow-y-auto">
                  {topics.map((t) => (
                    <button
                      key={t._id}
                      onClick={() => setSelectedTopic(t)}
                      className={`w-full rounded-lg border p-2.5 text-left text-xs transition-all ${
                        selectedTopic?._id === t._id
                          ? "border-ring bg-accent text-foreground"
                          : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/50"
                      }`}
                    >
                      <p className="font-medium">{t.title}</p>
                      <p className="mt-0.5 text-muted-foreground/70">{t.estimatedMinutes}m estimated</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedTopic?.resources.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {selectedTopic.resources.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <ResourceTypeIcon type={r.type} className="text-muted-foreground" />
                    <span className="truncate text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                      {r.title}
                    </span>
                  </a>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-6">
              <div className="relative">
                <p className="text-5xl font-bold tabular-nums">{formatTime(elapsed)}</p>
                {running ? (
                  <span className="absolute -right-3 -top-1 h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                ) : null}
              </div>
              {selectedTopic ? (
                <p className="max-w-full truncate px-4 text-center text-xs text-muted-foreground">
                  {selectedTopic.title}
                </p>
              ) : null}
              {!running ? (
                <Button onClick={startTimer} size="lg" className="w-full">
                  <Play className="w-4 h-4" />
                  {elapsed > 0 ? "Resume" : "Start Session"}
                </Button>
              ) : (
                <Button onClick={pauseTimer} variant="outline" size="lg" className="w-full">
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">How are you feeling?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`rounded-lg border py-1.5 text-xs font-medium transition-all ${
                      mood === m.value
                        ? "border-ring bg-accent text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <MoodIcon mood={m.value} className="size-3.5" />
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Session Notes</CardTitle>
              <CardDescription>Key insights, questions, takeaways</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you learn? Any questions?"
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          <Button
            onClick={endSession}
            disabled={saving || elapsed < 10}
            variant="outline"
            className="w-full border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-30"
          >
            <Square className="w-4 h-4" />
            {saving ? "Saving..." : "End Session & Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
