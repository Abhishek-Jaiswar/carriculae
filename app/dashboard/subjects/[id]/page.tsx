"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, use } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { SubjectIcon } from "@/components/app-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

interface Topic {
  _id: string;
  title: string;
  description: string;
  order?: number;
  status: "todo" | "in-progress" | "done";
  estimatedMinutes: number;
  actualMinutes: number;
  resources: { title: string; url: string; type: string }[];
  subtopics?: { title: string; done?: boolean }[];
  notes: string;
  completedAt: string | null;
  plannedStartAt?: string | null;
  plannedEndAt?: string | null;
  paceMinutesPerDay?: number | null;
  quiz?: {
    status?: "not_generated" | "ready" | "passed";
    cooldownUntil?: string | null;
  };
}

interface Subject {
  _id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  skillLevel: string;
  totalTopics: number;
  completedTopics: number;
  totalMinutesSpent: number;
}

const STATUS_COLS = [
  { key: "todo", label: "To Learn" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" },
] as const;

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subtopicDialogTopicId, setSubtopicDialogTopicId] = useState<string | null>(null);
  const [subtopicInput, setSubtopicInput] = useState("");
  const [newTopic, setNewTopic] = useState({
    title: "",
    description: "",
    estimatedMinutes: 30,
    paceMinutesPerDay: 45,
    plannedStartAt: "",
    plannedEndAt: "",
    resourcesText: "",
  });

  const parseResources = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 20)
      .map((line) => {
        const [typeRaw, titleRaw, urlRaw] = line.split("|").map((part) => part.trim());
        if (!urlRaw) {
          return { type: "article", title: typeRaw || line, url: titleRaw || "" };
        }
        const type = ["video", "article", "book", "other"].includes(typeRaw) ? typeRaw : "article";
        return { type, title: titleRaw || "Resource", url: urlRaw };
      });

  const fetchData = useCallback(() => {
    fetch(`/api/subjects/${id}`)
      .then((r) => r.json())
      .then(({ subject, curriculum }) => {
        setSubject(subject);
        setTopics(curriculum?.topics || []);
        setAiGenerated(Boolean(curriculum?.aiGenerated && (curriculum?.topics?.length || 0) > 0));
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateTopicStatus = async (topicId: string, status: string) => {
    const res = await fetch(`/api/subjects/${id}/topics/${topicId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setTopics((prev) =>
        prev.map((t) =>
          t._id === topicId
            ? {
                ...t,
                status: status as Topic["status"],
                completedAt: status === "done" ? new Date().toISOString() : null,
              }
            : t
        )
      );
      if (status === "done") toast.success("Topic completed.");
    }
  };

  const deleteTopic = async (topicId: string) => {
    await fetch(`/api/subjects/${id}/topics/${topicId}`, { method: "DELETE" });
    setTopics((prev) => prev.filter((t) => t._id !== topicId));
    toast.success("Topic removed");
  };

  const addTopic = async () => {
    if (!newTopic.title.trim()) return;
    if (
      newTopic.plannedStartAt &&
      newTopic.plannedEndAt &&
      new Date(newTopic.plannedEndAt).getTime() < new Date(newTopic.plannedStartAt).getTime()
    ) {
      toast.error("Target date-time must be after start date-time.");
      return;
    }
    const res = await fetch(`/api/subjects/${id}/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newTopic,
        order: topics.length,
        plannedStartAt: newTopic.plannedStartAt || null,
        plannedEndAt: newTopic.plannedEndAt || null,
        resources: parseResources(newTopic.resourcesText),
      }),
    });
    if (res.ok) {
      toast.success("Topic added.");
      setDialogOpen(false);
      setNewTopic({
        title: "",
        description: "",
        estimatedMinutes: 30,
        paceMinutesPerDay: 45,
        plannedStartAt: "",
        plannedEndAt: "",
        resourcesText: "",
      });
      fetchData();
    }
  };

  const addSubtopicToTopic = async () => {
    const topicId = subtopicDialogTopicId;
    const title = subtopicInput.trim();
    if (!topicId || !title) return;

    const topic = topics.find((t) => t._id === topicId);
    if (!topic) return;

    const updatedSubtopics = [...(topic.subtopics || []), { title, done: false }];
    const res = await fetch(`/api/subjects/${id}/topics/${topicId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtopics: updatedSubtopics }),
    });

    if (!res.ok) {
      toast.error("Failed to add subtopic.");
      return;
    }

    setTopics((prev) =>
      prev.map((t) => (t._id === topicId ? { ...t, subtopics: updatedSubtopics } : t))
    );
    setSubtopicInput("");
    setSubtopicDialogTopicId(null);
    toast.success("Subtopic added.");
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || !subject) {
    return (
      <div className="w-full space-y-6 p-4 md:p-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const pct = subject.totalTopics > 0 ? Math.round((subject.completedTopics / subject.totalTopics) * 100) : 0;
  const hours = Math.round((subject.totalMinutesSpent / 60) * 10) / 10;
  const orderedTopics = [...topics].sort((a, b) => (a.order || 0) - (b.order || 0));
  const firstIncompleteId = orderedTopics.find((t) => t.status !== "done")?._id || null;

  return (
    <div className="w-full p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard/subjects">
            <ArrowLeft className="w-4 h-4" />
            Subjects
          </Link>
        </Button>
        <div className="flex gap-2">
          {aiGenerated ? (
            <Button variant="secondary" size="sm" disabled>
              <Wand2 className="w-4 h-4" />
              AI Generated
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/subjects/${id}/generate`}>
                <Wand2 className="w-4 h-4" />
                AI Generate
              </Link>
            </Button>
          )}
          <Button size="sm" asChild>
            <Link href={`/dashboard/subjects/${id}/learn`}>
              <Play className="w-4 h-4" />
              Start Session
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted">
              <SubjectIcon icon={subject.icon} className="size-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold">{subject.title}</h1>
                <Badge variant="outline" className="capitalize">
                  {subject.skillLevel}
                </Badge>
                {aiGenerated ? <Badge variant="secondary">AI Generated</Badge> : null}
                {pct === 100 ? <Badge variant="success">Completed</Badge> : null}
              </div>
              {subject.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{subject.description}</p>
              ) : null}
              <div className="mb-3 mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {subject.completedTopics}/{subject.totalTopics} topics
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {hours}h spent
                </span>
                <span className="font-medium text-foreground">{pct}%</span>
              </div>
              <Progress value={pct} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {STATUS_COLS.map((col) => {
          const colTopics = orderedTopics.filter((t) => t.status === col.key);
          return (
            <Card key={col.key}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs uppercase tracking-wide">{col.label}</CardTitle>
                    <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                      {colTopics.length}
                    </Badge>
                  </div>
                  {col.key === "todo" ? (
                    <Button variant="ghost" size="icon-xs" onClick={() => setDialogOpen(true)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {colTopics.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">No topics</p>
                ) : null}
                {colTopics.map((topic) => (
                  <div
                    key={topic._id}
                    className="group rounded-lg border border-border/50 bg-muted/40 p-3 transition-all hover:border-border"
                  >
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-start gap-2">
                        <Badge
                          variant="secondary"
                          className="h-5 min-w-5 justify-center px-1 text-[10px] tabular-nums"
                        >
                          {(typeof topic.order === "number" ? topic.order : colTopics.indexOf(topic)) + 1}
                        </Badge>
                        <p className="flex-1 text-sm font-medium leading-snug">{topic.title}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 opacity-0 group-hover:opacity-100"
                        onClick={() => deleteTopic(topic._id)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                    {topic.description ? (
                      <p className="mb-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                        {topic.description}
                      </p>
                    ) : null}
                    {topic.plannedStartAt || topic.plannedEndAt || topic.paceMinutesPerDay ? (
                      <div className="mb-2 rounded-md bg-background/60 p-2 text-[10px] text-muted-foreground">
                        {topic.paceMinutesPerDay ? <p>{topic.paceMinutesPerDay}m/day pace</p> : null}
                        {topic.plannedStartAt ? <p>Start: {formatDateTime(topic.plannedStartAt)}</p> : null}
                        {topic.plannedEndAt ? <p>Target: {formatDateTime(topic.plannedEndAt)}</p> : null}
                      </div>
                    ) : null}
                    {topic.subtopics?.length || topic.resources?.length ? (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {topic.subtopics?.length ? (
                          <Badge variant="outline" className="text-[10px]">
                            {topic.subtopics.length} subtopics
                          </Badge>
                        ) : null}
                        {topic.resources?.length ? (
                          <Badge variant="outline" className="text-[10px]">
                            {topic.resources.length} resources
                          </Badge>
                        ) : null}
                      </div>
                    ) : null}
                    {topic.subtopics?.length ? (
                      <div className="mb-2 space-y-1 rounded-md bg-background/60 p-2">
                        {topic.subtopics.slice(0, 3).map((sub, idx) => (
                          <p key={`${sub.title}-${idx}`} className="text-[10px] text-muted-foreground">
                            - {sub.title}
                          </p>
                        ))}
                        {topic.subtopics.length > 3 ? (
                          <p className="text-[10px] text-muted-foreground">+ {topic.subtopics.length - 3} more</p>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="mb-2 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-[10px]">
                        Quiz: {topic.quiz?.status || "not_generated"}
                      </Badge>
                      {topic.status !== "done" && firstIncompleteId && firstIncompleteId !== topic._id ? (
                        <Badge variant="outline" className="text-[10px]">Locked</Badge>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {topic.estimatedMinutes}m
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-[10px]"
                          onClick={() => {
                            setSubtopicDialogTopicId(topic._id);
                            setSubtopicInput("");
                          }}
                          disabled={Boolean(topic.status !== "done" && firstIncompleteId && firstIncompleteId !== topic._id)}
                        >
                          <Plus className="size-3" />
                          Subtopic
                        </Button>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {col.key === "in-progress" ? (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => updateTopicStatus(topic._id, "todo")}
                              disabled={Boolean(firstIncompleteId && firstIncompleteId !== topic._id)}
                            >
                              <ChevronLeft className="size-3" />
                            </Button>
                          ) : null}
                          {col.key === "todo" ? (
                            <Button
                              size="xs"
                              variant="secondary"
                              onClick={() => updateTopicStatus(topic._id, "in-progress")}
                              disabled={Boolean(firstIncompleteId && firstIncompleteId !== topic._id)}
                            >
                              <ChevronRight className="size-3" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={newTopic.title}
                onChange={(e) => setNewTopic((f) => ({ ...f, title: e.target.value }))}
                placeholder="Topic title"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={newTopic.description}
                onChange={(e) => setNewTopic((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Estimated time (minutes)</Label>
              <Input
                type="number"
                value={newTopic.estimatedMinutes}
                onChange={(e) =>
                  setNewTopic((f) => ({
                    ...f,
                    estimatedMinutes: Number(e.target.value),
                  }))
                }
                min={5}
                max={300}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Learning pace (minutes/day)</Label>
              <Input
                type="number"
                value={newTopic.paceMinutesPerDay}
                onChange={(e) =>
                  setNewTopic((f) => ({
                    ...f,
                    paceMinutesPerDay: Number(e.target.value),
                  }))
                }
                min={10}
                max={720}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Start date & time
                </Label>
                <Input
                  type="datetime-local"
                  value={newTopic.plannedStartAt}
                  onChange={(e) => setNewTopic((f) => ({ ...f, plannedStartAt: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Target date & time
                </Label>
                <Input
                  type="datetime-local"
                  value={newTopic.plannedEndAt}
                  onChange={(e) => setNewTopic((f) => ({ ...f, plannedEndAt: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Resources (one per line: type|title|url)</Label>
              <Textarea
                value={newTopic.resourcesText}
                onChange={(e) => setNewTopic((f) => ({ ...f, resourcesText: e.target.value }))}
                placeholder={`e.g.\nvideo|Rate Limiting Explained|https://...\narticle|RFC 6585|https://...`}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addTopic}>Add Topic</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(subtopicDialogTopicId)}
        onOpenChange={(open) => {
          if (!open) {
            setSubtopicDialogTopicId(null);
            setSubtopicInput("");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Subtopic</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Subtopic title</Label>
            <Input
              value={subtopicInput}
              onChange={(e) => setSubtopicInput(e.target.value)}
              placeholder="e.g. Compare token bucket and leaky bucket"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSubtopicDialogTopicId(null);
                setSubtopicInput("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={addSubtopicToTopic} disabled={!subtopicInput.trim()}>
              Add Subtopic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

