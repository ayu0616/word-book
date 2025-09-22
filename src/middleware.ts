import assert from "node:assert";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { NextRequest, NextResponse } from "next/server";

const app = new Hono().use("*", async (c) => {
  assert(c.req.raw instanceof NextRequest);
  return NextResponse.next();
});

export const middleware = handle(app);
