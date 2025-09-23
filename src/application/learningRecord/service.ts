import type { WordRepository } from "@/application/word/ports";
import type { words } from "@/db/schema";
import type { LearningRecordRepository } from "./ports";

export class LearningRecordService {
  constructor(
    private readonly learningRecordRepository: LearningRecordRepository,
    private readonly wordRepository: WordRepository,
  ) {}

  private calculateNextReviewDate(consecutiveCorrectCount: number): Date {
    const days = 2 ** consecutiveCorrectCount;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  async recordLearningResult(params: {
    wordId: number;
    result: "correct" | "incorrect";
  }): Promise<void> {
    const word = await this.wordRepository.findById(params.wordId);

    if (!word) {
      throw new Error("Word not found");
    }

    let newConsecutiveCorrectCount = word.consecutiveCorrectCount;
    let newNextReviewDate = word.nextReviewDate;

    if (params.result === "correct") {
      newConsecutiveCorrectCount++;
      newNextReviewDate = this.calculateNextReviewDate(
        newConsecutiveCorrectCount,
      );
    } else {
      newConsecutiveCorrectCount = 0;
      newNextReviewDate = this.calculateNextReviewDate(
        newConsecutiveCorrectCount,
      ); // 1 day from now
    }

    await this.learningRecordRepository.updateWordLearningData(
      params.wordId,
      newConsecutiveCorrectCount,
      newNextReviewDate,
    );
  }

  async getWordsToLearn(
    wordBookId: number,
    limit: number,
  ): Promise<(typeof words.$inferSelect)[]> {
    return this.learningRecordRepository.findWordsToLearn(wordBookId, limit);
  }
}
