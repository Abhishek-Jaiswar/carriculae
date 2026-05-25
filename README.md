# Carriculae

Personal learning app: create subjects, generate AI-backed curricula (Groq), study with timed sessions, pass gated quizzes, and track streaks and progress in MongoDB.

## Features (high level)

- **Curriculum generation** — Structured topics with resources and subtopics via `POST /api/generate` (requires `GROQ_API_KEY`).
- **Learn + quiz gate** — Sequential topic unlock; quizzes with cooldown on failure.
- **Spaced review** — After a passed quiz, topics get a `nextReviewAt` schedule; `GET /api/reviews` lists due items; learners mark reviews complete from the learn page.
- **Trust / safety** — Resource URLs are normalized to **HTTPS** only; optional domain allowlist via `RESOURCE_URL_ALLOWLIST`.
- **Feedback** — Thumbs up/down on resources posts to `POST /api/feedback` for quality loops.
- **Metrics** — Product KPIs are documented in [docs/METRICS.md](docs/METRICS.md) and surfaced under **Progress → Outcome metrics** (`GET /api/progress` includes `metrics`).
- **Rate limits** — In-memory limits on generation, quiz start, and quiz submit (suitable for single-instance deploys; use Redis at scale).

## Requirements

- Node 20+
- pnpm (or npm/yarn)
- MongoDB connection string
- Groq API key for AI features

Copy [`.env.example`](.env.example) to `.env.local` and set variables.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `GROQ_API_KEY` | For AI | Groq API key for curriculum and quiz generation |
| `RESOURCE_URL_ALLOWLIST` | No | Comma-separated hostnames (no scheme); if set, only these domains are allowed for resource URLs |
| `NODE_ENV` | Auto | `production` enables secure cookies |

## Scripts

```bash
pnpm dev      # Next.js dev server
pnpm build    # Production build
pnpm start    # Run production server
pnpm lint     # ESLint
pnpm seed     # Seed sample data (if configured)
```

## Deploy notes

- Set `MONGODB_URI` and `GROQ_API_KEY` on the host (e.g. Vercel environment variables).
- **Logging:** server routes emit JSON lines via `lib/logger.ts` (`stdout`). Forward to your log stack in production.
- **Scaling:** Replace in-memory `lib/rate-limit.ts` with a shared store (Redis) if you run multiple instances.
- **Observability:** Hook your error tracker (e.g. Sentry) in API routes or use log drains from the platform.

## Tech stack

Next.js (App Router), React, MongoDB + Mongoose, Tailwind, Groq (LLM).
