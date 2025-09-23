import type { LearningRecord } from "@/domain/learningRecord/entities";

export interface LearningRecordRepository {
  create(params: {
    wordId: number;
    result: "correct" | "incorrect";
  }): Promise<LearningRecord>;
  findByWordId(wordId: number): Promise<LearningRecord[]>;
}
