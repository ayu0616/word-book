import type { LearningRecordRepository } from "@/application/learningRecord/ports";
import { db } from "@/db";
import { learningRecords } from "@/db/schema";
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
      })
      .returning();

    return new LearningRecord({
      id: row.id,
      wordId: row.wordId,
      recordDate: row.recordDate,
      result: row.result,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
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
        }),
    );
  }
}
