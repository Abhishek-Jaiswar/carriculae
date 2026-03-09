"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Wand2 } from "lucide-react";
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

export default function NewSubjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "book-open",
    color: SUBJECT_COLORS[0],
    skillLevel: "beginner",
    tags: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setLoading(true);
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });

    if (res.ok) {
      const subject = await res.json();
      toast.success("Subject created.");
      router.push(`/subjects/${subject._id}`);
    } else {
      toast.error("Failed to create subject");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-8">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/subjects">
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

        <Card>
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
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Machine Learning, React, Guitar..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What do you want to achieve with this subject?"
                rows={3}
              />
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
              <Label htmlFor="tags">
                Tags <span className="text-xs text-muted-foreground">(comma separated)</span>
              </Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="e.g. programming, ai, math"
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
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
