"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { Instrument_Serif, Geist_Mono } from "next/font/google";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Flame,
  Lock,
  Eye,
  EyeOff,
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") || "/dashboard", [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      toast.success("Logged in successfully.");
      router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`${instrumentSerif.variable} ${geistMono.variable} flex min-h-screen antialiased`}
    >
      {/* ── Left panel – brand/illustration ── */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-stone-900 p-12 lg:flex">
        {/* Ambient blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-500/20 blur-[90px]" />
          <div className="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-red-600/10 blur-[80px]" />
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
          <span className="font-(family-name:--font-instrument) text-[22px] italic text-white">
            Carriculae
          </span>
          <span className="font-(family-name:--font-instrument) text-[22px] text-red-400">.</span>
        </div>

        {/* Central illustration area */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-12">
          {/* Mock dashboard card */}
          <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-(family-name:--font-geist-mono) text-[10px] uppercase tracking-[0.12em] text-stone-500">
                Focus Session
              </p>
              <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-0.5 font-(family-name:--font-geist-mono) text-[9px] font-medium text-red-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                Active
              </span>
            </div>
            <p className="mb-1 font-(family-name:--font-geist-mono) text-[11px] text-stone-400">
              Machine Learning – Module 3
            </p>
            <p className="mb-3 font-(family-name:--font-instrument) text-[48px] leading-none tracking-tight text-white">
              24:17
            </p>
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-red-500 to-red-400" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Today", val: "42m" },
                { label: "Streak", val: "7d 🔥" },
                { label: "Goal", val: "18m left" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-white/5 px-2 py-2">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-wide text-stone-500">
                    {s.label}
                  </p>
                  <p className="font-(family-name:--font-geist-mono) text-[12px] font-semibold text-stone-200">
                    {s.val}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Floating stat pills */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {[
              { icon: <Flame className="h-3 w-3 text-orange-400" />, text: "Daily streaks" },
              { icon: <CheckCircle2 className="h-3 w-3 text-red-400" />, text: "Quiz-gated" },
              { icon: <BarChart3 className="h-3 w-3 text-violet-400" />, text: "Real analytics" },
            ].map((p) => (
              <span
                key={p.text}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-wide text-stone-400"
              >
                {p.icon}
                {p.text}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <p className="font-[family-name:var(--font-instrument)] text-[18px] italic leading-[1.4] text-stone-300">
            "Structured learning. Consistent output.
            <br />
            <em className="text-red-400">Measurable growth.</em>"
          </p>
          <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-wide text-stone-600">
            — The Carriculae method
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
              Welcome back
            </p>
            <h1 className="font-[family-name:var(--font-instrument)] text-[36px] leading-[1.1] tracking-tight text-stone-900">
              Ready to pick up where{" "}
              <em className="italic text-red-500">you left off?</em>
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3.5 font-[family-name:var(--font-geist-mono)] text-[13px] font-medium tracking-wide text-white shadow-lg shadow-red-200/60 transition-all hover:bg-red-600 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
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

          {/* Sign up link */}
          <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 text-center">
            <p className="font-[family-name:var(--font-geist-mono)] text-[12px] text-stone-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-red-500 underline-offset-4 hover:underline"
              >
                Create one free
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex items-center justify-center gap-4">
            {[
              { icon: <Lock className="h-3 w-3" />, text: "Secure login" },
              { icon: <CheckCircle2 className="h-3 w-3" />, text: "Free forever" },
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
