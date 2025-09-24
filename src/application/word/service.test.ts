import { describe, expect, it, vi } from "vitest";
import { Word } from "@/domain/word/entities";
import type { WordRepository } from "./ports";
import { WordService } from "./service";

describe("WordService", () => {
  it("should create a word", async () => {
    const mockWordRepository: WordRepository = {
      createWord: vi.fn(async (word: Word) => word),
      findById: vi.fn(async (id: number) => {
        if (id === 1) {
          return Word.fromPersistence({
            id: 1,
            wordBookId: 1,
            term: "Word 1",
            meaning: "Meaning 1",
            createdAt: new Date(),
            consecutiveCorrectCount: 0,
            nextReviewDate: new Date(),
          });
        }
        return undefined;
      }),
      findWordsByWordBookId: vi.fn(async (wordBookId: number) => [
        Word.fromPersistence({
          id: 1,
          wordBookId,
          term: "Word 1",
          meaning: "Meaning 1",
          createdAt: new Date(),
          consecutiveCorrectCount: 0,
          nextReviewDate: new Date(),
        }),
        Word.fromPersistence({
          id: 2,
          wordBookId,
          term: "Word 2",
          meaning: "Meaning 2",
          createdAt: new Date(),
          consecutiveCorrectCount: 0,
          nextReviewDate: new Date(),
        }),
      ]),
      update: vi.fn(async (_word: Word) => {}),
      delete: vi.fn(async (_id: number) => {}),
    };
    const service = new WordService(mockWordRepository);

    const input = {
      wordBookId: 1,
      term: "test term",
      meaning: "test meaning",
    };

    const createdWord = await service.createWord(input);

    expect(mockWordRepository.createWord).toHaveBeenCalledWith(
      expect.objectContaining({
        wordBookId: input.wordBookId,
        term: input.term,
        meaning: input.meaning,
      }),
    );
    expect(createdWord).toBeInstanceOf(Word);
    expect(createdWord.wordBookId).toBe(input.wordBookId);
    expect(createdWord.term).toBe(input.term);
    expect(createdWord.meaning).toBe(input.meaning);
  });

  it("should update a word", async () => {
    const mockWordRepository: WordRepository = {
      createWord: vi.fn(async (word: Word) => word),
      findById: vi.fn(async (id: number) => {
        if (id === 1) {
          return Word.fromPersistence({
            id: 1,
            wordBookId: 1,
            term: "Old Term",
            meaning: "Old Meaning",
            createdAt: new Date(),
            consecutiveCorrectCount: 0,
            nextReviewDate: new Date(),
          });
        }
        return undefined;
      }),
      findWordsByWordBookId: vi.fn(async (_wordBookId: number) => []),
      update: vi.fn(async (_word: Word) => {}),
      delete: vi.fn(async (_id: number) => {}),
    };
    const service = new WordService(mockWordRepository);

    const input = {
      id: 1,
      term: "New Term",
      meaning: "New Meaning",
    };

    const updatedWord = await service.updateWord(input);

    expect(mockWordRepository.findById).toHaveBeenCalledWith(input.id);
    expect(mockWordRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: input.id,
        term: input.term,
        meaning: input.meaning,
      }),
    );
    expect(updatedWord).toBeInstanceOf(Word);
    expect(updatedWord.term).toBe(input.term);
    expect(updatedWord.meaning).toBe(input.meaning);
  });

  it("should find words by word book ID", async () => {
    const mockWordRepository: WordRepository = {
      createWord: vi.fn(async (word: Word) => word),
      findById: vi.fn(async (_id: number) => undefined),
      findWordsByWordBookId: vi.fn(async (wordBookId: number) => [
        Word.fromPersistence({
          id: 1,
          wordBookId,
          term: "Word 1",
          meaning: "Meaning 1",
          createdAt: new Date(),
          consecutiveCorrectCount: 0,
          nextReviewDate: new Date(),
        }),
      ]),
      update: vi.fn(async (_word: Word) => {}),
      delete: vi.fn(async (_id: number) => {}),
    };
    const service = new WordService(mockWordRepository);

    const wordBookId = 1;
    const words = await service.findWordsByWordBookId(wordBookId);

    expect(mockWordRepository.findWordsByWordBookId).toHaveBeenCalledWith(
      wordBookId,
    );
    expect(words).toHaveLength(1);
    expect(words[0]).toBeInstanceOf(Word);
  });

  it("should find a word by ID", async () => {
    const mockWordRepository: WordRepository = {
      createWord: vi.fn(async (word: Word) => word),
      findById: vi.fn(async (id: number) => {
        if (id === 1) {
          return Word.fromPersistence({
            id: 1,
            wordBookId: 1,
            term: "Found Word",
            meaning: "Found Meaning",
            createdAt: new Date(),
            consecutiveCorrectCount: 0,
            nextReviewDate: new Date(),
          });
        }
        return undefined;
      }),
      findWordsByWordBookId: vi.fn(async (_wordBookId: number) => []),
      update: vi.fn(async (_word: Word) => {}),
      delete: vi.fn(async (_id: number) => {}),
    };
    const service = new WordService(mockWordRepository);

    const wordId = 1;
    const foundWord = await service.findById(wordId);

    expect(mockWordRepository.findById).toHaveBeenCalledWith(wordId);
    expect(foundWord).toBeInstanceOf(Word);
    expect(foundWord?.id).toBe(wordId);
  });

  it("should return undefined if word is not found by ID", async () => {
    const mockWordRepository: WordRepository = {
      createWord: vi.fn(async (word: Word) => word),
      findById: vi.fn(async (_id: number) => undefined),
      findWordsByWordBookId: vi.fn(async (_wordBookId: number) => []),
      update: vi.fn(async (_word: Word) => {}),
      delete: vi.fn(async (_id: number) => {}),
    };
    const service = new WordService(mockWordRepository);

    const wordId = 999;
    const foundWord = await service.findById(wordId);

    expect(mockWordRepository.findById).toHaveBeenCalledWith(wordId);
    expect(foundWord).toBeUndefined();
  });

  it("should delete a word", async () => {
    const mockWordRepository: WordRepository = {
      createWord: vi.fn(async (word: Word) => word),
      findById: vi.fn(async (_id: number) => undefined),
      findWordsByWordBookId: vi.fn(async (_wordBookId: number) => []),
      update: vi.fn(async (_word: Word) => {}),
      delete: vi.fn(async (_id: number) => {}),
    };
    const service = new WordService(mockWordRepository);

    const wordId = 1;
    await service.deleteWord(wordId);

    expect(mockWordRepository.delete).toHaveBeenCalledWith(wordId);
  });

  describe("importWordsFromCsv", () => {
    it("should import words from CSV content", async () => {
      const mockWordRepository: WordRepository = {
        createWord: vi.fn(async (word: Word) => word),
        findById: vi.fn(),
        findWordsByWordBookId: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      const service = new WordService(mockWordRepository);

      const wordBookId = 1;
      const csvContent = "term1,meaning1\nterm2,meaning2";

      const importedWords = await service.importWordsFromCsv(
        wordBookId,
        csvContent,
      );

      expect(mockWordRepository.createWord).toHaveBeenCalledTimes(2);
      expect(mockWordRepository.createWord).toHaveBeenCalledWith(
        expect.objectContaining({
          wordBookId,
          term: "term1",
          meaning: "meaning1",
        }),
      );
      expect(mockWordRepository.createWord).toHaveBeenCalledWith(
        expect.objectContaining({
          wordBookId,
          term: "term2",
          meaning: "meaning2",
        }),
      );
      expect(importedWords).toHaveLength(2);
      expect(importedWords[0]).toBeInstanceOf(Word);
    });

    it("should skip malformed CSV lines", async () => {
      const mockWordRepository: WordRepository = {
        createWord: vi.fn(async (word: Word) => word),
        findById: vi.fn(),
        findWordsByWordBookId: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      const service = new WordService(mockWordRepository);

      const wordBookId = 1;
      const csvContent = "term1,meaning1\nmalformed_line\nterm2,meaning2,extra"; // 2つ目が不正、3つ目が余分な要素

      const importedWords = await service.importWordsFromCsv(
        wordBookId,
        csvContent,
      );

      expect(mockWordRepository.createWord).toHaveBeenCalledTimes(2); // 1 から 2 に修正
      expect(mockWordRepository.createWord).toHaveBeenCalledWith(
        expect.objectContaining({
          wordBookId,
          term: "term1",
          meaning: "meaning1",
        }),
      );
      expect(mockWordRepository.createWord).toHaveBeenCalledWith(
        // 追加
        expect.objectContaining({
          wordBookId,
          term: "term2",
          meaning: "meaning2",
        }), // 追加
      ); // 追加
      expect(importedWords).toHaveLength(2); // 1 から 2 に修正
    });
  });
});
