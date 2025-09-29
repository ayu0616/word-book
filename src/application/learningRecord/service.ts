import type { WordRepository } from "@/application/word/ports";
import type { Word } from "@/domain/word/entities";
import type { WordId } from "@/domain/word/value-objects/WordId";
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

  async getWordsToLearn(wordBookId: number): Promise<Word[]> {
    return this.learningRecordRepository.findWordsToLearn(wordBookId);
  }

  async countWordsToLearn(wordBookId: number): Promise<number> {
    return this.learningRecordRepository.countWordsToLearn(wordBookId);
  }
}
