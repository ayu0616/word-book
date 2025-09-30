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
import { wordBooks } from "@/db/schema";
import { WordBook } from "@/domain/wordBook/word-book.entity";
import { DrizzleWordBookRepository } from "./repository.drizzle";

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
        where: vi.fn(),
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

// Mock WordBook entity
vitest.mock("@/domain/wordBook/word-book.entity", () => ({
  WordBook: {
    fromPersistence: vi.fn((data) => ({
      id: data.id,
      userId: data.userId,
      title: data.title,
    })),
  },
}));

describe("DrizzleWordBookRepository", () => {
  let repository: DrizzleWordBookRepository;

  beforeEach(() => {
    repository = new DrizzleWordBookRepository();
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create and return a new WordBook", async () => {
      const mockWordBook = {
        userId: 1,
        title: "Test WordBook",
      };
      const mockNewWordBookRow = {
        id: 1,
        ...mockWordBook,
      };

      (db.insert as Mock).mockReturnValue({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockNewWordBookRow]),
      });

      const result = await repository.create(mockWordBook as WordBook);

      expect(db.insert).toHaveBeenCalledWith(wordBooks);
      expect((db.insert as Mock)().values).toHaveBeenCalledWith({
        userId: mockWordBook.userId,
        title: mockWordBook.title,
      });
      expect(WordBook.fromPersistence).toHaveBeenCalledWith(mockNewWordBookRow);
      expect(result).toEqual(mockNewWordBookRow);
    });
  });

  describe("findWordBooksByUserId", () => {
    it("should return an array of WordBooks for a given userId", async () => {
      const mockUserId = 1;
      const mockWordBookRows = [
        { id: 1, userId: mockUserId, title: "WordBook 1" },
        { id: 2, userId: mockUserId, title: "WordBook 2" },
      ];

      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockWordBookRows),
      });

      const result = await repository.findWordBooksByUserId(mockUserId);

      expect(db.select).toHaveBeenCalled();
      expect((db.select as Mock)().from).toHaveBeenCalledWith(wordBooks);
      expect((db.select as Mock)().from().where).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleEq: true,
          value: mockUserId,
        }),
      );
      expect(WordBook.fromPersistence).toHaveBeenCalledTimes(
        mockWordBookRows.length,
      );
      expect(result).toEqual(mockWordBookRows);
    });
  });

  describe("findWordBookById", () => {
    it("should return a WordBook if found by ID", async () => {
      const mockId = 1;
      const mockWordBookRow = { id: mockId, userId: 1, title: "Test WordBook" };

      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockWordBookRow]),
      });

      const result = await repository.findWordBookById(mockId);

      expect(db.select).toHaveBeenCalled();
      expect((db.select as Mock)().from).toHaveBeenCalledWith(wordBooks);
      expect((db.select as Mock)().from().where).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleEq: true,
          value: mockId,
        }),
      );
      expect(WordBook.fromPersistence).toHaveBeenCalledWith(mockWordBookRow);
      expect(result).toEqual(mockWordBookRow);
    });

    it("should return null if not found by ID", async () => {
      const mockId = 999;

      (db.select as Mock).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      });

      const result = await repository.findWordBookById(mockId);

      expect(result).toBeNull();
      expect(WordBook.fromPersistence).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete a word book by ID", async () => {
      const mockId = 1;
      const mockWhere = vi.fn();
      (db.delete as Mock).mockReturnValue({
        where: mockWhere,
      });

      await repository.delete(mockId);

      expect(db.delete).toHaveBeenCalledWith(wordBooks);
      expect(mockWhere).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleEq: true,
          value: mockId,
        }),
      );
    });
  });

  describe("updateTitle", () => {
    it("should update the title of a word book", async () => {
      const mockId = 1;
      const mockTitle = "New Title";
      const mockWhere = vi.fn();
      (db.update as Mock).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: mockWhere,
      });

      await repository.updateTitle(mockId, mockTitle);

      expect(db.update).toHaveBeenCalledWith(wordBooks);
      expect((db.update as Mock)().set).toHaveBeenCalledWith({
        title: mockTitle,
      });
      expect(mockWhere).toHaveBeenCalledWith(
        expect.objectContaining({
          __isDrizzleEq: true,
          value: mockId,
        }),
      );
    });
  });
});
