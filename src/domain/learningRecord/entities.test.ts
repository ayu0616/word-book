import { describe, expect, it } from "vitest";
import { LearningRecord } from "./entities";

describe("LearningRecord", () => {
  it("should create a new LearningRecord instance", () => {
    const props = {
      id: 1,
      wordId: 101,
      recordDate: new Date(),
      result: "correct" as const,
      consecutiveCorrectCount: 0,
      nextReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const learningRecord = new LearningRecord(props);

    expect(learningRecord).toBeInstanceOf(LearningRecord);
    expect(learningRecord.id).toBe(props.id);
    expect(learningRecord.wordId).toBe(props.wordId);
    expect(learningRecord.recordDate).toBe(props.recordDate);
    expect(learningRecord.result).toBe(props.result);
    expect(learningRecord.createdAt).toBe(props.createdAt);
    expect(learningRecord.updatedAt).toBe(props.updatedAt);
  });

  it("should create a LearningRecord instance from persistence", () => {
    const now = new Date();
    const props = {
      id: 2,
      wordId: 102,
      recordDate: now,
      result: "incorrect" as const,
      consecutiveCorrectCount: 1,
      nextReviewDate: now,
      createdAt: now,
      updatedAt: now,
    };
    const learningRecord = new LearningRecord(props);

    expect(learningRecord).toBeInstanceOf(LearningRecord);
    expect(learningRecord.id).toBe(props.id);
    expect(learningRecord.wordId).toBe(props.wordId);
    expect(learningRecord.recordDate).toBe(props.recordDate);
    expect(learningRecord.result).toBe(props.result);
    expect(learningRecord.createdAt).toBe(props.createdAt);
    expect(learningRecord.updatedAt).toBe(props.updatedAt);
  });
});
