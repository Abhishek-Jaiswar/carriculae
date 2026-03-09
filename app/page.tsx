import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Compass,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_8%,#d9f7f0_0%,transparent_36%),radial-gradient(circle_at_92%_14%,#ffe8cc_0%,transparent_30%),linear-gradient(180deg,#f8fafc_0%,#f1f8ff_55%,#fbfdff_100%)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-8">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/90 text-white">
            <GraduationCap className="size-4" />
          </div>
          <span className="text-sm font-semibold">Carriculae</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Start Free</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-14 pt-8 md:grid-cols-2 md:px-8 md:pt-14">
        <div>
          <Badge variant="outline" className="mb-4 bg-background/70">
            Built for intentional learners
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Carriculae turns learning chaos into a guided system.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Build topic-by-topic roadmaps, track real focus time, and unlock progress only when
            understanding is proven.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Free
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <Card className="bg-background/80">
              <CardContent className="px-4 py-3">
                <p className="text-lg font-semibold">5-step</p>
                <p className="text-xs text-muted-foreground">Learning flow</p>
              </CardContent>
            </Card>
            <Card className="bg-background/80">
              <CardContent className="px-4 py-3">
                <p className="text-lg font-semibold">Quiz-gated</p>
                <p className="text-xs text-muted-foreground">Completion</p>
              </CardContent>
            </Card>
            <Card className="bg-background/80">
              <CardContent className="px-4 py-3">
                <p className="text-lg font-semibold">Daily</p>
                <p className="text-xs text-muted-foreground">Momentum tracking</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-emerald-200/70 bg-white/80 shadow-lg backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base">Why teams and learners pick Carriculae</CardTitle>
            <CardDescription>Everything needed to learn consistently in one workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Compass className="mt-0.5 size-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">Clear next action, every day</p>
                <p className="text-xs text-muted-foreground">No confusion about what to study next.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 size-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">Session-based time tracking</p>
                <p className="text-xs text-muted-foreground">Measure actual deep work, not intention.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 size-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">Mastery over checkbox completion</p>
                <p className="text-xs text-muted-foreground">Quiz-gated progression keeps quality high.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="mt-0.5 size-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">Progress analytics you can act on</p>
                <p className="text-xs text-muted-foreground">Trends and streaks drive smarter planning.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 md:px-8">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="size-4 text-amber-600" />
          <p className="text-sm font-medium">Core product capabilities</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-background/85">
            <CardHeader>
              <CardTitle>AI Curriculum Builder</CardTitle>
              <CardDescription>Create structured topics, resources, and subtopics quickly.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Generate once, refine where needed, and keep the structure stable.
            </CardContent>
          </Card>
          <Card className="bg-background/85">
            <CardHeader>
              <CardTitle>Strict Sequential Learning</CardTitle>
              <CardDescription>Only the current topic is active for forward progress.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Reduces context switching and keeps learning intentional.
            </CardContent>
          </Card>
          <Card className="bg-background/85">
            <CardHeader>
              <CardTitle>Quiz-Gated Mastery</CardTitle>
              <CardDescription>Pass short quizzes to unlock the next topic.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Completion reflects understanding, not just clicks.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-8">
        <Card className="border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5_0%,#f0f9ff_55%,#fff7ed_100%)]">
          <CardContent className="flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1 text-xl font-semibold">Build your learning operating system</p>
              <p className="text-sm text-muted-foreground">
                Create subjects, run focused sessions, pass quizzes, and track momentum in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/signup">
                  Create Account
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-t bg-background/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground md:px-8">
          <p className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            Carriculae
          </p>
          <p>Structured learning. Consistent output. Measurable growth.</p>
        </div>
      </section>
    </div>
  );
}
