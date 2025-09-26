import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { db } from "@/db";
import { words } from "@/db/schema";
import { Word } from "@/domain/word/entities";
import { DrizzleWordRepository } from "./repository.drizzle";

// Mock the db object
vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
  },
}));

// Mock drizzle-orm functions
vi.mock("drizzle-orm", async (importOriginal) => {
  const mod = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...mod,
    eq: vi.fn((column, value) => ({ column, value, __isDrizzleEq: true })),
  };
});

// Mock Word entity
vi.mock("@/domain/word/entities", () => ({
  Word: {
    fromPersistence: vi.fn((data) => ({
      id: data.id,
      wordBookId: data.wordBookId,
      term: data.term,
      meaning: data.meaning,
      createdAt: data.createdAt,
      consecutiveCorrectCount: data.consecutiveCorrectCount,
      nextReviewDate: data.nextReviewDate,
    })),
  },
}));

describe("DrizzleWordRepository", () => {
  let repository: DrizzleWordRepository;

  beforeEach(() => {
    repository = new DrizzleWordRepository();
    vi.clearAllMocks();
  });

  describe("createWord", () => {
    it("should create and return a new Word", async () => {
      const mockWord = {
        wordBookId: 1,
        term: "test",
        meaning: "テスト",
        createdAt: new Date(),
      };
      const mockNewWordRow = {
        id: 1,
        ...mockWord,
        consecutiveCorrectCount: 0,
        nextReviewDate: null,
      };

      (db.insert as Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockNewWordRow]),
      });

      const result = await repository.createWord(mockWord as Word);

      expect(db.insert).toHaveBeenCalledWith(words);
      expect((db.insert as Mock)().values).toHaveBeenCalledWith({
        wordBookId: mockWord.wordBookId,
        term: mockWord.term,
        meaning: mockWord.meaning,
        createdAt: mockWord.createdAt,
      });
      expect(Word.fromPersistence).toHaveBeenCalledWith(mockNewWordRow);
      expect(result).toEqual(mockNewWordRow);
    });
  });

  describe("findById", () => {
    it("should return a Word if found by ID", async () => {
      const mockId = 1;
      const mockWordRow = {
        id: mockId,
        wordBookId: 1,
        term: "test",
        meaning: "テスト",
        createdAt: new Date(),
        consecutiveCorrectCount: 0,
        nextReviewDate: null,
      };

      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([mockWordRow]),
        })),
      });

      const result = await repository.findById(mockId);

      expect(db.select).toHaveBeenCalled();
      expect((db.select as Mock)().from).toHaveBeenCalledWith(words);
      expect((db.select as Mock)().from().where).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleEq: true,
          value: mockId,
        }),
      );
      expect(Word.fromPersistence).toHaveBeenCalledWith(mockWordRow);
      expect(result).toEqual(mockWordRow);
    });

    it("should return undefined if not found by ID", async () => {
      const mockId = 999;

      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
      });

      const result = await repository.findById(mockId);

      expect(result).toBeUndefined();
      expect(Word.fromPersistence).not.toHaveBeenCalled();
    });
  });

  describe("findWordsByWordBookId", () => {
    it("should return an array of Words for a given wordBookId", async () => {
      const mockWordBookId = 1;
      const mockWordRows = [
        {
          id: 1,
          wordBookId: mockWordBookId,
          term: "test1",
          meaning: "テスト1",
          createdAt: new Date(),
          consecutiveCorrectCount: 0,
          nextReviewDate: null,
        },
        {
          id: 2,
          wordBookId: mockWordBookId,
          term: "test2",
          meaning: "テスト2",
          createdAt: new Date(),
          consecutiveCorrectCount: 0,
          nextReviewDate: null,
        },
      ];

      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockWordRows),
      });

      const result = await repository.findWordsByWordBookId(mockWordBookId);

      expect(db.select).toHaveBeenCalled();
      expect((db.select as Mock)().from).toHaveBeenCalledWith(words);
      expect((db.select as Mock)().from().where).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleEq: true,
          value: mockWordBookId,
        }),
      );
      expect(Word.fromPersistence).toHaveBeenCalledTimes(mockWordRows.length);
      expect(result).toEqual(mockWordRows);
    });
  });

  describe("update", () => {
    it("should update an existing word", async () => {
      const mockWord = {
        id: 1,
        wordBookId: 1,
        term: "updated_test",
        meaning: "更新テスト",
        createdAt: new Date(),
        consecutiveCorrectCount: 1,
        nextReviewDate: new Date(),
      };

      const mockWhere = vi.fn();
      (db.update as Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: mockWhere,
      });

      await repository.update(mockWord as Word);

      expect(db.update).toHaveBeenCalledWith(words);
      expect((db.update as Mock)().set).toHaveBeenCalledWith({
        term: mockWord.term,
        meaning: mockWord.meaning,
        consecutiveCorrectCount: mockWord.consecutiveCorrectCount,
        nextReviewDate: mockWord.nextReviewDate,
      });
      expect(mockWhere).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleEq: true,
          value: mockWord.id,
        }),
      );
    });
  });

  describe("delete", () => {
    it("should delete a word by ID", async () => {
      const mockId = 1;
      const mockWhere = vi.fn();
      (db.delete as Mock).mockReturnValue({
        where: mockWhere,
      });

      await repository.delete(mockId);

      expect(db.delete).toHaveBeenCalledWith(words);
      expect(mockWhere).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleEq: true,
          value: mockId,
        }),
      );
    });
  });
});
