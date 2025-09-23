import type { words } from "@/db/schema";
import { LearningRecord } from "@/domain/learningRecord/entities";
import type { LearningRecordRepository } from "./ports";

export class LearningRecordService {
  constructor(
    private readonly learningRecordRepository: LearningRecordRepository,
  ) {}

  async createLearningRecord(params: {
    wordId: number;
    result: "correct" | "incorrect";
  }): Promise<LearningRecord> {
    return this.learningRecordRepository.create(params);
  }

  private calculateNextReviewDate(consecutiveCorrectCount: number): Date {
    const days = 2 ** consecutiveCorrectCount;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  async recordLearningResult(params: {
    wordId: number;
    result: "correct" | "incorrect";
  }): Promise<LearningRecord> {
    let learningRecord = (
      await this.learningRecordRepository.findByWordId(params.wordId)
    )[0];

    if (!learningRecord) {
      // If no learning record exists, create a new one
      learningRecord = await this.learningRecordRepository.create({
        wordId: params.wordId,
        result: params.result,
      });
    }

    let newConsecutiveCorrectCount = learningRecord.consecutiveCorrectCount;
    let newNextReviewDate = learningRecord.nextReviewDate;

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

    const updatedRecord = new LearningRecord({
      ...learningRecord,
      consecutiveCorrectCount: newConsecutiveCorrectCount,
      nextReviewDate: newNextReviewDate,
      updatedAt: new Date(),
    });

    return this.learningRecordRepository.update(updatedRecord);
  }

  async getWordsToLearn(
    wordBookId: number,
    limit: number,
  ): Promise<
    { learningRecord: LearningRecord; word: typeof words.$inferSelect }[]
  > {
    return this.learningRecordRepository.findWordsToLearn(wordBookId, limit);
  }
}
