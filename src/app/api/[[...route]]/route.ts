import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { handle } from "hono/vercel";
import { SESSION_COOKIE } from "@/lib/constants";
import { AuthController } from "./auth";
import { learningRoutes } from "./learning";
import { TestController } from "./test";
import { WordController } from "./word";
import { WordBookController } from "./wordBook";

export const runtime = "nodejs";

const app = new Hono()
  .basePath("/api")
  .use(async (c, next) => {
    const path = c.req.path;
    if (
      path === "/api/auth/login" ||
      path === "/api/auth/signup" ||
      path === "/api/word/create" ||
      path === "/api/wordBook/create" ||
      path === "/api/wordBook/list" ||
      path.startsWith("/api/wordBook/get/") ||
      path.startsWith("/api/word/list/") ||
      path.startsWith("/api/learning/word-book/") ||
      path === "/api/learning/record"
    ) {
      await next();
      return;
    }

    const sid = getCookie(c, SESSION_COOKIE);
    if (!sid) {
      return c.json({ ok: false, error: "unauthorized" }, 401);
    }
    await next();
  })
  .route("/test", TestController)
  .route("/auth", AuthController)
  .route("/word", WordController)
  .route("/wordBook", WordBookController)
  .route("/learning", learningRoutes);

export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
