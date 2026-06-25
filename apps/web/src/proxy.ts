import { NextResponse, type NextRequest } from "next/server";

const CALLBACK_COOKIE = "matchmaker_callback_url";
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export function proxy(request: NextRequest) {
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) =>
    request.cookies.has(name),
  );

  if (hasSessionCookie) return NextResponse.next();

  const callbackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("callbackUrl", callbackUrl);

  const response = NextResponse.redirect(signInUrl);
  response.cookies.set(CALLBACK_COOKIE, callbackUrl, {
    httpOnly: true,
    maxAge: 60 * 30,
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  });
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/discover/:path*",
    "/hub/:path*",
    "/invitations/:path*",
    "/profile/:path*",
    "/projects/:path*",
  ],
};
