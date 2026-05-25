const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

export type GroqMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export class GroqApiError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = "GroqApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

function cleanJsonContent(content: string) {
  return content.replace(/```json|```/g, "").trim();
}

export async function groqJsonCompletion<T>(input: {
  messages: GroqMessage[];
  model?: string;
  temperature?: number;
}): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: input.model || DEFAULT_GROQ_MODEL,
      temperature: input.temperature ?? 0.3,
      response_format: { type: "json_object" },
      messages: input.messages,
    }),
  });

  if (!res.ok) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "0", 10);
    const errorText = await res.text();
    throw new GroqApiError(
      errorText || `Groq request failed (${res.status}).`,
      res.status,
      retryAfter > 0 ? retryAfter : undefined
    );
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const rawContent = json.choices?.[0]?.message?.content || "";

  return JSON.parse(cleanJsonContent(rawContent)) as T;
}

export async function groqTextStream(input: {
  messages: GroqMessage[];
  model?: string;
  temperature?: number;
}): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: input.model || DEFAULT_GROQ_MODEL,
      temperature: input.temperature ?? 0.5,
      stream: true,
      messages: input.messages,
    }),
  });

  if (!res.ok) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "0", 10);
    const errorText = await res.text();
    throw new GroqApiError(
      errorText || `Groq request failed (${res.status}).`,
      res.status,
      retryAfter > 0 ? retryAfter : undefined
    );
  }

  if (!res.body) {
    throw new Error("Groq streaming response did not include a body.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  function extractContent(line: string) {
    if (!line.startsWith("data:")) return null;

    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") return null;

    try {
      const parsed = JSON.parse(payload) as {
        choices?: Array<{ delta?: { content?: string | null } }>;
      };
      return parsed.choices?.[0]?.delta?.content || null;
    } catch {
      return null;
    }
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const rawLine of lines) {
            const content = extractContent(rawLine.trim());
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        }

        const trailingContent = extractContent(buffer.trim());
        if (trailingContent) {
          controller.enqueue(encoder.encode(trailingContent));
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

export function getRetryAfterSeconds(error: unknown): number {
  if (error instanceof GroqApiError && typeof error.retryAfter === "number" && error.retryAfter > 0) {
    return error.retryAfter;
  }

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

export function isGroqRateLimitError(error: unknown): boolean {
  if (error instanceof GroqApiError) {
    return error.status === 429 || error.message.toLowerCase().includes("rate limit");
  }

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
