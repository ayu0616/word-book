import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { handle } from "hono/vercel";
import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "./lib/constants";

const PUBLIC_PATHS = ["/login", "/signup"];

const app = new Hono().use("*", async (c) => {
  const sessionCookie = getCookie(c, SESSION_COOKIE);
  const isAuthenticated = !!sessionCookie;
  const path = c.req.path;

  // APIの場合はAPI側で認証するのでスルー
  if (path.startsWith("/api")) {
    return NextResponse.next();
  }

  // _next/ はスルー
  if (path.startsWith("/_next")) {
    return NextResponse.next();
  }

  // If trying to access a public path while authenticated, redirect to home
  if (PUBLIC_PATHS.includes(path)) {
    if (isAuthenticated) {
      return c.redirect(new URL("/", c.req.url));
    }
    return NextResponse.next();
  }

  // If trying to access a protected path while unauthenticated, redirect to login
  if (!isAuthenticated) {
    return c.redirect(new URL("/login", c.req.url));
  }

  return NextResponse.next();
});

export const middleware = handle(app);
