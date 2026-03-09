"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, use } from "react";
import { ArrowLeft, Clock, Paperclip, RefreshCw, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { SubjectIcon } from "@/components/app-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { SKILL_LEVELS } from "@/lib/constants";

interface GeneratedTopic {
  title: string;
  description: string;
  estimatedMinutes: number;
  resources: { title: string; url: string; type: string }[];
}

export default function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [subject, setSubject] = useState<{
    title: string;
    icon: string;
    color: string;
    skillLevel: string;
  } | null>(null);
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [keywords, setKeywords] = useState("");
  const [topics, setTopics] = useState<GeneratedTopic[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rateLimitSecs, setRateLimitSecs] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`/api/subjects/${id}`)
      .then((r) => r.json())
      .then(({ subject }) => {
        setSubject(subject);
        setSkillLevel(subject.skillLevel || "beginner");
      });

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [id]);

  const generate = async () => {
    if (generating) return;

    if (!keywords.trim()) {
      toast.error("Please enter some keywords");
      return;
    }

    setGenerating(true);
    setTopics([]);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId: id, title: subject?.title, skillLevel, keywords }),
    });
    const data = await res.json();
    if (res.ok) {
      setTopics(data.topics);
      toast.success(`Generated ${data.topics.length} topics.`);
    } else if (res.status === 429) {
      const secs = data.retryAfter || 60;
      setRateLimitSecs(secs);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setRateLimitSecs((s) => {
          if (s <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      toast.error("Gemini API rate limit; retry shortly.");
    } else {
      toast.error(data.error || "Generation failed");
    }
    setGenerating(false);
  };

  const save = async () => {
    setSaving(true);
    toast.success("Curriculum saved.");
    router.push(`/subjects/${id}`);
  };

  if (!subject) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 rounded-xl" />
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

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
          <Wand2 className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Curriculum Generator</h1>
          <p className="text-sm text-muted-foreground">Powered by Gemini AI</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generation Settings</CardTitle>
          <CardDescription>Tell the AI what to generate for your curriculum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Skill Level</Label>
            <div className="flex gap-2">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setSkillLevel(level)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium capitalize transition-all ${
                    skillLevel === level
                      ? "border-ring bg-accent text-foreground"
                      : "border-border bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Keywords and topics to cover</Label>
            <Textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. neural networks, backpropagation, transformers, CNNs..."
              rows={3}
            />
          </div>

          <Button
            onClick={generate}
            disabled={generating || rateLimitSecs > 0}
            className="w-full bg-amber-500 text-white hover:bg-amber-400"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : rateLimitSecs > 0 ? (
              <>
                <Clock className="w-4 h-4" />
                Retry in {rateLimitSecs}s
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Curriculum
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {topics.length > 0 ? (
        <>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">{topics.length} topics generated</h2>
              <Badge variant="secondary">Preview</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={generate} disabled={generating}>
              <RefreshCw className="w-3 h-3" />
              Regenerate
            </Button>
          </div>

          <div className="mb-4 space-y-2">
            {topics.map((t, i) => (
              <Card key={i} size="sm">
                <CardContent className="flex items-start gap-3 py-3">
                  <Badge
                    variant="outline"
                    className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center p-0 text-[10px] tabular-nums"
                  >
                    {i + 1}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {t.description}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <Badge variant="secondary" className="text-[10px]">
                        <Clock className="size-3" />
                        {t.estimatedMinutes}m
                      </Badge>
                      {t.resources?.length > 0 ? (
                        <Badge variant="secondary" className="text-[10px]">
                          <Paperclip className="size-3" />
                          {t.resources.length} resources
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={save} disabled={saving} className="w-full">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Curriculum"}
          </Button>
        </>
      ) : null}
    </div>
  );
}
