import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { z } from "zod";
import { AuthService } from "@/application/auth/service";
import { WordService } from "@/application/word/service";
import { WordBookService } from "@/application/wordBook/service";
import { BcryptPasswordHasher } from "@/infrastructure/auth/passwordHasher.bcrypt";
import { DrizzleAuthRepository } from "@/infrastructure/auth/repository.drizzle";
import { DrizzleWordRepository } from "@/infrastructure/word/repository.drizzle";
import { DrizzleWordBookRepository } from "@/infrastructure/wordBook/repository.drizzle";
import { SESSION_COOKIE } from "@/lib/constants";

const wordRepo = new DrizzleWordRepository();
const wordService = new WordService(wordRepo);

const authRepo = new DrizzleAuthRepository();
const authHasher = new BcryptPasswordHasher();
const authService = new AuthService(authRepo, authHasher, 0); // Session TTL not relevant here

const wordBookRepo = new DrizzleWordBookRepository();
const wordBookService = new WordBookService(wordBookRepo);

export const WordController = new Hono()
  .post(
    "/create",
    zValidator(
      "json",
      z.object({
        wordBookId: z.number(),
        term: z.string().min(1).max(255),
        meaning: z.string().min(1),
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

      const { wordBookId, term, meaning } = c.req.valid("json");

      const wordBook = await wordBookService.findWordBookById(wordBookId);
      if (!wordBook || wordBook.userId !== me.user.id) {
        return c.json({ ok: false, error: "word_book_not_found" }, 400);
      }

      const word = await wordService.createWord({ wordBookId, term, meaning });
      return c.json({ ok: true, word }, 201);
    },
  )
  .get("/list/:wordBookId", async (c) => {
    const sid = getCookie(c, SESSION_COOKIE);
    if (!sid) {
      return c.json({ ok: false, error: "unauthorized" }, 401);
    }

    const me = await authService.me(sid);
    if (!me.ok || !me.user) {
      return c.json({ ok: false, error: "unauthorized" }, 401);
    }

    const wordBookId = Number(c.req.param("wordBookId"));
    if (Number.isNaN(wordBookId)) {
      return c.json({ ok: false, error: "invalid_word_book_id" }, 400);
    }

    const wordBook = await wordBookService.findWordBookById(wordBookId);
    if (!wordBook || wordBook.userId !== me.user.id) {
      return c.json({ ok: false, error: "word_book_not_found" }, 404);
    }

    const words = await wordService.findWordsByWordBookId(wordBookId);
    return c.json({ ok: true, words }, 200);
  });
