import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";
import { LearningRecordService } from "@/application/learningRecord/service";
import { DrizzleLearningRecordRepository } from "@/infrastructure/learningRecord/repository.drizzle";
import { DrizzleWordRepository } from "@/infrastructure/word/repository.drizzle";

const app = new Hono().basePath("/api");

const learningRecordRepository = new DrizzleLearningRecordRepository();
const wordRepository = new DrizzleWordRepository();
const learningRecordService = new LearningRecordService(
  learningRecordRepository,
  wordRepository,
);

export const learningRoutes = app
  .get(
    "/learning/word-book/:wordBookId",
    zValidator(
      "param",
      z.object({
        wordBookId: z.string().transform(Number),
      }),
    ),
    zValidator(
      "query",
      z.object({
        limit: z.string().transform(Number).optional().default(1),
      }),
    ),
    async (c) => {
      const { wordBookId } = c.req.valid("param");
      const { limit } = c.req.valid("query");
      const wordsToLearn = await learningRecordService.getWordsToLearn(
        wordBookId,
        limit,
      );
      return c.json(wordsToLearn);
    },
  )
  .post(
    "/learning/record",
    zValidator(
      "json",
      z.object({
        wordId: z.number(),
        result: z.enum(["correct", "incorrect"]),
      }),
    ),
    async (c) => {
      const { wordId, result } = c.req.valid("json");
      await learningRecordService.recordLearningResult({
        wordId,
        result,
      });
      return c.json({ message: "Learning record updated" });
    },
  );

export const GET = handle(learningRoutes);
export const POST = handle(learningRoutes);
