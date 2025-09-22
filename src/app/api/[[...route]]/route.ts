import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { handle } from "hono/vercel";
import { AuthController } from "./auth";
import { TestController } from "./test";

export const runtime = "nodejs";

const SESSION_COOKIE = "sid";

const app = new Hono()
  .basePath("/api")
  .use(async (c, next) => {
    const path = c.req.path;
    if (path === "/api/auth/login" || path === "/api/auth/signup") {
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
  .route("/auth", AuthController);

export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
