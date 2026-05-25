/**
 * Validate and optionally restrict resource URLs from AI or user input.
 */

function parseAllowlist(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase().replace(/^www\./, ""))
    .filter(Boolean);
}

function hostnameOf(url: string): string | null {
  try {
    const u = new URL(url);
    return u.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export type ValidatedResource = {
  title: string;
  url: string;
  type: string;
};

/**
 * Returns null if the URL is unsafe or invalid; otherwise returns normalized https URL string.
 */
export function validateResourceUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  let urlStr = trimmed;
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = `https://${urlStr}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(host)
  ) {
    return null;
  }

  const allow = parseAllowlist(process.env.RESOURCE_URL_ALLOWLIST);
  if (allow.length > 0) {
    const hn = hostnameOf(parsed.toString());
    if (!hn || !allow.some((a) => hn === a || hn.endsWith(`.${a}`))) {
      return null;
    }
  }

  return parsed.toString().slice(0, 400);
}

export function sanitizeResources(
  resources: ValidatedResource[],
  logStripped = false
): ValidatedResource[] {
  const out: ValidatedResource[] = [];
  for (const r of resources) {
    const url = validateResourceUrl(r.url);
    if (!url) {
      if (logStripped && r.url?.trim()) {
        // Caller may log aggregate counts
      }
      continue;
    }
    out.push({
      title: r.title.slice(0, 120),
      url,
      type: r.type,
    });
    if (out.length >= 8) break;
  }
  return out;
}
