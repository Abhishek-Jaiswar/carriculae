import { NextRequest, NextResponse } from "next/server";

import { generateCurriculumTopics } from "@/lib/ai/curriculum";
import { getRetryAfterSeconds, isGroqRateLimitError } from "@/lib/ai/groq";
import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Curriculum } from "@/lib/models/Curriculum";
import { Subject } from "@/lib/models/Subject";
import { log } from "@/lib/logger";
import { rateLimitCheck } from "@/lib/rate-limit";

const inFlightGenerations = new Set<string>();

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

  const limit = rateLimitCheck(`generate:${userId}`, 15, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many curriculum generations. Please wait and try again.", retryAfter: limit.retryAfterSec },
      { status: 429 }
    );
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
    const topics = await generateCurriculumTopics({
      title,
      skillLevel,
      keywords,
    });

    return NextResponse.json({ topics });
  } catch (error: unknown) {
    log.error("ai_generation_failed", {
      message: error instanceof Error ? error.message : String(error),
    });

    if (isGroqRateLimitError(error)) {
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
