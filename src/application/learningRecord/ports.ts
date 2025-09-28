import type { words } from "@/db/schema";

export interface LearningRecordRepository {
  findWordsToLearn(wordBookId: number): Promise<(typeof words.$inferSelect)[]>;
  countWordsToLearn(wordBookId: number): Promise<number>;
}
