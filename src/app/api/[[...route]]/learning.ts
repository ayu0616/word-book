import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { z } from "zod";
import { LearningRecordService } from "@/application/learningRecord/service";
import { DrizzleLearningRecordRepository } from "@/infrastructure/learningRecord/repository.drizzle";
import { DrizzleWordRepository } from "@/infrastructure/word/repository.drizzle";

const learningRecordRepository = new DrizzleLearningRecordRepository();
const wordRepository = new DrizzleWordRepository();
const learningRecordService = new LearningRecordService(
  learningRecordRepository,
  wordRepository,
);

export const LearningController = new Hono()
  .get(
    "/word-book/:wordBookId",
    zValidator(
      "param",
      z.object({
        wordBookId: z.string().transform(Number),
      }),
    ),
    async (c) => {
      const { wordBookId } = c.req.valid("param");
      const wordsToLearn =
        await learningRecordService.getWordsToLearn(wordBookId);
      return c.json(wordsToLearn);
    },
  )
  .post(
    "/record",
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

export const GET = handle(LearningController);
export const POST = handle(LearningController);
