import { Hono } from "hono";
import { handle } from "hono/vercel";
import { TestController } from "./test";

export const runtime = "nodejs";

const app = new Hono().basePath("/api").route("/test", TestController);

export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
