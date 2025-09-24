import type { words } from "@/db/schema";

export interface LearningRecordRepository {
  findWordsToLearn(wordBookId: number): Promise<(typeof words.$inferSelect)[]>;
  updateWordLearningData(
    wordId: number,
    consecutiveCorrectCount: number,
    nextReviewDate: Date,
  ): Promise<void>;
}
