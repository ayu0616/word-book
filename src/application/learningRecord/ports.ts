import type { Word } from "@/domain/word/entities";
import type { WordBookId } from "@/domain/wordBook/value-objects/word-book-id";

export interface LearningRecordRepository {
  findWordsToLearn(wordBookId: WordBookId): Promise<Word[]>;
  countWordsToLearn(wordBookId: WordBookId): Promise<number>;
}
