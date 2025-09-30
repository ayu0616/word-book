import type { WordRepository } from "@/application/word/ports";
import type { Word } from "@/domain/word/entities";
import type { WordId } from "@/domain/word/value-objects/WordId";
import { WordBookId } from "@/domain/wordBook/value-objects/word-book-id";
import type { LearningRecordRepository } from "./ports";

export class LearningRecordService {
  constructor(
    private readonly learningRecordRepository: LearningRecordRepository,
    private readonly wordRepository: WordRepository,
  ) {}

  async recordLearningResult(
    wordId: WordId,
    isCorrect: boolean,
  ): Promise<void> {
    const word = await this.wordRepository.findById(wordId);

    if (!word) {
      throw new Error("Word not found");
    }

    if (isCorrect) {
      word.markAsCorrect();
    } else {
      word.markAsIncorrect();
    }

    return this.wordRepository.update(word);
  }

  async getWordsToLearn(wordBookId: string): Promise<Word[]> {
    return this.learningRecordRepository.findWordsToLearn(
      WordBookId.from(wordBookId),
    );
  }

  async countWordsToLearn(wordBookId: string): Promise<number> {
    return this.learningRecordRepository.countWordsToLearn(
      WordBookId.from(wordBookId),
    );
  }
}
