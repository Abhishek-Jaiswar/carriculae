"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Brain, MessageSquareMore, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Subject = {
  _id: string;
  title: string;
  description?: string;
  skillLevel?: string;
  tags?: string[];
};

export default function DiscussWithAIPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    fetch("/api/subjects", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load subjects.");
        }
        return res.json();
      })
      .then((data: Subject[]) => {
        if (!mounted) return;

        const nextSubjects = Array.isArray(data) ? data : [];
        setSubjects(nextSubjects);
        if (nextSubjects[0]?._id) {
          setSelectedSubjectId(nextSubjects[0]._id);
        }
      })
      .catch(() => {
        if (mounted) {
          toast.error("Could not load your subjects.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject._id === selectedSubjectId) || null,
    [selectedSubjectId, subjects]
  );

  return (
    <div className="w-full p-4 md:p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[32px] border border-emerald-500/15 bg-gradient-to-br from-white via-emerald-50/70 to-stone-100 p-6 md:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_60%)]" />
          <div className="relative grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <Badge variant="success" className="gap-1">
                <Sparkles className="size-3" />
                AI discussion workspace
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
                  Start with a subject, then enter a focused discussion room.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Choose what you are studying first. We&apos;ll open a dedicated chat page built just
                  for that subject, with past conversations on the side and nothing else competing
                  for your attention.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Subject-first flow</Badge>
                <Badge variant="outline">Dedicated chat page</Badge>
                <Badge variant="outline">Previous chats sidebar</Badge>
              </div>
            </div>

            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="size-4 text-emerald-700" />
                  Select Subject
                </CardTitle>
                <CardDescription>
                  Pick the subject you want this discussion workspace to focus on.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjects.length ? (
                  <>
                    <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue
                          placeholder={loading ? "Loading subjects..." : "Choose a subject"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject._id} value={subject._id}>
                            {subject.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-900">
                        <MessageSquareMore className="size-4 text-emerald-700" />
                        {selectedSubject?.title || "Select a subject"}
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {selectedSubject?.description?.trim() ||
                          "We'll anchor the conversation to this subject and open a clean chat workspace for it."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedSubject?.skillLevel ? (
                          <Badge variant="secondary">{selectedSubject.skillLevel}</Badge>
                        ) : null}
                        {(selectedSubject?.tags || []).slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button asChild size="lg" className="w-full">
                      <Link href={`/dashboard/discuss-with-ai/chat?subjectId=${selectedSubjectId}`}>
                        Start Discussion
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-muted-foreground">
                      {loading
                        ? "Loading your subjects..."
                        : "Create a subject first so the AI discussion room knows what to focus on."}
                    </div>
                    <Button asChild className="w-full">
                      <Link href="/dashboard/subjects/new">Create Subject</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
