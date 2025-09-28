import type { WordProps } from "@/domain/word/entities";

export interface LearningRecordRepository {
  findWordsToLearn(wordBookId: number): Promise<WordProps[]>;
  countWordsToLearn(wordBookId: number): Promise<number>;
}
