import { eq, isNull, lt, or } from "drizzle-orm";
import {
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
  vitest,
} from "vitest";
import { db } from "@/db";
import { words } from "@/db/schema";
import { NextReviewDate } from "@/domain/word/value-objects/NextReviewDate"; // 追加
import { WordId } from "@/domain/word/value-objects/WordId"; // 追加
import { DrizzleLearningRecordRepository } from "./repository.drizzle";

vitest.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

// Mock drizzle-orm functions
vitest.mock("drizzle-orm", () => ({
  and: vi.fn((...conditions) => ({ __isDrizzleAnd: true, conditions })),
  eq: vi.fn((column, value) => ({ column, value, __isDrizzleEq: true })),
  isNull: vi.fn((column) => ({ column, __isDrizzleIsNull: true })),
  lt: vi.fn((column, value) => ({ column, value, __isDrizzleLt: true })),
  or: vi.fn((...conditions) => ({ __isDrizzleOr: true, conditions })),
  count: vi.fn(() => ({ __isDrizzleCount: true })),
}));

describe("DrizzleLearningRecordRepository", () => {
  let repository: DrizzleLearningRecordRepository;

  beforeEach(() => {
    repository = new DrizzleLearningRecordRepository();
    vi.clearAllMocks();
  });

  describe("findWordsToLearn", () => {
    it("should return words to learn based on wordBookId and review date", async () => {
      const mockWordBookId = 1;
      const mockWords = [
        { id: 1, wordBookId: 1, nextReviewDate: new Date("2023-01-01") },
        { id: 2, wordBookId: 1, nextReviewDate: null },
      ];

      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockWords),
      });

      const result = await repository.findWordsToLearn(mockWordBookId);

      expect(result).toEqual(mockWords);
      expect(db.select).toHaveBeenCalled();
      expect((db.select as Mock)().from).toHaveBeenCalledWith(words);
      expect((db.select as Mock)().from().where).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleAnd: true,
        }),
      );
      expect(eq).toHaveBeenCalledWith(words.wordBookId, mockWordBookId);
      expect(or).toHaveBeenCalledWith(
        expect.objectContaining({ __isDrizzleLt: true }),
        expect.objectContaining({ __isDrizzleIsNull: true }),
      );
      expect(lt).toHaveBeenCalledWith(words.nextReviewDate, expect.any(Date));
      expect(isNull).toHaveBeenCalledWith(words.nextReviewDate);
    });
  });

  describe("updateWordLearningData", () => {
    it("should update the learning data for a given word", async () => {
      const mockWordId = 1;
      const mockConsecutiveCorrectCount = 3;
      const mockNextReviewDate = new Date();

      const mockWhere = vi.fn();
      (db.update as Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: mockWhere,
      });

      await repository.updateWordLearningData(
        WordId.create(mockWordId),
        mockConsecutiveCorrectCount,
        NextReviewDate.create(mockNextReviewDate),
      );

      expect(db.update).toHaveBeenCalledWith(words);
      expect((db.update as Mock)().set).toHaveBeenCalledWith({
        consecutiveCorrectCount: mockConsecutiveCorrectCount,
        nextReviewDate: mockNextReviewDate,
      });
      expect(mockWhere).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleEq: true,
          value: mockWordId,
        }),
      );
      expect(eq).toHaveBeenCalledWith(words.id, mockWordId);
    });
  });

  describe("countWordsToLearn", () => {
    it("should return the count of words to learn based on wordBookId and review date", async () => {
      const mockWordBookId = 1;
      const mockCount = 5;

      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: mockCount }]),
      });

      const result = await repository.countWordsToLearn(mockWordBookId);

      expect(result).toBe(mockCount);
      expect(db.select).toHaveBeenCalled();
      expect((db.select as Mock)().from).toHaveBeenCalledWith(words);
      expect((db.select as Mock)().from().where).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleAnd: true,
        }),
      );
      expect(eq).toHaveBeenCalledWith(words.wordBookId, mockWordBookId);
      expect(or).toHaveBeenCalledWith(
        expect.objectContaining({ __isDrizzleLt: true }),
        expect.objectContaining({ __isDrizzleIsNull: true }),
      );
      expect(lt).toHaveBeenCalledWith(words.nextReviewDate, expect.any(Date));
      expect(isNull).toHaveBeenCalledWith(words.nextReviewDate);
    });
  });
});
