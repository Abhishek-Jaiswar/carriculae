"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Timer } from "lucide-react";

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
    <div className="flex min-h-screen bg-stone-50 antialiased">
      <div className="relative hidden w-[42%] border-r border-stone-200 bg-white p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(245 245 244) 1px, transparent 1px), linear-gradient(to bottom, rgb(245 245 244) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="relative z-10 text-[1.125rem] font-semibold tracking-tight text-stone-900">
          Carriculae
        </div>
        <div className="relative z-10">
          <p className="max-w-sm text-3xl font-semibold leading-[1.2] tracking-tight text-stone-900">
            Continue where you paused.
          </p>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-stone-600">
            Sessions, streaks, and progression stay in one workflow so returning to study takes seconds.
          </p>
          <div className="mt-8 grid gap-3">
            {["Quiz-gated progression", "Daily streak tracking", "Progress analytics"].map((item) => (
              <div key={item} className="inline-flex w-fit items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700">
                <CheckCircle2 className="size-4 text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-xs text-stone-500">Focus session</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-stone-900">24:17</p>
          <div className="mt-3 h-2 w-full rounded-full bg-stone-200">
            <div className="h-2 w-[62%] rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 text-[1.125rem] font-semibold tracking-tight text-stone-900 lg:hidden">Carriculae</div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">Welcome back</p>
            <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-tight text-stone-900">
              Sign in and keep momentum.
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
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-[13px] text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 pr-11 text-[13px] text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-[13px] font-medium tracking-wide text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
            <p className="text-[12px] text-stone-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-emerald-700 underline-offset-4 hover:underline"
              >
                Create one free
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex items-center justify-center gap-4">
            {[
              { icon: <Lock className="h-3 w-3" />, text: "Secure login" },
              { icon: <Timer className="h-3 w-3" />, text: "Resume instantly" },
            ].map((b) => (
              <span
                key={b.text}
                className="inline-flex items-center gap-1.5 text-[10px] tracking-wide text-stone-500"
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
