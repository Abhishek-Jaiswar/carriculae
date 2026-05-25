/**
 * Simple in-memory sliding-window rate limiter per key (e.g. userId + route).
 * For production at scale, replace with Redis or edge rate limiting.
 */

const buckets = new Map<string, number[]>();

function prune(now: number, timestamps: number[], windowMs: number) {
  const cutoff = now - windowMs;
  return timestamps.filter((t) => t > cutoff);
}

export function rateLimitCheck(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): { ok: true } | { ok: false; retryAfterSec: number } {
  const prev = buckets.get(key) || [];
  const current = prune(now, prev, windowMs);
  if (current.length >= limit) {
    const oldest = Math.min(...current);
    const retryAfterMs = Math.max(0, windowMs - (now - oldest));
    return { ok: false, retryAfterSec: Math.ceil(retryAfterMs / 1000) || 1 };
  }
  current.push(now);
  buckets.set(key, current);
  return { ok: true };
}
