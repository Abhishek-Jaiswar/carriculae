import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "curriculam_session";
const AUTH_ROUTES = new Set(["/login", "/signup"]);
const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  if (!hasSession && !PUBLIC_ROUTES.has(pathname)) {
    const loginUrl = new URL("/login", req.url);
    const nextPath = `${pathname}${search}`;
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && (isAuthRoute || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
