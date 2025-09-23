import type { words } from "@/db/schema";
import type { LearningRecord } from "@/domain/learningRecord/entities";

export interface LearningRecordRepository {
  create(params: {
    wordId: number;
    result: "correct" | "incorrect";
  }): Promise<LearningRecord>;
  findByWordId(wordId: number): Promise<LearningRecord[]>;
  update(learningRecord: LearningRecord): Promise<LearningRecord>;
  findWordsToLearn(
    wordBookId: number,
    limit: number,
  ): Promise<
    { learningRecord: LearningRecord; word: typeof words.$inferSelect }[]
  >;
}
