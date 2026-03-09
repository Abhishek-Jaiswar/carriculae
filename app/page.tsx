import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Flame,
  Lock,
  Play,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/* ─── tiny helper to avoid repeating the step-dot markup ─── */
function StepDot({ n }: { n: number }) {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-xs font-semibold text-red-500">
      {n}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-gray-900 antialiased">
      {/* ── soft ambient glow layer ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-red-300/10 blur-[120px]" />
        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-red-200/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-red-200/10 blur-[100px]" />
      </div>

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 border-b border-gray-100/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 md:px-8">
          <div className="flex items-center gap-0">
            <span className="text-[17px] font-extrabold tracking-tight text-gray-900">Carriculae</span>
            <span className="text-[17px] font-extrabold text-red-500 leading-none">.</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-gray-500 md:flex">
            <a href="#features" className="transition-colors hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-gray-900">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" className="bg-red-400 hover:bg-red-500 shadow-sm shadow-red-200" asChild>
              <Link href="/signup">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 pb-20 pt-20 text-center md:px-8 md:pt-28">
        <Badge
          variant="outline"
          className="gap-1.5 rounded-full border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-500"
        >
          <Sparkles className="size-3.5" />
          Structured learning — not wishful thinking
        </Badge>

        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
          Turn your syllabus into a{" "}
          <span className="bg-gradient-to-r from-red-400 to-red-400 bg-clip-text text-transparent">
            learning machine
          </span>
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-gray-500 md:text-lg">
          Carriculae gives your learning a strict sequence, enforced focus sessions, quiz-gated
          mastery, and analytics that show you the truth — not just what you want to hear.
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            className="gap-2 rounded-xl bg-red-400 px-7 text-base font-semibold shadow-lg shadow-red-200 hover:bg-red-500 active:scale-95"
            asChild
          >
            <Link href="/signup">
              Get started free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-xl px-7 text-base" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        {/* stat pills */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {[
            { icon: <Flame className="size-3.5 text-orange-500" />, text: "Daily streaks" },
            { icon: <CheckCircle2 className="size-3.5 text-red-400" />, text: "Quiz-gated completion" },
            { icon: <Clock3 className="size-3.5 text-blue-500" />, text: "Focus session timer" },
            { icon: <BarChart3 className="size-3.5 text-violet-500" />, text: "Real-time analytics" },
          ].map((p) => (
            <span
              key={p.text}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm"
            >
              {p.icon}
              {p.text}
            </span>
          ))}
        </div>

        {/* hero mock-up card */}
        <div className="mt-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/80">
          {/* fake browser chrome */}
          <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-4 py-3">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-red-300" />
            <span className="ml-3 rounded-md bg-white border border-gray-200 px-3 py-0.5 text-[10px] text-gray-400 font-mono">
              carriculae.app/dashboard
            </span>
          </div>
          {/* mock dashboard */}
          <div className="grid grid-cols-3 gap-0 divide-x divide-gray-100 p-4">
            <div className="pr-4">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Topics</p>
              <div className="space-y-1.5">
                {["Intro to ML", "Supervised Learning", "Neural Networks", "CNNs", "Transformers"].map(
                  (t, i) => (
                    <div
                      key={t}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${i === 0
                        ? "bg-red-50 text-red-500 ring-1 ring-red-200"
                        : i < 3
                          ? "text-gray-500"
                          : "text-gray-300"
                        }`}
                    >
                      {i === 0 ? (
                        <Play className="size-2.5 text-red-400" />
                      ) : i < 3 ? (
                        <CheckCircle2 className="size-2.5 text-gray-300" />
                      ) : (
                        <Lock className="size-2.5 text-gray-300" />
                      )}
                      {t}
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="col-span-2 pl-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Focus Session</p>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-semibold text-red-500">Active</span>
              </div>
              <p className="mb-1 text-xs font-medium text-gray-700">Intro to ML</p>
              <p className="mb-3 text-[42px] font-bold tabular-nums tracking-tight text-gray-900 leading-none">24:17</p>
              <div className="flex gap-2 mb-4">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-red-400 to-red-300" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Today", val: "42m" },
                  { label: "Streak", val: "7d 🔥" },
                  { label: "Goal", val: "18m left" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-gray-50 px-2.5 py-2">
                    <p className="text-[9px] text-gray-400 uppercase tracking-wide">{s.label}</p>
                    <p className="text-[13px] font-semibold text-gray-800">{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="border-t border-gray-100 bg-gray-50/60 py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-3 rounded-full border-gray-200 text-xs text-gray-500">
              The system
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Five steps from subjects to mastery
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Every step is gated — no skipping, no shortcuts, no lying to yourself.
            </p>
          </div>

          <div className="relative">
            {/* connector line */}
            <div className="absolute left-4 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-red-200 via-red-100 to-transparent md:left-[3.25rem] md:block" />

            <div className="space-y-6">
              {[
                {
                  n: 1,
                  icon: <Brain className="size-5 text-red-400" />,
                  title: "Create a Subject",
                  desc: "Define what you want to master. Give it a name, icon, and a daily time goal. This becomes your learning operating unit.",
                  tag: "30 seconds to set up",
                },
                {
                  n: 2,
                  icon: <Sparkles className="size-5 text-amber-500" />,
                  title: "Generate a Curriculum with AI",
                  desc: "Paste a syllabus, describe a goal, or name a book — AI breaks it into ordered topics with resources and subtopics. You keep full edit control.",
                  tag: "AI-assisted, human-verified",
                },
                {
                  n: 3,
                  icon: <Clock3 className="size-5 text-blue-500" />,
                  title: "Study with a Focus Timer",
                  desc: "Open the active topic, start the session timer, and study. Your time is logged against the topic's target. Only one topic is unlocked at a time.",
                  tag: "Sequential — no skipping",
                },
                {
                  n: 4,
                  icon: <Target className="size-5 text-violet-500" />,
                  title: "Pass the Quiz to Unlock Next",
                  desc: "When you feel ready, take the AI-generated quiz. Pass it to mark the topic done and unlock the next. Fail → cooldown → retry. No free passes.",
                  tag: "Proof of understanding required",
                },
                {
                  n: 5,
                  icon: <BarChart3 className="size-5 text-orange-500" />,
                  title: "Track Progress & Maintain Streaks",
                  desc: "Analytics show your actual study minutes, daily goals, streaks, and completion rates per subject — so you can see reality, not just good intentions.",
                  tag: "Real data, real accountability",
                },
              ].map((step) => (
                <div key={step.n} className="flex gap-5 md:gap-8">
                  <div className="flex flex-col items-center md:items-start">
                    <StepDot n={step.n} />
                  </div>
                  <div className="min-w-0 flex-1 pb-2">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      {step.icon}
                      <h3 className="text-base font-semibold">{step.title}</h3>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        {step.tag}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-3 rounded-full border-gray-200 text-xs text-gray-500">
              Built-in capabilities
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything your learning needs — nothing it doesn't
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Brain className="size-5" />,
                color: "text-red-400 bg-red-50",
                title: "AI Curriculum Generator",
                desc: "Describe what you want to learn and get an ordered, resource-backed topic list in seconds. Fully editable.",
              },
              {
                icon: <Lock className="size-5" />,
                color: "text-violet-600 bg-violet-50",
                title: "Sequential Topic Locking",
                desc: "Only the current active topic is accessible. Forces depth-first learning and prevents the illusion of multi-tasking.",
              },
              {
                icon: <Target className="size-5" />,
                color: "text-rose-600 bg-rose-50",
                title: "Quiz-Gated Completion",
                desc: "AI-generated quizzes verify understanding for each topic. Pass to advance, fail to retry after cooldown. No gaming the system.",
              },
              {
                icon: <Clock3 className="size-5" />,
                color: "text-blue-600 bg-blue-50",
                title: "Focus Session Timer",
                desc: "Start, pause, and save timed study sessions. Actual minutes are logged versus your daily and topic targets.",
              },
              {
                icon: <Flame className="size-5" />,
                color: "text-orange-600 bg-orange-50",
                title: "Streaks & Daily Goals",
                desc: "Set a daily minute target. Hit it, build your streak. Miss it, reset. Simple accountability that actually hurts to lose.",
              },
              {
                icon: <BarChart3 className="size-5" />,
                color: "text-red-500 bg-teal-50",
                title: "Progress Analytics",
                desc: "Per-subject breakdowns, session history, topic completion rates, and mood tracking so you can see learning trends.",
              },
              {
                icon: <BookOpen className="size-5" />,
                color: "text-amber-600 bg-amber-50",
                title: "Resource Attachments",
                desc: "Attach videos, articles, docs, or books to each topic. Everything you need to study is one click away from the session.",
              },
              {
                icon: <Zap className="size-5" />,
                color: "text-yellow-600 bg-yellow-50",
                title: "Session Reflection",
                desc: "Log your mood and notes at the end of each session. Helps you identify when and how you learn best.",
              },
              {
                icon: <Trophy className="size-5" />,
                color: "text-indigo-600 bg-indigo-50",
                title: "Achievement Milestones",
                desc: "Earn achievements as you hit streak records, complete subjects, and log total study hours. Progress feels rewarding.",
              },
            ].map((f) => (
              <Card
                key={f.title}
                className="group border-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className={`mb-3 inline-flex size-9 items-center justify-center rounded-lg ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold">{f.title}</h3>
                  <p className="text-xs leading-relaxed text-gray-500">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-gray-100 bg-gray-50/70 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-4 md:px-8">
          {[
            { val: "5-step", label: "Guided learning flow" },
            { val: "Quiz-gated", label: "Topic completion" },
            { val: "AI-powered", label: "Curriculum generation" },
            { val: "100% free", label: "To get started" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">{s.val}</p>
              <p className="mt-0.5 text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-red-400 via-red-400 to-red-300 p-px shadow-2xl shadow-red-200/40">
            <div className="rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-red-400 via-red-400 to-red-400 px-8 py-16 text-white md:px-16">
              <div className="flex items-center gap-0">
                <span className="text-[15px] font-extrabold tracking-tight text-white">Carriculae</span>
                <span className="text-[15px] font-extrabold text-red-400 leading-none">.</span>
              </div>
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
                Stop planning to learn.
                <br />
                <span className="opacity-80">Start actually learning.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-base text-red-100">
                Create your first subject in 30 seconds. The system handles the structure, the
                sequencing, and the accountability — you just need to show up.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  className="gap-2 rounded-xl bg-white px-8 text-base font-semibold text-red-500 shadow-lg hover:bg-red-50 active:scale-95"
                  asChild
                >
                  <Link href="/signup">
                    Create free account
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl border-white/30 bg-white/10 px-8 text-base text-white hover:bg-white/20"
                  asChild
                >
                  <Link href="/login">I already have an account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 pb-8 pt-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex items-center gap-0">
            <span className="text-sm font-extrabold tracking-tight">Carriculae</span>
            <span className="text-sm font-extrabold text-red-500 leading-none">.</span>
          </div>
          <p className="text-xs text-gray-400">
            Structured learning. Consistent output. Measurable growth.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/login" className="hover:text-gray-700 transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-gray-700 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

