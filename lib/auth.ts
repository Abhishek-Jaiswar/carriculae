import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";
import { Session } from "@/lib/models/Session";

export const SESSION_COOKIE_NAME = "curriculam_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  await connectDB();
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await Session.create({ userId, tokenHash, expiresAt });
  return { token, expiresAt };
}

export async function deleteSessionByToken(token: string) {
  await connectDB();
  await Session.deleteOne({ tokenHash: hashToken(token) });
}

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  await connectDB();
  const session = await Session.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });

  return session?.userId || null;
}

export async function getUserIdFromServerCookies(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  await connectDB();
  const session = await Session.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });

  return session?.userId || null;
}
