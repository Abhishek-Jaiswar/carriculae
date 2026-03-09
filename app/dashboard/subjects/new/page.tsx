"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus, Wand2, X } from "lucide-react";
import { toast } from "sonner";

import { SubjectIcon } from "@/components/app-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SKILL_LEVELS, SUBJECT_COLORS, SUBJECT_ICONS } from "@/lib/constants";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 240;
const TAG_MAX = 8;
const SUGGESTED_TAGS = ["fundamentals", "practice", "project-based", "interview", "daily"];

const SUBJECT_TEMPLATES = [
  {
    title: "Machine Learning",
    description: "Build practical ML intuition and learn model evaluation with projects.",
    icon: "brain",
    skillLevel: "intermediate",
    tags: ["python", "ai", "math"],
  },
  {
    title: "React",
    description: "Master components, state, routing, and production-ready UI workflows.",
    icon: "code-2",
    skillLevel: "beginner",
    tags: ["frontend", "javascript", "ui"],
  },
  {
    title: "System Design",
    description: "Practice scalable architecture patterns and tradeoff-driven design decisions.",
    icon: "briefcase",
    skillLevel: "advanced",
    tags: ["backend", "architecture", "distributed-systems"],
  },
] as const;

export default function NewSubjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "book-open",
    color: SUBJECT_COLORS[0],
    skillLevel: "beginner",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const title = form.title.trim();
  const titleError = titleTouched && title.length < 3 ? "Use at least 3 characters." : "";
  const canSubmit = title.length >= 3 && !loading;

  const addTag = (raw: string) => {
    const normalized = raw.trim().replace(/\s+/g, " ").slice(0, 24);
    if (!normalized) return;
    if (tags.some((tag) => tag.toLowerCase() === normalized.toLowerCase())) return;
    if (tags.length >= TAG_MAX) {
      toast.error(`You can add up to ${TAG_MAX} tags.`);
      return;
    }
    setTags((prev) => [...prev, normalized]);
  };

  const applyTemplate = (template: (typeof SUBJECT_TEMPLATES)[number]) => {
    setForm((prev) => ({
      ...prev,
      title: template.title,
      description: template.description,
      icon: template.icon,
      skillLevel: template.skillLevel,
    }));

    setTags((prev) => {
      const merged = [...prev];
      for (const templateTag of template.tags) {
        if (merged.length >= TAG_MAX) break;
        if (!merged.some((t) => t.toLowerCase() === templateTag.toLowerCase())) {
          merged.push(templateTag);
        }
      }
      return merged;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleTouched(true);
    if (!canSubmit) return;

    setLoading(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: title.slice(0, TITLE_MAX),
          description: form.description.trim().slice(0, DESCRIPTION_MAX),
          tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create subject.");
      }

      const subject = await res.json();
      toast.success("Subject created.");
      router.push(`/dashboard/subjects/${subject._id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create subject.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 md:p-8">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/dashboard/subjects">
          <ArrowLeft className="w-4 h-4" />
          Back to Subjects
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Subject</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">What do you want to learn next?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Pick a template and customize it</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            {SUBJECT_TEMPLATES.map((template) => (
              <button
                type="button"
                key={template.title}
                onClick={() => applyTemplate(template)}
                className="rounded-lg border p-3 text-left transition-colors hover:bg-muted/60"
              >
                <div className="mb-2 flex items-center gap-2">
                  <SubjectIcon icon={template.icon} className="size-4.5" />
                  <p className="text-sm font-medium">{template.title}</p>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{template.description}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-5">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose an icon and color for your subject card</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block text-xs text-muted-foreground">Icon</Label>
                <div className="flex flex-wrap gap-1.5">
                  {SUBJECT_ICONS.map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setForm((f) => ({ ...f, icon }))}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                        form.icon === icon ? "scale-110 bg-muted ring-2 ring-ring" : "hover:bg-muted"
                      }`}
                    >
                      <SubjectIcon icon={icon} className="size-4.5" />
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-2 block text-xs text-muted-foreground">Color</Label>
                <div className="flex gap-2">
                  {SUBJECT_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setForm((f) => ({ ...f, color }))}
                      className={`h-7 w-7 rounded-full transition-all ${
                        form.color === color
                          ? "scale-125 ring-2 ring-offset-2 ring-offset-background"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color, outlineColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-2 block text-xs text-muted-foreground">Preview</Label>
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <SubjectIcon icon={form.icon} className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{form.title || "Subject Title"}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {form.skillLevel}
                      </Badge>
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: form.color }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>Give your subject a name and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value.slice(0, TITLE_MAX) }))}
                  onBlur={() => setTitleTouched(true)}
                  placeholder="e.g. Machine Learning, React, Guitar..."
                  required
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-destructive">{titleError}</p>
                  <p className="text-xs text-muted-foreground">
                    {form.title.length}/{TITLE_MAX}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value.slice(0, DESCRIPTION_MAX) }))
                  }
                  placeholder="What do you want to achieve with this subject?"
                  rows={3}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {form.description.length}/{DESCRIPTION_MAX}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Skill Level</Label>
                <div className="flex gap-2">
                  {SKILL_LEVELS.map((level) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setForm((f) => ({ ...f, skillLevel: level }))}
                      className={`flex-1 rounded-lg border py-1.5 text-xs font-medium capitalize transition-all ${
                        form.skillLevel === level
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags</Label>
                <div className="rounded-lg border p-2">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {tags.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No tags added yet</span>
                    ) : (
                      tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            aria-label={`Remove ${tag}`}
                            onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                            className="rounded-sm hover:bg-background/80"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag(tagInput);
                        setTagInput("");
                      }
                    }}
                    onBlur={() => {
                      addTag(tagInput);
                      setTagInput("");
                    }}
                    placeholder="Type a tag and press Enter"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => addTag(tag)}
                      disabled={tags.some((t) => t.toLowerCase() === tag.toLowerCase())}
                    >
                      <Plus className="h-3 w-3" />
                      {tag}
                    </Button>
                  ))}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {tags.length}/{TAG_MAX}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button type="submit" disabled={!canSubmit} className="w-full" size="lg">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Creating...
            </span>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Create Subject
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
