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
import { Word } from "@/domain/word/entities";
import { CreatedAt } from "@/domain/word/value-objects/CreatedAt";
import { Meaning } from "@/domain/word/value-objects/Meaning";
import { NextReviewDate } from "@/domain/word/value-objects/NextReviewDate";
import { Term } from "@/domain/word/value-objects/Term";
import { WordBookId } from "@/domain/word/value-objects/WordBookId";
import { WordId } from "@/domain/word/value-objects/WordId";
import { DrizzleWordRepository } from "./repository.drizzle";

// Mock the db object
vitest.mock("@/db", () => ({
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
vitest.mock("drizzle-orm", async (importOriginal) => {
  const mod = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...mod,
    eq: vi.fn((column, value) => ({ column, value, __isDrizzleEq: true })),
  };
});

// Mock Word entity
vitest.mock("@/domain/word/entities", () => ({
  Word: {
    fromPersistence: vi.fn((data) => ({
      id: WordId.create(data.id),
      wordBookId: WordBookId.create(data.wordBookId),
      term: Term.create(data.term),
      meaning: Meaning.create(data.meaning),
      createdAt: CreatedAt.create(data.createdAt),
      consecutiveCorrectCount: data.consecutiveCorrectCount,
      nextReviewDate: NextReviewDate.create(data.nextReviewDate),
    })),
    create: vi.fn((data) => ({
      id: undefined, // IDは生成時には持たない
      wordBookId: data.wordBookId,
      term: data.term,
      meaning: data.meaning,
      createdAt: CreatedAt.create(new Date()),
      consecutiveCorrectCount: 0,
      nextReviewDate: NextReviewDate.create(new Date()),
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
      const mockWord = Word.create({
        wordBookId: WordBookId.create(1),
        term: Term.create("test"),
        meaning: Meaning.create("テスト"),
      });
      const mockNewWordRow = {
        id: 1,
        wordBookId: 1,
        term: "test",
        meaning: "テスト",
        createdAt: new Date(),
        consecutiveCorrectCount: 0,
        nextReviewDate: new Date(),
      };

      (db.insert as Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockNewWordRow]),
      });

      const result = await repository.createWord(mockWord);

      expect(db.insert).toHaveBeenCalledWith(words);
      expect((db.insert as Mock)().values).toHaveBeenCalledWith({
        wordBookId: mockWord.wordBookId.value,
        term: mockWord.term.value,
        meaning: mockWord.meaning.value,
        createdAt: mockWord.createdAt.value,
        consecutiveCorrectCount: mockWord.consecutiveCorrectCount,
        nextReviewDate: mockWord.nextReviewDate.value,
      });
      expect(Word.fromPersistence).toHaveBeenCalledWith(mockNewWordRow);
      expect(result.id?.value).toEqual(mockNewWordRow.id);
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
        nextReviewDate: new Date(),
      };

      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([mockWordRow]),
        })),
      });

      const result = await repository.findById(WordId.create(mockId));

      expect(db.select).toHaveBeenCalled();
      expect((db.select as Mock)().from).toHaveBeenCalledWith(words);
      expect((db.select as Mock)().from().where).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleEq: true,
          value: mockId,
        }),
      );
      expect(Word.fromPersistence).toHaveBeenCalledWith(mockWordRow);
      expect(result?.id?.value).toEqual(mockWordRow.id);
    });

    it("should return undefined if not found by ID", async () => {
      const mockId = 999;

      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
      });

      const result = await repository.findById(WordId.create(mockId));

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
          nextReviewDate: new Date(),
        },
        {
          id: 2,
          wordBookId: mockWordBookId,
          term: "test2",
          meaning: "テスト2",
          createdAt: new Date(),
          consecutiveCorrectCount: 0,
          nextReviewDate: new Date(),
        },
      ];

      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockWordRows),
      });

      const result = await repository.findWordsByWordBookId(
        WordBookId.create(mockWordBookId),
      );

      expect(db.select).toHaveBeenCalled();
      expect((db.select as Mock)().from).toHaveBeenCalledWith(words);
      expect((db.select as Mock)().from().where).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleEq: true,
          value: mockWordBookId,
        }),
      );
      expect(Word.fromPersistence).toHaveBeenCalledTimes(mockWordRows.length);
      expect(result[0].id?.value).toEqual(mockWordRows[0].id);
      expect(result[1].id?.value).toEqual(mockWordRows[1].id);
    });
  });

  describe("update", () => {
    it("should update an existing word", async () => {
      const mockWord = Word.fromPersistence({
        id: 1,
        wordBookId: 1,
        term: "updated_test",
        meaning: "更新テスト",
        createdAt: new Date(),
        consecutiveCorrectCount: 1,
        nextReviewDate: new Date(),
      });

      const mockWhere = vi.fn();
      (db.update as Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: mockWhere,
      });

      await repository.update(mockWord);

      expect(db.update).toHaveBeenCalledWith(words);
      expect((db.update as Mock)().set).toHaveBeenCalledWith({
        term: mockWord.term.value,
        meaning: mockWord.meaning.value,
        consecutiveCorrectCount: mockWord.consecutiveCorrectCount,
        nextReviewDate: mockWord.nextReviewDate.value,
      });
      expect(mockWhere).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleEq: true,
          value: mockWord.id?.value,
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

      await repository.delete(WordId.create(mockId));

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
