import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { GUEST_USER_ID } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { Curriculum } from "@/lib/models/Curriculum";
import { Subject } from "@/lib/models/Subject";
import { User } from "@/lib/models/User";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL_NAME = "gemini-2.0-flash";

const inFlightGenerations = new Set<string>();

type GeneratedTopic = {
  title: string;
  description: string;
  estimatedMinutes: number;
  resources: unknown[];
};

function normalizeTopics(parsed: unknown): GeneratedTopic[] | null {
  if (!Array.isArray(parsed)) return null;

  return parsed
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item) => ({
      title: String(item.title ?? "Untitled Topic"),
      description: String(item.description ?? ""),
      estimatedMinutes: Number(item.estimatedMinutes ?? 30),
      resources: Array.isArray(item.resources) ? item.resources : [],
    }))
    .slice(0, 12);
}

function getRetryAfterSeconds(error: unknown): number {
  const maybeErr = error as {
    response?: { status?: number; headers?: { get?: (k: string) => string | null } };
    status?: number;
  };
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

  const generationKey = `${subjectId}:${skillLevel}:${keywords.trim().toLowerCase()}`;
  if (inFlightGenerations.has(generationKey)) {
    return NextResponse.json(
      { error: "Generation already in progress for this input.", retryAfter: 5 },
      { status: 429 }
    );
  }

  inFlightGenerations.add(generationKey);

  try {
    const prompt = `You are a learning curriculum expert. Generate a structured learning curriculum as a JSON array.

Subject: "${title}"
Skill Level: ${skillLevel}
Keywords/Topics to cover: ${keywords}

Return ONLY a valid JSON array of 8-12 topic objects, no explanation, no markdown, just raw JSON.
Each topic object must have:
- title: string
- description: string (2-3 sentences)
- estimatedMinutes: number (15-120)
- resources: array of 2-3 objects with { title: string, url: string, type: "video"|"article"|"book" }`;

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const cleaned = raw.replace(/```json|```/g, "").trim();

    const topics = normalizeTopics(JSON.parse(cleaned));
    if (!topics || topics.length === 0) {
      return NextResponse.json({ error: "Model returned an invalid curriculum payload." }, { status: 502 });
    }

    const updatedCurriculum = await Curriculum.findOneAndUpdate(
      { subjectId },
      {
        aiGenerated: true,
        topics: topics.map((t, i) => ({
          title: t.title,
          description: t.description,
          estimatedMinutes: t.estimatedMinutes || 30,
          resources: t.resources || [],
          order: i,
          status: "todo",
        })),
      },
      { returnDocument: "after", upsert: true }
    );

    await Subject.findByIdAndUpdate(subjectId, {
      totalTopics: topics.length,
      completedTopics: 0,
    });

    await User.findOneAndUpdate(
      { userId: GUEST_USER_ID },
      { $addToSet: { achievements: "ai_explorer" } },
      { upsert: true }
    );

    return NextResponse.json({ curriculum: updatedCurriculum, topics });
  } catch (error: unknown) {
    console.error("AI generation error:", error);

    if (isRateLimitError(error)) {
      return NextResponse.json(
        {
          error: "Gemini API rate limit reached. Please try again shortly.",
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
