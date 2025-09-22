import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import { AuthService } from "@/application/auth/service";
import { BcryptPasswordHasher } from "@/infrastructure/auth/passwordHasher.bcrypt";
import { DrizzleAuthRepository } from "@/infrastructure/auth/repository.drizzle";

const SESSION_COOKIE = "sid";
const SESSION_TTL_HOURS = 24 * 7;
const repo = new DrizzleAuthRepository();
const hasher = new BcryptPasswordHasher();
const service = new AuthService(repo, hasher, SESSION_TTL_HOURS * 3600 * 1000);

export const AuthController = new Hono()
  .post(
    "/signup",
    zValidator(
      "json",
      z.object({
        email: z.string().email(),
        name: z.string().min(1).max(255).optional(),
        password: z.string().min(8).max(128),
      }),
    ),
    async (c) => {
      try {
        const { email, name, password } = c.req.valid("json");
        const result = await service.signup({ email, password, name });
        if (!result.ok) return c.json(result, 400);
        setCookie(c, SESSION_COOKIE, result.sessionId, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: true,
          expires: result.expiresAt,
        });
        return c.json(result, 200);
      } catch (_error) {
        return c.json({ ok: false, error: "internal_error" }, 500);
      }
    },
  )
  .post(
    "/login",
    zValidator(
      "json",
      z.object({
        email: z.string().email(),
        password: z.string().min(8).max(128),
      }),
    ),
    async (c) => {
      try {
        const { email, password } = c.req.valid("json");
        const result = await service.login({ email, password });
        if (!result.ok) return c.json(result, 401);
        setCookie(c, SESSION_COOKIE, result.sessionId, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: true,
          expires: result.expiresAt,
        });
        return c.json(result, 200);
      } catch (_error) {
        return c.json({ ok: false, error: "internal_error" }, 500);
      }
    },
  )
  .post("/logout", async (c) => {
    try {
      const sid = getCookie(c, SESSION_COOKIE);
      if (sid) await service.logout(sid);
      deleteCookie(c, SESSION_COOKIE, { path: "/" });
      return c.json({ ok: true }, 200);
    } catch (_error) {
      return c.json({ ok: false, error: "internal_error" }, 500);
    }
  })
  .get("/me", async (c) => {
    try {
      const sid = getCookie(c, SESSION_COOKIE);
      const result = await service.me(sid ?? null);
      return c.json(result, 200);
    } catch (_error) {
      return c.json({ ok: false, error: "internal_error" }, 500);
    }
  });
