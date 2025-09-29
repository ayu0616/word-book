import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { handle } from "hono/vercel";
import { z } from "zod";
import { AuthService } from "@/application/auth/service";
import { WordService } from "@/application/word/service";
import { WordBookService } from "@/application/wordBook/service";
import { Meaning } from "@/domain/word/value-objects/Meaning";
import { Term } from "@/domain/word/value-objects/Term";
import { WordBookId } from "@/domain/word/value-objects/WordBookId";
import { WordId } from "@/domain/word/value-objects/WordId";
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

      const createdWord = await wordService.createWord({
        wordBookId: WordBookId.create(wordBookId),
        term: Term.create(term),
        meaning: Meaning.create(meaning),
      });
      return c.json(
        {
          ok: true,
          word: {
            id: createdWord.id?.value,
            wordBookId: createdWord.wordBookId.value,
            term: createdWord.term.value,
            meaning: createdWord.meaning.value,
            createdAt: createdWord.createdAt.value,
            consecutiveCorrectCount: createdWord.consecutiveCorrectCount,
            nextReviewDate: createdWord.nextReviewDate.value,
          },
        },
        201,
      );
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

    const words = await wordService.findWordsByWordBookId(
      WordBookId.create(wordBookId),
    );
    return c.json(
      {
        ok: true,
        words: words.map((word) => word.toJson()),
      },
      200,
    );
  })
  .put(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.cuid2(),
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

      const existingWord = await wordService.findById(WordId.from(id));
      if (!existingWord) {
        return c.json({ ok: false, error: "word_not_found" }, 404);
      }

      const wordBook = await wordBookService.findWordBookById(
        existingWord.wordBookId.value,
      );
      if (!wordBook || wordBook.userId !== me.user.id) {
        return c.json({ ok: false, error: "unauthorized" }, 401);
      }

      const updatedWord = await wordService.updateWord({
        id: WordId.from(id),
        term: Term.create(term),
        meaning: Meaning.create(meaning),
      });
      return c.json(
        {
          ok: true,
          word: {
            id: updatedWord.id?.value,
            wordBookId: updatedWord.wordBookId.value,
            term: updatedWord.term.value,
            meaning: updatedWord.meaning.value,
            createdAt: updatedWord.createdAt.value,
            consecutiveCorrectCount: updatedWord.consecutiveCorrectCount,
            nextReviewDate: updatedWord.nextReviewDate.value,
          },
        },
        200,
      );
    },
  )
  .delete(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.cuid2(),
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

      const existingWord = await wordService.findById(WordId.from(id));
      if (!existingWord) {
        return c.json({ ok: false, error: "word_not_found" }, 404);
      }

      const wordBook = await wordBookService.findWordBookById(
        existingWord.wordBookId.value,
      );
      if (!wordBook || wordBook.userId !== me.user.id) {
        return c.json({ ok: false, error: "unauthorized" }, 401);
      }

      await wordService.deleteWord(WordId.from(id));
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
          WordBookId.create(wordBookId),
          csvContent,
        );
        return c.json(
          {
            ok: true,
            importedWords: importedWords.map((word) => ({
              id: word.id?.value,
              wordBookId: word.wordBookId.value,
              term: word.term.value,
              meaning: word.meaning.value,
              createdAt: word.createdAt.value,
              consecutiveCorrectCount: word.consecutiveCorrectCount,
              nextReviewDate: word.nextReviewDate.value,
            })),
          },
          201,
        );
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

export const GET = handle(WordController);
export const POST = handle(WordController);
