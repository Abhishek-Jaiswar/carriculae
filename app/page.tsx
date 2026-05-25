import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  LayoutGrid,
  Lock,
  Play,
  Quote,
  Shield,
  Timer,
} from "lucide-react";

const HEADER_NAV = [
  { label: "Overview", href: "#overview" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Flow", href: "#flow" },
];

const HIGHLIGHTS = [
  {
    title: "Sequential topics",
    description: "Work one active topic at a time. The next unlocks after you finish the current one.",
    icon: LayoutGrid,
  },
  {
    title: "Timed sessions",
    description: "Run a session timer and log minutes toward daily goals and topic targets.",
    icon: Timer,
  },
  {
    title: "Quiz checkpoints",
    description: "Short quizzes gate completion—proof you absorbed the material before moving on.",
    icon: Shield,
  },
  {
    title: "Curriculum drafts",
    description: "Generate an ordered outline from your goals, then edit topics and links freely.",
    icon: BookOpen,
  },
];

const FLOW = [
  {
    title: "Create a subject",
    text: "Pick what you’re studying and how many minutes you want per day.",
  },
  {
    title: "Shape the path",
    text: "Use generation as a starting point, then reorder or rewrite until it fits you.",
  },
  {
    title: "Study and verify",
    text: "Log sessions, pass quizzes, and watch streaks and charts reflect real effort.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased">
      {/* Top fade — subtle depth without blob gradients */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-80 bg-linear-to-b from-white to-transparent"
      />

      <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-[1.0625rem] font-semibold tracking-tight text-stone-900">
            Carriculae
          </Link>
          <nav className="hidden items-center gap-9 md:flex">
            {HEADER_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.9375rem] font-medium text-stone-600 transition-colors hover:text-stone-900"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden text-[0.9375rem] font-medium text-stone-600 hover:text-stone-900 sm:inline"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-stone-900 px-4 py-2 text-[0.9375rem] font-medium text-white transition-colors hover:bg-stone-800"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero — centered SaaS pattern */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 md:pb-20 md:pt-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-emerald-700/90">
              Learning ops for individuals
            </p>
            <h1 className="mt-5 text-[2.125rem] font-semibold leading-[1.12] tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.08] md:text-[3.25rem]">
              Structure, sessions, and proof—not another passive playlist.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
              Carriculae connects curricula, focus time, and quizzes so progress shows up where you measure it: on your
              dashboard, not just in your head.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-11 min-w-[10rem] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 text-[0.9375rem] font-semibold text-white shadow-sm shadow-emerald-900/10 transition-colors hover:bg-emerald-700"
              >
                Start free
                <ArrowRight className="size-4 opacity-90" aria-hidden />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 min-w-[10rem] items-center justify-center rounded-lg border border-stone-300 bg-white px-6 text-[0.9375rem] font-semibold text-stone-800 shadow-sm transition-colors hover:border-stone-400 hover:bg-stone-50"
              >
                Sign in
              </Link>
            </div>
            <ul className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[0.875rem] text-stone-500">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-600" aria-hidden />
                Free to begin
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-600" aria-hidden />
                Quiz-gated progression
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-emerald-600" aria-hidden />
                Streaks & analytics
              </li>
            </ul>
          </div>

          {/* Product frame */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="rounded-xl border border-stone-200 bg-white p-2 shadow-[0_32px_64px_-24px_rgba(28,25,23,0.25)] sm:p-3">
              <div className="overflow-hidden rounded-lg border border-stone-100 bg-stone-50/60">
                <div className="flex items-center gap-2 border-b border-stone-100 bg-white px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="size-3 rounded-full bg-stone-200" />
                    <span className="size-3 rounded-full bg-stone-200" />
                    <span className="size-3 rounded-full bg-stone-200" />
                  </div>
                  <div className="mx-auto flex-1 truncate rounded-md bg-stone-100 py-1.5 text-center text-xs text-stone-500 sm:mx-0 sm:max-w-md sm:ml-4">
                    carriculae.app / learn
                  </div>
                </div>
                <div className="grid bg-white md:grid-cols-[minmax(0,240px)_1fr]">
                  <aside className="border-b border-stone-100 p-4 md:border-b-0 md:border-r md:border-stone-100">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Subject</p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">Python for data</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-400">Up next</p>
                    <ul className="mt-2 space-y-1">
                      {[
                        { t: "Functions & scope", active: true },
                        { t: "Comprehensions", active: false },
                        { t: "Pandas basics", active: false, lock: true },
                      ].map((row) => (
                        <li
                          key={row.t}
                          className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                            row.active ? "bg-emerald-50 font-medium text-emerald-950" : "text-stone-600"
                          } ${row.lock ? "text-stone-400" : ""}`}
                        >
                          {row.lock ? (
                            <Lock className="size-4 shrink-0" aria-hidden />
                          ) : row.active ? (
                            <Play className="size-4 shrink-0 text-emerald-600" aria-hidden />
                          ) : (
                            <Clock className="size-4 shrink-0 text-stone-400" aria-hidden />
                          )}
                          <span className="truncate">{row.t}</span>
                        </li>
                      ))}
                    </ul>
                  </aside>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-stone-500">Session</p>
                        <h2 className="mt-1 text-lg font-semibold text-stone-900">Functions &amp; scope</h2>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                        In progress
                      </span>
                    </div>
                    <p className="mt-8 text-5xl font-semibold tabular-nums tracking-tight text-stone-900 sm:text-6xl">
                      18:42
                    </p>
                    <div className="mt-4 h-2 max-w-md overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full w-[45%] rounded-full bg-emerald-500" />
                    </div>
                    <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-lg">
                      {[
                        { label: "Today", value: "35m" },
                        { label: "Streak", value: "5d" },
                        { label: "Goal left", value: "25m" },
                      ].map((k) => (
                        <div key={k.label} className="rounded-lg border border-stone-100 bg-stone-50 px-3 py-3">
                          <p className="text-xs text-stone-500">{k.label}</p>
                          <p className="mt-1 text-sm font-semibold tabular-nums text-stone-900">{k.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview strip */}
        <section id="overview" className="border-y border-stone-200 bg-white py-14">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-3 sm:px-6 lg:gap-16 lg:px-8">
            {[
              { n: "One", t: "Active path", d: "A single unlocked topic keeps attention from splintering." },
              { n: "Two", t: "Honest metrics", d: "Minutes and streaks update from sessions you actually log." },
              { n: "Three", t: "Mastery checks", d: "Quizzes close the loop before the curriculum moves forward." },
            ].map((item) => (
              <div key={item.n}>
                <p className="text-xs font-semibold text-emerald-700">{item.n}</p>
                <h2 className="mt-2 text-lg font-semibold text-stone-900">{item.t}</h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Capabilities — bento-ish */}
        <section id="capabilities" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-[2rem]">
              Built around how solo learners ship progress
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">
              Four primitives—covering scope, time, verification, and content—that stay aligned instead of fighting each
              other.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="flex flex-col rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex size-11 items-center justify-center rounded-lg bg-stone-100 text-stone-800">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="mt-5 text-base font-semibold text-stone-900">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Quote — human cadence */}
        <section className="border-y border-stone-200 bg-stone-100/80 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <Quote className="mx-auto size-8 text-stone-300" aria-hidden />
            <blockquote className="mt-6 text-xl font-medium leading-relaxed text-stone-800 sm:text-2xl">
              The hardest part isn&apos;t motivation once—it&apos;s not losing the thread two weeks later.
            </blockquote>
            <p className="mt-6 text-sm text-stone-600">
              Carriculae is for people who want a calendar-neutral system: topics, time on task, and a dashboard that
              doesn&apos;t lie.
            </p>
          </div>
        </section>

        {/* Flow */}
        <section id="flow" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-[2rem]">How you move through it</h2>
              <p className="mt-4 text-lg leading-relaxed text-stone-600">
                No eighteen-step diagram—just setup, refinement, then repeat until the subject is finished.
              </p>
            </div>
            <Link href="/signup" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Open an account
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ol className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8">
            {FLOW.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Step {i + 1}</p>
                <h3 className="mt-3 text-lg font-semibold text-stone-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Analytics teaser */}
        <section className="border-t border-stone-200 bg-white py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600">
                <BarChart3 className="size-3.5 text-emerald-600" aria-hidden />
                Progress & outcomes
              </div>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-stone-900">
                See habits and completion in one place
              </h2>
              <p className="mt-4 leading-relaxed text-stone-600">
                Weekly minutes, streaks, topic counts, and quiz outcomes roll into views meant for quick check-ins—not
                spreadsheet archaeology.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-stone-700">
                {[
                  "Outcome-focused metrics alongside habit signals",
                  "Per-subject time so you know where effort goes",
                  "History that ties back to sessions you logged",
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-stone-200 bg-linear-to-br from-stone-50 to-white p-6 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">This week</p>
              <p className="mt-3 text-4xl font-semibold tabular-nums text-stone-900">6h 12m</p>
              <p className="mt-1 text-sm text-stone-500">Across 9 sessions · 4-day streak</p>
              <div className="mt-8 flex h-36 items-end gap-2">
                {[40, 65, 35, 80, 55, 70, 45].map((h, idx) => (
                  <div key={idx} className="flex-1 rounded-t-md bg-emerald-500/85" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-stone-400">Illustrative weekly chart</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-stone-200 bg-stone-900 px-4 py-20 text-center sm:px-6">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
              Bring your next subject into focus
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-stone-400">
              Sign up takes a minute. Your first curriculum doesn&apos;t need to be perfect—it needs to exist.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-8 text-[0.9375rem] font-semibold text-emerald-950 transition-colors hover:bg-emerald-400"
              >
                Create account
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-stone-600 px-8 text-[0.9375rem] font-semibold text-stone-200 hover:border-stone-500 hover:text-white"
              >
                I already have access
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span className="font-semibold text-stone-900">Carriculae</span>
          <p className="max-w-md text-sm leading-relaxed text-stone-500">
            Independent study with sequencing, sessions, and checkpoints—without turning learning into theater.
          </p>
          <div className="flex gap-8 text-sm font-medium">
            <Link href="/login" className="text-stone-600 hover:text-stone-900">
              Log in
            </Link>
            <Link href="/signup" className="text-stone-600 hover:text-stone-900">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
