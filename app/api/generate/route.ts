import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Curriculum } from "@/lib/models/Curriculum";
import { Subject } from "@/lib/models/Subject";

const MODEL_NAME = "llama-3.3-70b-versatile";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const inFlightGenerations = new Set<string>();

type GeneratedTopic = {
  title: string;
  description: string;
  estimatedMinutes: number;
  resources: { title: string; url: string; type: "video" | "article" | "book" | "other" }[];
  subtopics: { title: string; done: boolean }[];
};

function normalizeTopics(parsed: unknown): GeneratedTopic[] | null {
  if (!Array.isArray(parsed)) return null;

  return parsed
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => {
      const rawResources = Array.isArray(item.resources) ? item.resources : [];
      const resources = rawResources
        .map((resource) => {
          if (!resource || typeof resource !== "object") return null;
          const r = resource as Record<string, unknown>;
          const type = String(r.type || "article").toLowerCase();
          return {
            title: String(r.title || "").trim().slice(0, 120),
            url: String(r.url || "").trim().slice(0, 400),
            type: ["video", "article", "book", "other"].includes(type)
              ? (type as "video" | "article" | "book" | "other")
              : "article",
          };
        })
        .filter((r): r is { title: string; url: string; type: "video" | "article" | "book" | "other" } => Boolean(r))
        .filter((r) => r.title || r.url)
        .slice(0, 8);

      const rawSubtopics = Array.isArray(item.subtopics) ? item.subtopics : [];
      const subtopics = rawSubtopics
        .map((subtopic) => {
          if (!subtopic || typeof subtopic !== "object") return null;
          const s = subtopic as Record<string, unknown>;
          const title = String(s.title || "").trim().slice(0, 120);
          if (!title) return null;
          return {
            title,
            done: false,
          };
        })
        .filter((s): s is { title: string; done: boolean } => Boolean(s))
        .slice(0, 20);

      return {
        title: String(item.title ?? "Untitled Topic").trim().slice(0, 160),
        description: String(item.description ?? "").trim().slice(0, 600),
        estimatedMinutes: Number(item.estimatedMinutes ?? 30),
        resources,
        subtopics,
      };
    })
    .filter((topic) => topic.title)
    .slice(0, 12);
}

function getRetryAfterSeconds(error: unknown): number {
  const maybeErr = error as {
    response?: { status?: number; headers?: { get?: (k: string) => string | null } };
    status?: number;
    retryAfter?: number;
  };
  if (typeof maybeErr.retryAfter === "number" && maybeErr.retryAfter > 0) {
    return maybeErr.retryAfter;
  }
  const headerRetry = parseInt(maybeErr.response?.headers?.get?.("Retry-After") || "0", 10);
  if (headerRetry > 0) return headerRetry;
  return 60;
}

function isRateLimitError(error: unknown): boolean {
  const maybeErr = error as {
    response?: { status?: number };
    status?: number;
    message?: string;
  };
  return (
    maybeErr.response?.status === 429 ||
    maybeErr.status === 429 ||
    maybeErr.message?.toLowerCase().includes("rate limit") === true
  );
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();

  const body = await req.json();
  const { subjectId, title, skillLevel, keywords } = body as {
    subjectId?: string;
    title?: string;
    skillLevel?: string;
    keywords?: string;
  };

  if (!subjectId || !title || !skillLevel || !keywords?.trim()) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const subject = await Subject.findOne({ _id: subjectId, userId });
  if (!subject) {
    return NextResponse.json({ error: "Subject not found." }, { status: 404 });
  }
  const existingCurriculum = await Curriculum.findOne({ subjectId, userId });
  if (existingCurriculum?.aiGenerated && (existingCurriculum.topics?.length || 0) > 0) {
    return NextResponse.json(
      { error: "AI curriculum already generated for this subject." },
      { status: 409 }
    );
  }

  const generationKey = `${subjectId}:${skillLevel}:${keywords.trim().toLowerCase()}`;
  if (inFlightGenerations.has(generationKey)) {
    return NextResponse.json(
      { error: "Generation already in progress for this input.", retryAfter: 5 },
      { status: 429 }
    );
  }

  inFlightGenerations.add(generationKey);

  try {
    const prompt = `You are a learning curriculum expert. Generate a structured learning curriculum as JSON.

Subject: "${title}"
Skill Level: ${skillLevel}
Keywords/Topics to cover: ${keywords}

Return ONLY a valid JSON object with this exact shape:
{
  "topics": [
    {
      "title": string,
      "description": string,
      "estimatedMinutes": number,
      "resources": [{ "title": string, "url": string, "type": "video"|"article"|"book"|"other" }],
      "subtopics": [{ "title": string, "done": false }]
    }
  ]
}

Constraints:
- topics length: 15-20 or end-to-end curriculum topics for the subject
- each topic needs 3-8 subtopics
- estimatedMinutes: 15-120
- resources: 2-4 high-quality links when possible
- no markdown, no explanation text, only JSON

Each topic object must have:
- title: string
- description: string (2-3 sentences)
- estimatedMinutes: number (15-120)
- resources: array of objects with { title: string, url: string, type: "video"|"article"|"book"|"other" }
- subtopics: array of objects with { title: string, done: false }`;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
    }

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'Return only machine-readable JSON with shape {"topics":[...]}. Do not include markdown.',
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!groqRes.ok) {
      const retryAfter = parseInt(groqRes.headers.get("Retry-After") || "0", 10);
      const errText = await groqRes.text();
      const err = new Error(errText) as Error & {
        response?: { status?: number; headers?: { get?: (k: string) => string | null } };
        status?: number;
        retryAfter?: number;
      };
      err.status = groqRes.status;
      err.retryAfter = retryAfter > 0 ? retryAfter : undefined;
      err.response = { status: groqRes.status, headers: { get: (k: string) => groqRes.headers.get(k) } };
      throw err;
    }

    const groqJson = (await groqRes.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const raw = groqJson.choices?.[0]?.message?.content || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as { topics?: unknown } | unknown[];
    const topics = normalizeTopics(Array.isArray(parsed) ? parsed : (parsed as { topics?: unknown })?.topics);
    if (!topics || topics.length === 0) {
      return NextResponse.json({ error: "Model returned an invalid curriculum payload." }, { status: 502 });
    }

    return NextResponse.json({ topics });
  } catch (error: unknown) {
    console.error("AI generation error:", error);

    if (isRateLimitError(error)) {
      return NextResponse.json(
        {
          error: "Groq API rate limit reached. Please try again shortly.",
          retryAfter: getRetryAfterSeconds(error),
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: "Failed to generate curriculum." }, { status: 500 });
  } finally {
    inFlightGenerations.delete(generationKey);
  }
}
