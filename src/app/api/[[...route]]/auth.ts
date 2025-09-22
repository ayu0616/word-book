import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/utils";

const SESSION_COOKIE = "sid";
const SESSION_TTL_HOURS = 24 * 7;

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
      const { email, name, password } = c.req.valid("json");
      const exists = await db.query.users.findFirst({
        where: (t, { eq }) => eq(t.email, email),
      });
      if (exists) return c.json({ ok: false, error: "email_exists" }, 400);
      const passwordHash = hashPassword(password);
      const [user] = await db
        .insert(users)
        .values({ email, name, passwordHash })
        .returning();
      const sid = createId();
      const expires = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000);
      await db
        .insert(sessions)
        .values({ id: sid, userId: user.id, expiresAt: expires });
      setCookie(c, SESSION_COOKIE, sid, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        expires,
      });
      return c.json({
        ok: true,
        user: { id: user.id, email: user.email, name: user.name },
      });
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
      const { email, password } = c.req.valid("json");
      const user = await db.query.users.findFirst({
        where: (t, { eq }) => eq(t.email, email),
      });
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return c.json({ ok: false, error: "invalid_credentials" }, 401);
      }
      const sid = createId();
      const expires = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000);
      await db
        .insert(sessions)
        .values({ id: sid, userId: user.id, expiresAt: expires });
      setCookie(c, SESSION_COOKIE, sid, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        expires,
      });
      return c.json({
        ok: true,
        user: { id: user.id, email: user.email, name: user.name },
      });
    },
  )
  .post("/logout", async (c) => {
    const sid = getCookie(c, SESSION_COOKIE);
    if (sid) {
      await db.delete(sessions).where(eq(sessions.id, sid));
      deleteCookie(c, SESSION_COOKIE, { path: "/" });
    }
    return c.json({ ok: true });
  })
  .get("/me", async (c) => {
    const sid = getCookie(c, SESSION_COOKIE);
    if (!sid) return c.json({ ok: false, user: null }, 200);
    const row = await db.query.sessions.findFirst({
      where: (t, { eq }) => eq(t.id, sid),
      with: {},
    });
    if (!row || row.expiresAt.getTime() < Date.now()) {
      if (row) await db.delete(sessions).where(eq(sessions.id, row.id));
      deleteCookie(c, SESSION_COOKIE, { path: "/" });
      return c.json({ ok: false, user: null }, 200);
    }
    const user = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.id, row.userId),
    });
    if (!user) return c.json({ ok: false, user: null }, 200);
    return c.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  });
