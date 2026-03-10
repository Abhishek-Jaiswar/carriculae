"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Instrument_Serif, Geist_Mono } from "next/font/google";
import {
  ArrowRight,
  Brain,
  Target,
  Trophy,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
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

const perks = [
  {
    icon: <Brain className="h-4 w-4 text-red-400" />,
    title: "AI Curriculum Generator",
    desc: "Turn any topic into an ordered study plan.",
  },
  {
    icon: <Target className="h-4 w-4 text-violet-400" />,
    title: "Quiz-Gated Mastery",
    desc: "Prove understanding before moving on.",
  },
  {
    icon: <Trophy className="h-4 w-4 text-amber-400" />,
    title: "Streaks & Achievements",
    desc: "Accountability that actually stings to lose.",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name || !email || !password) {
      toast.error("Name, email and password are required.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed.");
      }

      toast.success("Account created.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`${instrumentSerif.variable} ${geistMono.variable} flex min-h-screen antialiased`}
    >
      {/* ── Left panel – brand/perks ── */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-stone-900 p-12 lg:flex">
        {/* Ambient blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-500/20 blur-[90px]" />
          <div className="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-amber-500/10 blur-[80px]" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-[60px]" />
        </div>

        {/* Subtle grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-1">
          <span className="font-[family-name:var(--font-instrument)] text-[22px] italic text-white">
            Carriculae
          </span>
          <span className="font-[family-name:var(--font-instrument)] text-[22px] text-red-400">.</span>
        </div>

        {/* Central content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em] text-stone-500">
            What's included
          </p>
          <h2 className="mb-10 font-[family-name:var(--font-instrument)] text-[36px] leading-[1.1] tracking-tight text-white">
            Everything you need to{" "}
            <em className="italic text-red-400">actually finish</em>{" "}
            what you start.
          </h2>

          <div className="space-y-5">
            {perks.map((perk) => (
              <div key={perk.title} className="flex gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  {perk.icon}
                </div>
                <div>
                  <p className="font-[family-name:var(--font-geist-mono)] text-[13px] font-medium text-stone-200">
                    {perk.title}
                  </p>
                  <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[12px] leading-[1.6] text-stone-500">
                    {perk.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress preview */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.1em] text-stone-500">
                Your first subject
              </p>
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-stone-500">
                0 / 5 topics
              </span>
            </div>
            <div className="mb-3 space-y-1.5">
              {["Introduction", "Core Concepts", "Deep Dive", "Practice", "Mastery"].map(
                (t, i) => (
                  <div
                    key={t}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 font-[family-name:var(--font-geist-mono)] text-[11px]"
                    style={{
                      background:
                        i === 0 ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <Lock
                      className="h-3 w-3 shrink-0"
                      style={{ color: i === 0 ? "#f87171" : "rgba(255,255,255,0.2)" }}
                    />
                    <span style={{ color: i === 0 ? "#fca5a5" : "rgba(255,255,255,0.2)" }}>
                      {t}
                    </span>
                  </div>
                )
              )}
            </div>
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] italic text-stone-600">
              Complete each topic to unlock the next →
            </p>
          </div>
        </div>

        {/* Bottom stat */}
        <div className="relative z-10">
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-wide text-stone-600">
            100% free to start · No credit card required
          </p>
        </div>
      </div>

      {/* ── Right panel – form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#faf9f7] px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-10 flex items-center lg:hidden">
          <span className="font-[family-name:var(--font-instrument)] text-[22px] italic text-stone-900">
            Carriculae
          </span>
          <span className="font-[family-name:var(--font-instrument)] text-[22px] text-red-500">.</span>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Heading */}
          <div className="mb-8">
            <p className="mb-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.1em] text-stone-400">
              Free account
            </p>
            <h1 className="font-[family-name:var(--font-instrument)] text-[36px] leading-[1.1] tracking-tight text-stone-900">
              Start learning with{" "}
              <em className="italic text-red-500">real structure.</em>
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block font-[family-name:var(--font-geist-mono)] text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[13px] text-stone-800 placeholder-stone-300 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block font-[family-name:var(--font-geist-mono)] text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[13px] text-stone-800 placeholder-stone-300 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block font-[family-name:var(--font-geist-mono)] text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 pr-11 font-[family-name:var(--font-geist-mono)] text-[13px] text-stone-800 placeholder-stone-300 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="block font-[family-name:var(--font-geist-mono)] text-[11px] font-medium uppercase tracking-[0.08em] text-stone-500"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 pr-11 font-[family-name:var(--font-geist-mono)] text-[13px] text-stone-800 placeholder-stone-300 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3.5 font-[family-name:var(--font-geist-mono)] text-[13px] font-medium tracking-wide text-white shadow-lg shadow-red-200/60 transition-all hover:bg-red-600 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0"
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create free account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-wide text-stone-400">
              or
            </span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          {/* Login link */}
          <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 text-center">
            <p className="font-[family-name:var(--font-geist-mono)] text-[12px] text-stone-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-red-500 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {[
              { icon: <Lock className="h-3 w-3" />, text: "Secure & encrypted" },
              { icon: <CheckCircle2 className="h-3 w-3" />, text: "No credit card" },
            ].map((b) => (
              <span
                key={b.text}
                className="inline-flex items-center gap-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-wide text-stone-400"
              >
                {b.icon}
                {b.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
