"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, use } from "react";
import {
  ArrowLeft,
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
  status: "todo" | "in-progress" | "done";
  estimatedMinutes: number;
  actualMinutes: number;
  resources: { title: string; url: string; type: string }[];
  notes: string;
  completedAt: string | null;
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
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: "",
    description: "",
    estimatedMinutes: 30,
  });

  const fetchData = useCallback(() => {
    fetch(`/api/subjects/${id}`)
      .then((r) => r.json())
      .then(({ subject, curriculum }) => {
        setSubject(subject);
        setTopics(curriculum?.topics || []);
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
    const res = await fetch(`/api/subjects/${id}/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTopic, order: topics.length }),
    });
    if (res.ok) {
      toast.success("Topic added.");
      setDialogOpen(false);
      setNewTopic({ title: "", description: "", estimatedMinutes: 30 });
      fetchData();
    }
  };

  if (loading || !subject) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
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

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/subjects">
            <ArrowLeft className="w-4 h-4" />
            Subjects
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/subjects/${id}/generate`}>
              <Wand2 className="w-4 h-4" />
              AI Generate
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/subjects/${id}/learn`}>
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
          const colTopics = topics.filter((t) => t.status === col.key);
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
                      <p className="flex-1 text-sm font-medium leading-snug">{topic.title}</p>
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
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {topic.estimatedMinutes}m
                      </span>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {col.key !== "todo" ? (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() =>
                              updateTopicStatus(topic._id, col.key === "in-progress" ? "todo" : "in-progress")
                            }
                          >
                            <ChevronLeft className="size-3" />
                          </Button>
                        ) : null}
                        {col.key !== "done" ? (
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() =>
                              updateTopicStatus(topic._id, col.key === "todo" ? "in-progress" : "done")
                            }
                          >
                            <ChevronRight className="size-3" />
                          </Button>
                        ) : null}
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
        <DialogContent className="sm:max-w-md">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addTopic}>Add Topic</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
