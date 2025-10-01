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
    const words = await this.learningRecordRepository.findWordsToLearn(
      WordBookId.from(wordBookId),
    );
    // Fisher-Yatesシャッフルで順序をランダム化
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words;
  }

  async countWordsToLearn(wordBookId: string): Promise<number> {
    return this.learningRecordRepository.countWordsToLearn(
      WordBookId.from(wordBookId),
    );
  }
}
