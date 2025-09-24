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
  })
  .put(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().transform(Number),
      }),
    ),
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

      const { id } = c.req.valid("param");
      const { term, meaning } = c.req.valid("json");

      const existingWord = await wordService.findById(id);
      if (!existingWord) {
        return c.json({ ok: false, error: "word_not_found" }, 404);
      }

      const wordBook = await wordBookService.findWordBookById(
        existingWord.wordBookId,
      );
      if (!wordBook || wordBook.userId !== me.user.id) {
        return c.json({ ok: false, error: "unauthorized" }, 401);
      }

      const updatedWord = await wordService.updateWord({ id, term, meaning });
      return c.json({ ok: true, word: updatedWord }, 200);
    },
  )
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

      const existingWord = await wordService.findById(id);
      if (!existingWord) {
        return c.json({ ok: false, error: "word_not_found" }, 404);
      }

      const wordBook = await wordBookService.findWordBookById(
        existingWord.wordBookId,
      );
      if (!wordBook || wordBook.userId !== me.user.id) {
        return c.json({ ok: false, error: "unauthorized" }, 401);
      }

      await wordService.deleteWord(id);
      return c.json({ ok: true, message: "Word deleted successfully" }, 200);
    },
  )
  .post(
    "/import",
    zValidator(
      "json",
      z.object({
        wordBookId: z.string().transform(Number),
        csvContent: z.string(),
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

      const { wordBookId, csvContent } = c.req.valid("json");

      const wordBook = await wordBookService.findWordBookById(wordBookId);
      if (!wordBook || wordBook.userId !== me.user.id) {
        return c.json({ ok: false, error: "word_book_not_found" }, 400);
      }

      try {
        const importedWords = await wordService.importWordsFromCsv(
          wordBookId,
          csvContent,
        );
        return c.json({ ok: true, importedWords }, 201);
      } catch (e: unknown) {
        return c.json(
          {
            ok: false,
            error:
              (e instanceof Error ? e.message : "不明なエラー") ||
              "CSVインポートエラー",
          },
          400,
        );
      }
    },
  );
