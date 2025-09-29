import type { Word } from "@/domain/word/entities";

export interface LearningRecordRepository {
  findWordsToLearn(wordBookId: number): Promise<Word[]>;
  countWordsToLearn(wordBookId: number): Promise<number>;
}
