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

export const WordController = new Hono().post(
  "/create",
  zValidator(
    "json",
    z.object({
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

    const userWordBooks = await wordBookService.findWordBooksByUserId(
      me.user.id,
    );
    if (userWordBooks.length === 0) {
      return c.json({ ok: false, error: "no_word_books_found" }, 400);
    }

    const wordBookId = userWordBooks[0].id; // Use the first word book found

    const { term, meaning } = c.req.valid("json");
    const word = await wordService.createWord({ wordBookId, term, meaning });
    return c.json({ ok: true, word }, 201);
  },
);
