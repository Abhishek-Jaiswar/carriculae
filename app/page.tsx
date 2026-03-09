import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_15%,#dff6ff_0%,transparent_38%),radial-gradient(circle_at_88%_10%,#ffe8c4_0%,transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 md:px-8">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-emerald-500/90" />
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

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-8 md:pt-14">
        <Badge variant="outline" className="mb-4 bg-background/70">
          Built for focused learners
        </Badge>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          Plan your curriculum, track sessions, and build a daily learning habit.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          Carriculae helps you turn scattered study into structured progress with subjects, topics,
          streaks, and analytics in one clean workspace.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">Create Account</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 md:grid-cols-3 md:px-8">
        <Card className="bg-background/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Curriculum Builder</CardTitle>
            <CardDescription>Create subjects and break them into actionable topics.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Stay clear on what to study next instead of planning from scratch every day.
          </CardContent>
        </Card>
        <Card className="bg-background/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Session Tracking</CardTitle>
            <CardDescription>Log real study time and keep momentum visible.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Build consistency with streaks, daily goals, and progress snapshots.
          </CardContent>
        </Card>
        <Card className="bg-background/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Progress Analytics</CardTitle>
            <CardDescription>Know where your effort goes and what to improve.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            View trends by day and subject so your next learning decisions are data-backed.
          </CardContent>
        </Card>
      </section>

      <section className="border-t bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-6 md:px-8">
          <p className="text-sm text-muted-foreground">Ready to start your next learning streak?</p>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
