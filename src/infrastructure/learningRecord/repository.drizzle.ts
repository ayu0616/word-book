import { eq } from "drizzle-orm";
import type { LearningRecordRepository } from "@/application/learningRecord/ports";
import { db } from "@/db";
import { learningRecords, words } from "@/db/schema";
import { LearningRecord } from "@/domain/learningRecord/entities";

export class DrizzleLearningRecordRepository
  implements LearningRecordRepository
{
  async create(params: {
    wordId: number;
    result: "correct" | "incorrect";
  }): Promise<LearningRecord> {
    const [row] = await db
      .insert(learningRecords)
      .values({
        wordId: params.wordId,
        result: params.result,
        consecutiveCorrectCount: 0,
        nextReviewDate: new Date(),
      })
      .returning();

    return new LearningRecord({
      id: row.id,
      wordId: row.wordId,
      recordDate: row.recordDate,
      result: row.result,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      consecutiveCorrectCount: row.consecutiveCorrectCount,
      nextReviewDate: row.nextReviewDate,
    });
  }

  async findByWordId(wordId: number): Promise<LearningRecord[]> {
    const rows = await db.query.learningRecords.findMany({
      where: (t, { eq }) => eq(t.wordId, wordId),
    });

    return rows.map(
      (row) =>
        new LearningRecord({
          id: row.id,
          wordId: row.wordId,
          recordDate: row.recordDate,
          result: row.result,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          consecutiveCorrectCount: row.consecutiveCorrectCount,
          nextReviewDate: row.nextReviewDate,
        }),
    );
  }

  async update(learningRecord: LearningRecord): Promise<LearningRecord> {
    const [row] = await db
      .update(learningRecords)
      .set({
        result: learningRecord.result as "correct" | "incorrect",
        consecutiveCorrectCount: learningRecord.consecutiveCorrectCount,
        nextReviewDate: learningRecord.nextReviewDate,
        updatedAt: new Date(),
      })
      .where(eq(learningRecords.id, learningRecord.id))
      .returning();

    return new LearningRecord({
      id: row.id,
      wordId: row.wordId,
      recordDate: row.recordDate,
      result: row.result,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      consecutiveCorrectCount: row.consecutiveCorrectCount,
      nextReviewDate: row.nextReviewDate,
    });
  }

  async findWordsToLearn(
    wordBookId: number,
    limit: number,
  ): Promise<
    { learningRecord: LearningRecord; word: typeof words.$inferSelect }[]
  > {
    const rows = await db.query.learningRecords.findMany({
      where: (t, { eq, and, lt }) =>
        and(eq(words.wordBookId, wordBookId), lt(t.nextReviewDate, new Date())),
      limit,
      with: {
        word: true,
      },
    });

    return rows.map((row) => ({
      learningRecord: new LearningRecord({
        id: row.id,
        wordId: row.wordId,
        recordDate: row.recordDate,
        result: row.result,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        consecutiveCorrectCount: row.consecutiveCorrectCount,
        nextReviewDate: row.nextReviewDate,
      }),
      word: row.word, // Return the raw word object
    }));
  }
}
