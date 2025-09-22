import { Hono } from "hono";

export const TestController = new Hono().get("/", (c) => c.json({ ok: true }));
