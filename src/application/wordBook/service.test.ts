import { describe, expect, it, vi } from "vitest";
import { WordBook } from "@/domain/wordBook/entities";
import type { WordBookRepository } from "./ports";
import { WordBookService } from "./service";

describe("WordBookService", () => {
  it("should create a word book", async () => {
    const mockWordBookRepository: WordBookRepository = {
      create: vi.fn(async (wordBook: WordBook) => wordBook),
      findWordBooksByUserId: vi.fn(async () => []),
      findWordBookById: vi.fn(async () => null),
      delete: vi.fn(async (_id: number) => {}),
    };
    const service = new WordBookService(mockWordBookRepository);

    const input = {
      userId: 1,
      title: "My New WordBook",
    };

    const createdWordBook = await service.create(input);

    expect(mockWordBookRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: input.userId,
        title: input.title,
      }),
    );
    expect(createdWordBook).toBeInstanceOf(WordBook);
    expect(createdWordBook.userId).toBe(input.userId);
    expect(createdWordBook.title).toBe(input.title);
  });

  it("should find word books by user ID", async () => {
    const mockWordBookRepository: WordBookRepository = {
      create: vi.fn(async (wordBook: WordBook) => wordBook),
      findWordBooksByUserId: vi.fn(async (userId: number) => [
        WordBook.fromPersistence({ id: 1, userId, title: "Book 1" }),
        WordBook.fromPersistence({ id: 2, userId, title: "Book 2" }),
      ]),
      findWordBookById: vi.fn(async () => null),
      delete: vi.fn(async (_id: number) => {}),
    };
    const service = new WordBookService(mockWordBookRepository);

    const userId = 1;
    const wordBooks = await service.findWordBooksByUserId(userId);

    expect(mockWordBookRepository.findWordBooksByUserId).toHaveBeenCalledWith(
      userId,
    );
    expect(wordBooks).toHaveLength(2);
    expect(wordBooks[0]).toBeInstanceOf(WordBook);
    expect(wordBooks[0].userId).toBe(userId);
  });

  it("should delete a word book", async () => {
    const mockWordBookRepository: WordBookRepository = {
      create: vi.fn(async (wordBook: WordBook) => wordBook),
      findWordBooksByUserId: vi.fn(async () => []),
      findWordBookById: vi.fn(async () => null),
      delete: vi.fn(async (_id: number) => {}),
    };
    const service = new WordBookService(mockWordBookRepository);

    const wordBookId = 1;
    await service.deleteWordBook(wordBookId);

    expect(mockWordBookRepository.delete).toHaveBeenCalledWith(wordBookId);
  });
});
