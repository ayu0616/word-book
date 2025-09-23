import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { z } from "zod";
import { AuthService } from "@/application/auth/service";
import { WordBookService } from "@/application/wordBook/service";
import { BcryptPasswordHasher } from "@/infrastructure/auth/passwordHasher.bcrypt";
import { DrizzleAuthRepository } from "@/infrastructure/auth/repository.drizzle";
import { DrizzleWordBookRepository } from "@/infrastructure/wordBook/repository.drizzle";
import { SESSION_COOKIE } from "@/lib/constants";

const repo = new DrizzleWordBookRepository();
const service = new WordBookService(repo);

const authRepo = new DrizzleAuthRepository();
const authHasher = new BcryptPasswordHasher();
const authService = new AuthService(authRepo, authHasher, 0); // Session TTL not relevant here

export const WordBookController = new Hono()
  .post(
    "/create",
    zValidator(
      "json",
      z.object({
        title: z.string().min(1).max(255),
      }),
    ),
    async (c) => {
      const sid = getCookie(c, SESSION_COOKIE);
      if (!sid) {
        return c.json({ ok: false, error: "unauthorized" }, 401);
      }

      const me = await authService.me(sid);
      if (!me.ok || !me.user) {
        return c.json({ ok: false, error: "unauthorized" }, 401);
      }

      const { title } = c.req.valid("json");
      const wordBook = await service.create({
        userId: me.user.id,
        title,
      });
      return c.json({ ok: true, wordBook }, 201);
    },
  )
  .get("/list", async (c) => {
    const sid = getCookie(c, SESSION_COOKIE);
    if (!sid) {
      return c.json({ ok: false, error: "unauthorized" }, 401);
    }

    const me = await authService.me(sid);
    if (!me.ok || !me.user) {
      return c.json({ ok: false, error: "unauthorized" }, 401);
    }

    const wordBooks = await service.findWordBooksByUserId(me.user.id);
    return c.json({ ok: true, wordBooks }, 200);
  })
  .get("/get/:id", async (c) => {
    const sid = getCookie(c, SESSION_COOKIE);
    if (!sid) {
      return c.json({ ok: false, error: "unauthorized" }, 401);
    }

    const me = await authService.me(sid);
    if (!me.ok || !me.user) {
      return c.json({ ok: false, error: "unauthorized" }, 401);
    }

    const id = Number.parseInt(c.req.param("id"), 10);
    if (Number.isNaN(id)) {
      return c.json({ ok: false, error: "invalid_id" }, 400);
    }

    const wordBook = await service.findWordBookById(id);
    if (!wordBook || wordBook.userId !== me.user.id) {
      return c.json({ ok: false, error: "word_book_not_found" }, 404);
    }

    return c.json({ ok: true, wordBook }, 200);
  })
  .delete(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().transform(Number),
      }),
    ),
    async (c) => {
      const sid = getCookie(c, SESSION_COOKIE);
      if (!sid) {
        return c.json({ ok: false, error: "unauthorized" }, 401);
      }

      const me = await authService.me(sid);
      if (!me.ok || !me.user) {
        return c.json({ ok: false, error: "unauthorized" }, 401);
      }

      const { id } = c.req.valid("param");

      const existingWordBook = await service.findWordBookById(id);
      if (!existingWordBook) {
        return c.json({ ok: false, error: "word_book_not_found" }, 404);
      }

      if (existingWordBook.userId !== me.user.id) {
        return c.json({ ok: false, error: "unauthorized" }, 401);
      }

      await service.deleteWordBook(id);
      return c.json(
        { ok: true, message: "Word book deleted successfully" },
        200,
      );
    },
  );
