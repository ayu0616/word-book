import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";
import { LearningRecordService } from "@/application/learningRecord/service";
import { DrizzleLearningRecordRepository } from "@/infrastructure/learningRecord/repository.drizzle";

const app = new Hono().basePath("/api");

const learningRecordService = new LearningRecordService(
  new DrizzleLearningRecordRepository(),
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
      const learningRecord = await learningRecordService.recordLearningResult({
        wordId,
        result,
      });
      return c.json(learningRecord);
    },
  );

export const GET = handle(learningRoutes);
export const POST = handle(learningRoutes);
