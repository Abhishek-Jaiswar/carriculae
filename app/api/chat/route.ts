import { NextRequest, NextResponse } from "next/server";

import { createChatResponseStream, type ChatTurn } from "@/lib/ai/chat";
import { getRetryAfterSeconds, isGroqRateLimitError } from "@/lib/ai/groq";
import { getUserIdFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { log } from "@/lib/logger";
import { Subject } from "@/lib/models/Subject";
import { rateLimitCheck } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimitCheck(`chat:${userId}`, 40, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many chat requests. Please wait and try again.", retryAfter: rl.retryAfterSec },
      { status: 429 }
    );
  }

  try {
    await connectDB();

    const body = (await req.json()) as {
      subjectId?: string;
      messages?: Array<{ role?: string; content?: string }>;
    };

    const turns = Array.isArray(body.messages)
      ? body.messages
          .map((message) => ({
            role: message.role === "assistant" ? "assistant" : "user",
            content: String(message.content || ""),
          }))
          .filter((message): message is ChatTurn => Boolean(message.content.trim()))
      : [];

    if (!turns.length || turns[turns.length - 1]?.role !== "user") {
      return NextResponse.json({ error: "A user message is required." }, { status: 400 });
    }

    let subjectContext:
      | {
          title: string;
          description?: string;
          skillLevel?: string;
          tags?: string[];
        }
      | undefined;

    if (body.subjectId) {
      const subject = await Subject.findOne({ _id: body.subjectId, userId }).lean<{
        title: string;
        description?: string;
        skillLevel?: string;
        tags?: string[];
      } | null>();

      if (!subject) {
        return NextResponse.json({ error: "Subject not found." }, { status: 404 });
      }

      subjectContext = {
        title: subject.title,
        description: subject.description,
        skillLevel: subject.skillLevel,
        tags: subject.tags || [],
      };
    }

    const stream = await createChatResponseStream({
      messages: turns,
      subject: subjectContext,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error: unknown) {
    log.error("chat_stream_failed", {
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

    return NextResponse.json({ error: "Failed to create AI chat response." }, { status: 500 });
  }
}
