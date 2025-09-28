import { and, count, eq, isNull, lt, or } from "drizzle-orm";
import type { LearningRecordRepository } from "@/application/learningRecord/ports";
import { db } from "@/db";
import { words } from "@/db/schema";
import type { NextReviewDate } from "@/domain/word/value-objects/NextReviewDate";
import type { WordId } from "@/domain/word/value-objects/WordId";

export class DrizzleLearningRecordRepository
  implements LearningRecordRepository
{
  async findWordsToLearn(
    wordBookId: number,
  ): Promise<(typeof words.$inferSelect)[]> {
    const rows = await db
      .select()
      .from(words)
      .where(
        and(
          eq(words.wordBookId, wordBookId),
          or(
            lt(words.nextReviewDate, new Date()),
            isNull(words.nextReviewDate),
          ),
        ),
      );

    return rows;
  }

  async updateWordLearningData(
    wordId: WordId,
    consecutiveCorrectCount: number,
    nextReviewDate: NextReviewDate,
  ): Promise<void> {
    await db
      .update(words)
      .set({
        consecutiveCorrectCount,
        nextReviewDate: nextReviewDate.value,
      })
      .where(eq(words.id, wordId.value));
  }

  async countWordsToLearn(wordBookId: number): Promise<number> {
    const [{ count: wordsToLearnCount }] = await db
      .select({ count: count() })
      .from(words)
      .where(
        and(
          eq(words.wordBookId, wordBookId),
          or(
            lt(words.nextReviewDate, new Date()),
            isNull(words.nextReviewDate),
          ),
        ),
      );
    return wordsToLearnCount;
  }
}
