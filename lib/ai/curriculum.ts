import { log } from "@/lib/logger";
import { sanitizeResources, type ValidatedResource } from "@/lib/resource-validation";

import { DEFAULT_GROQ_MODEL, groqJsonCompletion } from "./groq";

export type GeneratedTopic = {
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
      const mappedResources: ValidatedResource[] = rawResources
        .map((resource) => {
          if (!resource || typeof resource !== "object") return null;
          const r = resource as Record<string, unknown>;
          const type = String(r.type || "article").toLowerCase();
          return {
            title: String(r.title || "").trim().slice(0, 120),
            url: String(r.url || "").trim().slice(0, 400),
            type: ["video", "article", "book", "other"].includes(type) ? type : "article",
          };
        })
        .filter((r): r is ValidatedResource => Boolean(r))
        .filter((r) => r.title || r.url)
        .slice(0, 12);

      const beforeSanitizing = mappedResources.length;
      const resources = sanitizeResources(mappedResources);
      if (beforeSanitizing > resources.length) {
        log.info("curriculum_resources_sanitized", {
          dropped: beforeSanitizing - resources.length,
        });
      }

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
        resources: resources as GeneratedTopic["resources"],
        subtopics,
      };
    })
    .filter((topic) => topic.title)
    .slice(0, 12);
}

export async function generateCurriculumTopics(input: {
  title: string;
  skillLevel: string;
  keywords: string;
}): Promise<GeneratedTopic[]> {
  const prompt = `You are a learning curriculum expert. Generate a structured learning curriculum as JSON.

Subject: "${input.title}"
Skill Level: ${input.skillLevel}
Keywords/Topics to cover: ${input.keywords}

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

  const parsed = await groqJsonCompletion<{ topics?: unknown } | unknown[]>({
    model: DEFAULT_GROQ_MODEL,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: 'Return only machine-readable JSON with shape {"topics":[...]}. Do not include markdown.',
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const topics = normalizeTopics(Array.isArray(parsed) ? parsed : parsed.topics);
  if (!topics || topics.length === 0) {
    throw new Error("Model returned an invalid curriculum payload.");
  }

  return topics;
}
