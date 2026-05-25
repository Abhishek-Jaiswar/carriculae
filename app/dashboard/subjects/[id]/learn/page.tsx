"use client";

import Link from "next/link";
import { useEffect, useRef, useState, use } from "react";
import {
  ArrowLeft,
  BookOpen,
  Lock,
  Pause,
  Play,
  Square,
  ThumbsDown,
  ThumbsUp,
  RotateCcw,
  VideoIcon,
  NotebookIcon,
} from "lucide-react";
import { toast } from "sonner";

import { MoodIcon, ResourceTypeIcon, SubjectIcon } from "@/components/app-icon";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { MOODS } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

interface TopicQuiz {
  status?: "not_generated" | "ready" | "passed";
  attemptCount?: number;
  cooldownUntil?: string | null;
  confidenceBeforeQuiz?: number | null;
  reflection?: string;
}

interface Topic {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  estimatedMinutes: number;
  actualMinutes: number;
  order?: number;
  resources: { title: string; url: string; type: string }[];
  subtopics?: { title: string; done?: boolean }[];
  quiz?: TopicQuiz;
  nextReviewAt?: string | null;
  reviewLevel?: number;
}

interface Subject {
  _id: string;
  title: string;
  icon: string;
  color: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
}

interface QuizReview {
  question: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export default function LearnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState("good");
  const [saving, setSaving] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizReview, setQuizReview] = useState<QuizReview[] | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);
  const [quizConfidence, setQuizConfidence] = useState<number | null>(null);
  const [quizReflection, setQuizReflection] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isModelOpen, setIsModelOpen] = useState(false);

  const orderedTopics = [...topics].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );
  const selectedTopic =
    orderedTopics.find((t) => t._id === selectedTopicId) || null;
  const firstIncomplete = orderedTopics.find((t) => t.status !== "done");
  const unlockedTopicId = firstIncomplete?._id || "";

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`/api/subjects/${id}`)
      .then((r) => r.json())
      .then(({ subject, curriculum }) => {
        setSubject(subject);
        const loadedTopics: Topic[] = [...(curriculum?.topics || [])].sort(
          (a: Topic, b: Topic) => (a.order || 0) - (b.order || 0),
        );
        setTopics(loadedTopics);
        const firstActive =
          loadedTopics.find((t) => t.status !== "done") || loadedTopics[0];
        if (firstActive) setSelectedTopicId(firstActive._id);
      });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  const isLocked = (topic: Topic) =>
    !!(
      topic.status !== "done" &&
      unlockedTopicId &&
      topic._id !== unlockedTopicId
    );
  const cooldownMs = selectedTopic?.quiz?.cooldownUntil
    ? Math.max(new Date(selectedTopic.quiz.cooldownUntil).getTime() - nowMs, 0)
    : 0;
  const cooldownSeconds = Math.ceil(cooldownMs / 1000);

  const reviewDue =
    !!selectedTopic &&
    selectedTopic.status === "done" &&
    selectedTopic.nextReviewAt &&
    new Date(selectedTopic.nextReviewAt).getTime() <= nowMs;

  const sendResourceFeedback = async (
    sentiment: "up" | "down",
    url: string,
    title: string,
  ) => {
    if (!selectedTopic) return;
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: id,
          topicId: selectedTopic._id,
          targetType: "resource",
          resourceUrl: url,
          sentiment,
          note: title.slice(0, 200),
        }),
      });
      if (!res.ok) throw new Error("Feedback failed");
      toast.success("Thanks — feedback saved.");
    } catch {
      toast.error("Could not save feedback.");
    }
  };

  const markReviewDone = async () => {
    if (!selectedTopic) return;
    setReviewBusy(true);
    try {
      const res = await fetch(
        `/api/subjects/${id}/topics/${selectedTopic._id}/review`,
        {
          method: "POST",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTopics((prev) =>
        prev.map((t) =>
          t._id === selectedTopic._id
            ? {
                ...t,
                nextReviewAt: data.nextReviewAt || null,
                reviewLevel: data.reviewLevel,
              }
            : t,
        ),
      );
      toast.success("Spaced review scheduled.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update review.");
    } finally {
      setReviewBusy(false);
    }
  };

  const startTimer = () => {
    if (!selectedTopic) {
      toast.error("Select a topic first.");
      return;
    }

    setIsModelOpen(true);
    if (isLocked(selectedTopic)) {
      toast.error("This topic is locked. Complete the current topic first.");
      return;
    }
    if (running) return;
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

  const getTopicProgress = (topic: Topic) =>
    Math.min(
      100,
      Math.round(
        ((topic.actualMinutes || 0) /
          Math.max(topic.estimatedMinutes || 1, 1)) *
          100,
      ),
    );

  const endSession = async () => {
    if (!selectedTopic || elapsed < 10) {
      toast.error("Study at least 10 seconds first.");
      return;
    }
    if (isLocked(selectedTopic)) {
      toast.error("This topic is locked.");
      return;
    }

    setSaving(true);
    pauseTimer();
    const minutes = Math.max(1, Math.round(elapsed / 60));

    try {
      const sessionRes = await fetch("/api/sessions", {
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

      if (!sessionRes.ok) throw new Error("Failed to save session.");
      const sessionData = await sessionRes.json();

      const nextActual = (selectedTopic.actualMinutes || 0) + minutes;
      const nextStatus =
        selectedTopic.status === "todo" ? "in-progress" : selectedTopic.status;

      const topicRes = await fetch(
        `/api/subjects/${id}/topics/${selectedTopic._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: nextStatus,
            actualMinutes: nextActual,
          }),
        },
      );
      if (!topicRes.ok)
        throw new Error("Session saved but topic update failed.");

      setTopics((prev) =>
        prev.map((t) =>
          t._id === selectedTopic._id
            ? {
                ...t,
                actualMinutes: nextActual,
                status: nextStatus,
              }
            : t,
        ),
      );

      setElapsed(0);
      toast.success(
        `Saved ${minutes}m. ${sessionData.user?.currentStreak || 0} day streak.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save session";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const startQuiz = async () => {
    if (!selectedTopic) return;
    if (isLocked(selectedTopic)) {
      toast.error("This topic is locked.");
      return;
    }

    const res = await fetch(
      `/api/subjects/${id}/topics/${selectedTopic._id}/quiz/start`,
      {
        method: "POST",
      },
    );
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to start quiz.");
      return;
    }

    setQuizQuestions(data.quiz.questions || []);
    setQuizAnswers(new Array((data.quiz.questions || []).length).fill(-1));
    setQuizReview(null);
    setQuizScore(null);
    setQuizPassed(null);
    setQuizConfidence(null);
    setQuizReflection("");
    setQuizOpen(true);
  };

  const submitQuiz = async () => {
    if (!selectedTopic) return;
    if (quizAnswers.some((a) => a < 0)) {
      toast.error("Answer all questions first.");
      return;
    }

    setQuizSubmitting(true);
    const res = await fetch(
      `/api/subjects/${id}/topics/${selectedTopic._id}/quiz/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: quizAnswers,
          ...(quizConfidence !== null &&
          quizConfidence >= 1 &&
          quizConfidence <= 5
            ? { confidenceBeforeQuiz: quizConfidence }
            : {}),
          ...(quizReflection.trim()
            ? { reflection: quizReflection.trim() }
            : {}),
        }),
      },
    );
    const data = await res.json();
    setQuizSubmitting(false);

    if (!res.ok) {
      toast.error(data.error || "Quiz submission failed.");
      return;
    }

    setQuizReview(data.review || []);
    setQuizScore(data.score ?? 0);
    setQuizPassed(Boolean(data.passed));

    if (data.passed) {
      setTopics((prev) =>
        prev.map((t) =>
          t._id === selectedTopic._id
            ? {
                ...t,
                status: "done",
                nextReviewAt: data.nextReviewAt ?? t.nextReviewAt,
                reviewLevel: t.reviewLevel ?? 1,
                quiz: {
                  ...(t.quiz || {}),
                  status: "passed",
                  cooldownUntil: null,
                  confidenceBeforeQuiz:
                    quizConfidence !== null &&
                    quizConfidence >= 1 &&
                    quizConfidence <= 5
                      ? quizConfidence
                      : t.quiz?.confidenceBeforeQuiz,
                  reflection: quizReflection.trim() || t.quiz?.reflection,
                },
              }
            : t,
        ),
      );
      const nextTopic = orderedTopics.find(
        (t) => t._id !== selectedTopic._id && t.status !== "done",
      );
      if (nextTopic) setSelectedTopicId(nextTopic._id);
      toast.success("Quiz passed. Topic completed.");
    } else {
      setTopics((prev) =>
        prev.map((t) =>
          t._id === selectedTopic._id
            ? {
                ...t,
                quiz: {
                  ...(t.quiz || {}),
                  status: "ready",
                  cooldownUntil: data.cooldownUntil || null,
                },
              }
            : t,
        ),
      );
      toast.error("Quiz failed. Retry after cooldown.");
    }
  };

  if (!subject) {
    return (
      <div className="w-full space-y-4 p-4 md:p-8">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-6 xl:grid-cols-12">
          <Skeleton className="h-[560px] rounded-xl xl:col-span-4" />
          <Skeleton className="h-[560px] rounded-xl xl:col-span-8" />
        </div>
      </div>
    );
  }

  const completedCount = orderedTopics.filter(
    (t) => t.status === "done",
  ).length;
  const totalCount = orderedTopics.length;
  const overallProgress = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;
  const selectedProgress = selectedTopic ? getTopicProgress(selectedTopic) : 0;
  const sessionMinutes = Math.max(1, Math.round(elapsed / 60));

  return (
    <div className="w-full space-y-6 p-4 md:p-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={`/dashboard/subjects/${id}`}>
          <ArrowLeft className="w-4 h-4" />
          <SubjectIcon icon={subject.icon} className="size-4" />
          {subject.title}
        </Link>
      </Button>

      {reviewDue ? (
        <div className="flex flex-col gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-sm">
            <RotateCcw className="mt-0.5 size-4 shrink-0 text-emerald-700" />
            <div>
              <p className="font-medium text-emerald-950">Spaced review due</p>
              <p className="text-muted-foreground text-xs">
                You completed this topic earlier. A quick review now helps
                retention—skim notes or redo key ideas, then mark it done.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            disabled={reviewBusy}
            onClick={markReviewDone}
          >
            {reviewBusy ? "Saving..." : "Mark review complete"}
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">1. Current Topic</CardTitle>
            <CardDescription>
              Complete topics in order to unlock the next
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Overall completion</span>
                <span>
                  {completedCount}/{totalCount}
                </span>
              </div>
              <Progress value={overallProgress} />
            </div>
            {selectedTopic ? (
              <div className="rounded-lg border bg-primary/5 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary">Active</Badge>
                  <Badge variant="outline">
                    Quiz: {selectedTopic.quiz?.status || "not_generated"}
                  </Badge>
                </div>
                <p className="text-sm font-semibold">{selectedTopic.title}</p>
                {selectedTopic.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {selectedTopic.description}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {selectedTopic.actualMinutes || 0}m logged /{" "}
                  {selectedTopic.estimatedMinutes}m target
                </p>
              </div>
            ) : null}
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {orderedTopics.length === 0 ? (
                <div className="space-y-2 py-8 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">
                    No topics yet.
                  </p>
                </div>
              ) : (
                orderedTopics.map((topic, idx) => {
                  const progress = getTopicProgress(topic);
                  const locked = isLocked(topic);
                  return (
                    <button
                      key={topic._id}
                      onClick={() => {
                        if (locked) return;
                        setSelectedTopicId(topic._id);
                      }}
                      className={`w-full rounded-lg border p-3 text-left transition-all ${
                        selectedTopicId === topic._id
                          ? "border-primary bg-primary/5"
                          : locked
                            ? "cursor-not-allowed border-border/40 bg-muted/20 opacity-70"
                            : "border-border/60 hover:border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className="mb-1.5 flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-medium">
                          {idx + 1}. {topic.title}
                        </p>
                        <div className="flex items-center gap-1">
                          {locked ? (
                            <Badge variant="outline" className="text-[10px]">
                              <Lock className="mr-1 size-3" />
                              Locked
                            </Badge>
                          ) : null}
                          <Badge
                            variant={
                              topic.status === "done" ? "success" : "outline"
                            }
                            className="text-[10px]"
                          >
                            {topic.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>
                          {topic.actualMinutes || 0}m / {topic.estimatedMinutes}
                          m
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </button>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 xl:col-span-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">2. Focus Session</CardTitle>
              <CardDescription>
                Study the active topic, then save your time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border bg-muted/20 p-6 lg:col-span-2">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge variant="outline">
                      {selectedTopic
                        ? selectedTopic.title
                        : "Select an unlocked topic"}
                    </Badge>
                    <Badge variant="secondary">
                      {sessionMinutes}m this session
                    </Badge>
                  </div>
                  <div className="mb-4 text-center">
                    <p className="text-6xl font-bold tabular-nums tracking-tight">
                      {formatTime(elapsed)}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {!running ? (
                      <Button
                        onClick={startTimer}
                        size="lg"
                        className="w-full"
                        disabled={
                          !selectedTopic ||
                          (selectedTopic ? isLocked(selectedTopic) : false)
                        }
                      >
                        <Play className="w-4 h-4" />
                        {elapsed > 0 ? "Resume" : "Start Session"}
                      </Button>
                    ) : (
                      <Button
                        onClick={pauseTimer}
                        variant="outline"
                        size="lg"
                        className="w-full"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </Button>
                    )}
                    <Button
                      onClick={endSession}
                      disabled={
                        saving ||
                        elapsed < 10 ||
                        !selectedTopic ||
                        (selectedTopic ? isLocked(selectedTopic) : false)
                      }
                      variant="outline"
                      size="lg"
                      className="w-full border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                    >
                      <Square className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Session"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">
                      Current topic progress
                    </p>
                    <p className="text-2xl font-semibold">
                      {selectedProgress}%
                    </p>
                    <Progress value={selectedProgress} className="mt-2" />
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">
                      3. Quiz Gate
                    </p>
                    <p className="text-sm font-medium">
                      Pass quiz to unlock next topic
                    </p>
                    <Button
                      variant="secondary"
                      className="mt-3 w-full"
                      onClick={startQuiz}
                      disabled={
                        !selectedTopic ||
                        selectedTopic.status === "done" ||
                        (selectedTopic ? isLocked(selectedTopic) : false) ||
                        cooldownSeconds > 0
                      }
                    >
                      {cooldownSeconds > 0
                        ? `Retry in ${cooldownSeconds}s`
                        : "Start Quiz"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resources</CardTitle>
                <CardDescription>
                  {selectedTopic?.resources?.length || 0} links for this topic
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                {!selectedTopic?.resources?.length ? (
                  <p className="text-xs text-muted-foreground">
                    No resources added for this topic.
                  </p>
                ) : (
                  selectedTopic.resources.map((r, i) => (
                    <div
                      key={i}
                      className="group flex items-center gap-1 rounded-lg p-2 transition-colors hover:bg-muted"
                    >
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 flex-1 items-center gap-2"
                      >
                        <ResourceTypeIcon
                          type={r.type}
                          className="shrink-0 text-muted-foreground"
                        />
                        <span className="truncate text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                          {r.title || r.url}
                        </span>
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        title="Helpful"
                        onClick={() =>
                          sendResourceFeedback("up", r.url, r.title || r.url)
                        }
                      >
                        <ThumbsUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        title="Not helpful"
                        onClick={() =>
                          sendResourceFeedback("down", r.url, r.title || r.url)
                        }
                      >
                        <ThumbsDown className="size-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Reflection</CardTitle>
                <CardDescription>
                  Capture your understanding before quiz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What did you learn? What is still unclear?"
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Topic Quiz ({quizQuestions.length} questions)
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            {!quizReview ? (
              <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Optional self-check (saved only if you pass the quiz)
                </p>
                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">
                    Confidence before graded questions (1 = low, 5 = high)
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Button
                        key={n}
                        type="button"
                        size="sm"
                        variant={quizConfidence === n ? "default" : "outline"}
                        className="h-8 min-w-9 px-2"
                        onClick={() =>
                          setQuizConfidence(quizConfidence === n ? null : n)
                        }
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-muted-foreground">
                    One-line reflection (optional)
                  </p>
                  <Textarea
                    value={quizReflection}
                    onChange={(e) => setQuizReflection(e.target.value)}
                    rows={2}
                    placeholder="What will you remember or apply?"
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            ) : null}
            {quizQuestions.map((q, idx) => (
              <div key={idx} className="rounded-lg border p-3">
                <p className="mb-2 text-sm font-medium">
                  {idx + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() =>
                        setQuizAnswers((prev) =>
                          prev.map((a, i) => (i === idx ? optIdx : a)),
                        )
                      }
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                        quizAnswers[idx] === optIdx
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {quizReview ? (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">
                  Score: {quizScore}% ({quizPassed ? "Passed" : "Failed"})
                </p>
                <div className="mt-2 space-y-2">
                  {quizReview.map((item, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">
                      Q{idx + 1}: {item.isCorrect ? "Correct" : "Incorrect"} -{" "}
                      {item.explanation}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuizOpen(false)}>
              Close
            </Button>
            <Button
              onClick={submitQuiz}
              disabled={quizSubmitting || quizAnswers.some((a) => a < 0)}
            >
              {quizSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isModelOpen} onOpenChange={setIsModelOpen}>
        <DialogContent className="w-full min-w-5xl border border-border/50 bg-background/95 backdrop-blur-xl rounded-3xl p-0 overflow-hidden">
          {/* Header */}
          <div className="relative overflow-hidden border-b">
            <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent" />

            <div className="relative p-8">
              <DialogHeader className="space-y-3">
                <div className="inline-flex w-fit items-center rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  AI Learning Tools
                </div>

                <h2 className="text-3xl font-bold tracking-tight leading-tight">
                  Unlock more from your generated curriculum
                </h2>

                <DialogDescription className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                  Select any feature below to open a dedicated workspace where
                  you can interact with your generated curriculum and perform
                  advanced AI powered actions.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          {/* Cards */}
          <div className="grid gap-5 p-8 md:grid-cols-3">
            {/* Card 1 */}
            <Card className="group relative overflow-hidden border-border/50 bg-linear-to-b from-background to-muted/30 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <CardHeader className="relative space-y-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                  <VideoIcon className="text-green-600" />
                </div>

                <div className="space-y-2">
                  <CardTitle className="text-xl leading-snug">
                    AI Animated Videos
                  </CardTitle>

                  <CardDescription className="text-sm leading-relaxed">
                    Generate engaging animated explanation videos for any
                    selected topic from your curriculum with AI narration and
                    visuals.
                  </CardDescription>
                </div>

                <Link
                  href="/ai-video-explainer"
                  className={buttonVariants({
                    size: "sm",
                    className: "mt-2 w-full rounded-xl",
                  })}
                >
                  Try this out
                </Link>
              </CardHeader>
            </Card>

            {/* Card 2 */}
            <Card className="group relative overflow-hidden border-border/50 bg-linear-to-b from-background to-muted/30 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <CardHeader className="relative space-y-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                  <NotebookIcon className="text-green-600" />
                </div>

                <div className="space-y-2">
                  <CardTitle className="text-xl leading-snug">
                    Find Online Resources.
                  </CardTitle>

                  <CardDescription className="text-sm leading-relaxed">
                    Find latest and relevent resources according to your
                    selected topic, try this out.
                  </CardDescription>
                </div>

                <Link
                  href="/find-online-resources"
                  className={buttonVariants({
                    className: "mt-2 w-full rounded-xl",
                    size: "sm",
                  })}
                >
                  Find Resources
                </Link>
              </CardHeader>
            </Card>

            {/* Card 3 */}
            <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-b from-background to-muted/30 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <CardHeader className="relative space-y-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                  💬
                </div>

                <div className="space-y-2">
                  <CardTitle className="text-xl leading-snug">
                    AI Learning Assistant
                  </CardTitle>

                  <CardDescription className="text-sm leading-relaxed">
                    Chat with an intelligent tutor that explains concepts,
                    answers questions, and helps you learn faster.
                  </CardDescription>
                </div>

                <Link
                  href="/discuss-with-ai"
                  className={buttonVariants({
                    className: "mt-2 w-full rounded-xl",
                    size: "sm",
                  })}
                >
                  Start Discussion with ai
                </Link>
              </CardHeader>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
