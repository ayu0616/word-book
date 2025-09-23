import type { LearningRecord } from "@/domain/learningRecord/entities";
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

  async getLearningRecordsByWordId(wordId: number): Promise<LearningRecord[]> {
    return this.learningRecordRepository.findByWordId(wordId);
  }
}
