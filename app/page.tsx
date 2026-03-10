import Link from "next/link";
import { Instrument_Serif, Geist_Mono } from "next/font/google";
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

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-geist-mono",
});

function StepDot({ n }: { n: number }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 font-(family-name:--font-geist-mono) text-[13px] font-semibold text-white shadow-md shadow-red-200">
      {n}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div
      className={`${instrumentSerif.variable} ${geistMono.variable} min-h-screen overflow-x-hidden bg-[#faf9f7] font-sans text-stone-900 antialiased`}
    >
      {/* ── ambient blobs ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-red-100/50 blur-[100px]" />
        <div className="absolute -right-32 top-32 h-[400px] w-[400px] rounded-full bg-amber-100/40 blur-[100px]" />
        <div className="absolute bottom-20 left-1/2 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-red-50/60 blur-[90px]" />
      </div>

      {/* ══════════ NAV ══════════ */}
      <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-[#faf9f7]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center">
            <span className="font-(family-name:--font-instrument) text-[20px] italic tracking-tight text-stone-900">
              Carriculae
            </span>
            <span className="font-(family-name:--font-instrument) text-[20px] text-red-500">.</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            {["Features", "How it works"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="font-(family-name:--font-geist-mono) text-[12px] tracking-wide text-stone-400 transition-colors hover:text-stone-900"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="font-(family-name:--font-geist-mono) rounded-lg px-4 py-2 text-[12px] tracking-wide text-stone-500 transition-colors hover:text-stone-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="font-(family-name:--font-geist-mono) rounded-lg bg-red-500 px-4 py-2 text-[12px] font-medium tracking-wide text-white shadow-sm shadow-red-200 transition-all hover:bg-red-600 hover:-translate-y-px"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════ HERO ══════════ */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:px-10 md:pt-28">
        {/* Eyebrow */}
        <div className="mb-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 font-(family-name:--font-geist-mono) text-[11px] tracking-[0.08em] uppercase text-red-500">
            <Sparkles className="h-3 w-3" />
            Structured learning — not wishful thinking
          </span>
        </div>

        {/* Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-(family-name:--font-instrument) text-[clamp(48px,7vw,90px)] leading-none tracking-[-0.02em] text-stone-900">
            Turn your syllabus into a{" "}
            <em className="italic text-red-500">learning machine</em>
          </h1>
          <p className="mx-auto mt-7 max-w-xl font-(family-name:--font-geist-mono) text-[13px] leading-[1.8] tracking-wide text-stone-500">
            Strict sequence. Enforced focus sessions. Quiz-gated mastery. Analytics that show you
            the truth — not just what you want to hear.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-7 py-3.5 font-(family-name:--font-geist-mono) text-[13px] font-medium tracking-wide text-white shadow-lg shadow-red-200/60 transition-all hover:bg-red-600 hover:-translate-y-0.5"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-7 py-3.5 font-(family-name:--font-geist-mono) text-[13px] tracking-wide text-stone-600 transition-all hover:border-stone-300 hover:text-stone-900"
          >
            Sign in
          </Link>
        </div>

        {/* Stat pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {[
            { icon: <Flame className="h-3 w-3 text-orange-500" />, text: "Daily streaks" },
            { icon: <CheckCircle2 className="h-3 w-3 text-red-400" />, text: "Quiz-gated completion" },
            { icon: <Clock3 className="h-3 w-3 text-blue-500" />, text: "Focus session timer" },
            { icon: <BarChart3 className="h-3 w-3 text-violet-500" />, text: "Real-time analytics" },
          ].map((p) => (
            <span
              key={p.text}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 font-(family-name:--font-geist-mono) text-[11px] tracking-wide text-stone-500 shadow-sm"
            >
              {p.icon}
              {p.text}
            </span>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div className="mx-auto mt-14 w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-200/70">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-5 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span className="ml-3 rounded-md border border-stone-200 bg-white px-3 py-0.5 font-(family-name:--font-geist-mono) text-[10px] text-stone-400">
              carriculae.app/dashboard
            </span>
          </div>
          {/* Mock content */}
          <div className="grid grid-cols-3 divide-x divide-stone-100 p-5">
            <div className="pr-5">
              <p className="mb-3 font-(family-name:--font-geist-mono) text-[9px] font-semibold uppercase tracking-[0.12em] text-stone-400">
                Topics
              </p>
              <div className="space-y-1.5">
                {["Intro to ML", "Supervised Learning", "Neural Networks", "CNNs", "Transformers"].map(
                  (t, i) => (
                    <div
                      key={t}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-(family-name:--font-geist-mono) text-[10px] transition-colors ${
                        i === 0
                          ? "bg-red-50 text-red-500 ring-1 ring-red-200"
                          : i < 3
                          ? "text-stone-500"
                          : "text-stone-300"
                      }`}
                    >
                      {i === 0 ? (
                        <Play className="h-2.5 w-2.5 text-red-400" />
                      ) : i < 3 ? (
                        <CheckCircle2 className="h-2.5 w-2.5 text-stone-300" />
                      ) : (
                        <Lock className="h-2.5 w-2.5 text-stone-300" />
                      )}
                      {t}
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="col-span-2 pl-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-(family-name:--font-geist-mono) text-[9px] font-semibold uppercase tracking-[0.12em] text-stone-400">
                  Focus Session
                </p>
                <span className="rounded-full bg-red-100 px-2 py-0.5 font-(family-name:--font-geist-mono) text-[9px] font-semibold text-red-500">
                  Active
                </span>
              </div>
              <p className="mb-0.5 font-(family-name:--font-geist-mono) text-[11px] font-medium text-stone-600">
                Intro to ML
              </p>
              <p className="mb-3 font-(family-name:--font-instrument) text-[44px] leading-none tracking-tight text-stone-900">
                24:17
              </p>
              <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                <div className="h-full w-[62%] rounded-full bg-linear-to-r from-red-500 to-red-400" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Today", val: "42m" },
                  { label: "Streak", val: "7d 🔥" },
                  { label: "Goal", val: "18m left" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-stone-50 px-3 py-2">
                    <p className="font-(family-name:--font-geist-mono) text-[9px] uppercase tracking-wide text-stone-400">
                      {s.label}
                    </p>
                    <p className="font-(family-name:--font-geist-mono) text-[13px] font-semibold text-stone-800">
                      {s.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how-it-works" className="border-t border-stone-200/60 bg-stone-50/80 py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="mb-16 grid md:grid-cols-2 md:items-end md:gap-10">
            <div>
              <span className="mb-4 inline-block font-(family-name:--font-geist-mono) text-[11px] tracking-[0.12em] uppercase text-stone-400">
                The system
              </span>
              <h2 className="font-(family-name:--font-instrument) text-[clamp(36px,4.5vw,58px)] leading-[1.08] tracking-tight text-stone-900">
                Five steps from <em className="italic text-red-500">subjects</em> to mastery
              </h2>
            </div>
            <p className="font-(family-name:--font-geist-mono) text-[13px] leading-[1.8] text-stone-500">
              Every step is gated — no skipping, no shortcuts, no lying to yourself.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-[17px] top-9 hidden h-[calc(100%-5rem)] w-px bg-linear-to-b from-red-300 via-red-200/50 to-transparent md:block" />
            <div className="space-y-8">
              {[
                {
                  n: 1,
                  icon: <Brain className="h-5 w-5 text-red-400" />,
                  title: "Create a Subject",
                  desc: "Define what you want to master. Give it a name, icon, and a daily time goal. This becomes your learning operating unit.",
                  tag: "30 seconds to set up",
                },
                {
                  n: 2,
                  icon: <Sparkles className="h-5 w-5 text-amber-500" />,
                  title: "Generate a Curriculum with AI",
                  desc: "Paste a syllabus, describe a goal, or name a book — AI breaks it into ordered topics with resources and subtopics. You keep full edit control.",
                  tag: "AI-assisted, human-verified",
                },
                {
                  n: 3,
                  icon: <Clock3 className="h-5 w-5 text-blue-500" />,
                  title: "Study with a Focus Timer",
                  desc: "Open the active topic, start the session timer, and study. Your time is logged against the topic's target. Only one topic is unlocked at a time.",
                  tag: "Sequential — no skipping",
                },
                {
                  n: 4,
                  icon: <Target className="h-5 w-5 text-violet-500" />,
                  title: "Pass the Quiz to Unlock Next",
                  desc: "When you feel ready, take the AI-generated quiz. Pass to mark done and unlock the next. Fail → cooldown → retry. No free passes.",
                  tag: "Proof of understanding required",
                },
                {
                  n: 5,
                  icon: <BarChart3 className="h-5 w-5 text-orange-500" />,
                  title: "Track Progress & Maintain Streaks",
                  desc: "Analytics show actual study minutes, daily goals, streaks, and completion rates — reality, not just good intentions.",
                  tag: "Real data, real accountability",
                },
              ].map((step) => (
                <div key={step.n} className="flex gap-6 md:gap-8">
                  <StepDot n={step.n} />
                  <div className="min-w-0 flex-1 pb-2">
                    <div className="mb-2 flex flex-wrap items-center gap-2.5">
                      {step.icon}
                      <h3 className="font-(family-name:--font-instrument) text-[20px] text-stone-900">
                        {step.title}
                      </h3>
                      <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 font-(family-name:--font-geist-mono) text-[10px] tracking-wide text-stone-400">
                        {step.tag}
                      </span>
                    </div>
                    <p className="font-(family-name:--font-geist-mono) text-[13px] leading-[1.8] text-stone-500">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES GRID ══════════ */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="mb-16 grid md:grid-cols-2 md:items-end md:gap-10">
            <div>
              <span className="mb-4 inline-block font-(family-name:--font-geist-mono) text-[11px] tracking-[0.12em] uppercase text-stone-400">
                Built-in capabilities
              </span>
              <h2 className="font-(family-name:--font-instrument) text-[clamp(36px,4.5vw,58px)] leading-[1.08] tracking-tight text-stone-900">
                Everything your learning needs —{" "}
                <em className="italic text-red-500">nothing it doesn't</em>
              </h2>
            </div>
            <p className="font-(family-name:--font-geist-mono) text-[13px] leading-[1.8] text-stone-500">
              Nine tightly integrated capabilities that make the whole system coherent, honest, and
              hard to cheat.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Brain className="h-5 w-5" />,
                color: "text-red-500 bg-red-50 border-red-100",
                title: "AI Curriculum Generator",
                desc: "Describe what you want to learn and get an ordered, resource-backed topic list in seconds. Fully editable.",
              },
              {
                icon: <Lock className="h-5 w-5" />,
                color: "text-violet-600 bg-violet-50 border-violet-100",
                title: "Sequential Topic Locking",
                desc: "Only the current active topic is accessible. Forces depth-first learning and prevents the illusion of multi-tasking.",
              },
              {
                icon: <Target className="h-5 w-5" />,
                color: "text-rose-600 bg-rose-50 border-rose-100",
                title: "Quiz-Gated Completion",
                desc: "AI-generated quizzes verify understanding. Pass to advance, fail to retry after cooldown. No gaming the system.",
              },
              {
                icon: <Clock3 className="h-5 w-5" />,
                color: "text-blue-600 bg-blue-50 border-blue-100",
                title: "Focus Session Timer",
                desc: "Start, pause, and save timed study sessions. Actual minutes logged versus your daily and topic targets.",
              },
              {
                icon: <Flame className="h-5 w-5" />,
                color: "text-orange-600 bg-orange-50 border-orange-100",
                title: "Streaks & Daily Goals",
                desc: "Set a daily minute target. Hit it, build your streak. Miss it, reset. Simple accountability that actually hurts to lose.",
              },
              {
                icon: <BarChart3 className="h-5 w-5" />,
                color: "text-teal-600 bg-teal-50 border-teal-100",
                title: "Progress Analytics",
                desc: "Per-subject breakdowns, session history, topic completion rates, and mood tracking to reveal learning trends.",
              },
              {
                icon: <BookOpen className="h-5 w-5" />,
                color: "text-amber-600 bg-amber-50 border-amber-100",
                title: "Resource Attachments",
                desc: "Attach videos, articles, docs, or books to each topic. Everything you need is one click from the session.",
              },
              {
                icon: <Zap className="h-5 w-5" />,
                color: "text-yellow-600 bg-yellow-50 border-yellow-100",
                title: "Session Reflection",
                desc: "Log your mood and notes at the end of each session. Helps identify when and how you learn best.",
              },
              {
                icon: <Trophy className="h-5 w-5" />,
                color: "text-indigo-600 bg-indigo-50 border-indigo-100",
                title: "Achievement Milestones",
                desc: "Earn achievements as you hit streak records, complete subjects, and log total study hours.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-stone-200/80 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-100"
              >
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${f.color}`}
                >
                  {f.icon}
                </div>
                <h3 className="mb-2 font-(family-name:--font-instrument) text-[18px] text-stone-900">
                  {f.title}
                </h3>
                <p className="font-(family-name:--font-geist-mono) text-[12px] leading-[1.75] text-stone-500">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ STATS BAR ══════════ */}
      <section className="border-y border-stone-200/60 bg-stone-50/80">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="grid grid-cols-2 divide-x divide-stone-200/60 md:grid-cols-4">
            {[
              { val: "5-step", label: "Guided learning flow" },
              { val: "Quiz-gated", label: "Topic completion" },
              { val: "AI-powered", label: "Curriculum generation" },
              { val: "100% free", label: "To get started" },
            ].map((s) => (
              <div key={s.label} className="py-10 text-center">
                <p className="font-(family-name:--font-instrument) text-[clamp(28px,3vw,40px)] tracking-tight text-stone-900">
                  {s.val}
                </p>
                <p className="mt-1 font-(family-name:--font-geist-mono) text-[11px] tracking-wide text-stone-500">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 md:px-10">
          <div className="relative overflow-hidden rounded-3xl bg-stone-900 px-10 py-20 text-center md:px-20">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-red-500/10 blur-[80px]" />
              <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-red-600/10 blur-[80px]" />
              <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-[60px]" />
            </div>
            <div className="relative">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-(family-name:--font-geist-mono) text-[11px] tracking-widest uppercase text-stone-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Free to start
              </span>
              <h2 className="font-(family-name:--font-instrument) text-[clamp(38px,5vw,68px)] leading-[1.05] tracking-tight text-white">
                Stop planning to learn.
                <br />
                <em className="italic text-red-400">Start actually learning.</em>
              </h2>
              <p className="mx-auto mt-6 max-w-lg font-(family-name:--font-geist-mono) text-[13px] leading-[1.8] text-stone-400">
                Create your first subject in 30 seconds. The system handles structure, sequencing,
                and accountability — you just need to show up.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-7 py-3.5 font-(family-name:--font-geist-mono) text-[13px] font-medium tracking-wide text-white shadow-lg shadow-red-900/40 transition-all hover:bg-red-400 hover:-translate-y-0.5"
                >
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 font-(family-name:--font-geist-mono) text-[13px] tracking-wide text-stone-300 transition-all hover:border-white/20 hover:bg-white/10"
                >
                  I already have an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-stone-200/60 pb-10 pt-7">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 md:px-10">
          <div className="flex items-center">
            <span className="font-(family-name:--font-instrument) text-[17px] italic text-stone-800">
              Carriculae
            </span>
            <span className="font-(family-name:--font-instrument) text-[17px] text-red-500">.</span>
          </div>
          <p className="font-(family-name:--font-geist-mono) text-[11px] tracking-wide text-stone-400">
            Structured learning. Consistent output. Measurable growth.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="font-(family-name:--font-geist-mono) text-[11px] tracking-wide text-stone-400 transition-colors hover:text-stone-800"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="font-(family-name:--font-geist-mono) text-[11px] tracking-wide text-stone-400 transition-colors hover:text-stone-800"
            >
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}