import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { createSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { hashPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim();
  const password = String(body.password || "");

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const user = await User.create({
    userId: randomUUID(),
    email,
    passwordHash: hashPassword(password),
    name: name.slice(0, 60),
  });

  const { token, expiresAt } = await createSession(user.userId);
  const res = NextResponse.json({
    user: { userId: user.userId, email: user.email, name: user.name },
  });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return res;
}
