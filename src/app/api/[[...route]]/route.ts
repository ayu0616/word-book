import { Hono } from "hono";
import { handle } from "hono/vercel";
import { AuthController } from "./auth";
import { TestController } from "./test";

export const runtime = "nodejs";

const app = new Hono()
  .basePath("/api")
  .route("/test", TestController)
  .route("/auth", AuthController);

export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
