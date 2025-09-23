import { beforeEach, describe, expect, it } from "vitest";
import { LearningRecord } from "@/domain/learningRecord/entities";
import type { LearningRecordRepository } from "./ports";
import { LearningRecordService } from "./service";

class InMemoryLearningRecordRepository implements LearningRecordRepository {
  private learningRecords: LearningRecord[] = [];

  async create(params: {
    wordId: number;
    result: "correct" | "incorrect";
  }): Promise<LearningRecord> {
    const newRecord = new LearningRecord({
      id: this.learningRecords.length + 1,
      wordId: params.wordId,
      recordDate: new Date(),
      result: params.result,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.learningRecords.push(newRecord);
    return newRecord;
  }

  async findByWordId(wordId: number): Promise<LearningRecord[]> {
    return this.learningRecords.filter((record) => record.wordId === wordId);
  }
}

describe("LearningRecordService", () => {
  let repository: InMemoryLearningRecordRepository;
  let service: LearningRecordService;

  beforeEach(() => {
    repository = new InMemoryLearningRecordRepository();
    service = new LearningRecordService(repository);
  });

  it("should create a learning record", async () => {
    const wordId = 1;
    const result = "correct";
    const record = await service.createLearningRecord({ wordId, result });

    expect(record).toBeInstanceOf(LearningRecord);
    expect(record.wordId).toBe(wordId);
    expect(record.result).toBe(result);
    await expect(repository.findByWordId(wordId)).resolves.toHaveLength(1);
  });

  it("should get learning records by word ID", async () => {
    const wordId1 = 1;
    const wordId2 = 2;

    await service.createLearningRecord({ wordId: wordId1, result: "correct" });
    await service.createLearningRecord({
      wordId: wordId1,
      result: "incorrect",
    });
    await service.createLearningRecord({ wordId: wordId2, result: "correct" });

    const recordsWord1 = await service.getLearningRecordsByWordId(wordId1);
    const recordsWord2 = await service.getLearningRecordsByWordId(wordId2);

    expect(recordsWord1).toHaveLength(2);
    expect(recordsWord1[0].wordId).toBe(wordId1);
    expect(recordsWord2).toHaveLength(1);
    expect(recordsWord2[0].wordId).toBe(wordId2);
  });
});
