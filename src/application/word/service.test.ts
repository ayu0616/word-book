import { describe, expect, it, vi } from "vitest";
import { Word } from "@/domain/word/entities";
import { Meaning } from "@/domain/word/value-objects/Meaning";
import { Term } from "@/domain/word/value-objects/Term";
import { WordBookId } from "@/domain/word/value-objects/WordBookId";
import { WordId } from "@/domain/word/value-objects/WordId";
import type { WordRepository } from "./ports";
import { WordService } from "./service";

describe("WordService", () => {
  it("should create a word", async () => {
    const mockWordRepository: WordRepository = {
      createWord: vi.fn(async (word: Word) => word),
      findById: vi.fn(async (id: WordId) => {
        if (id.value === 1) {
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
      findWordsByWordBookId: vi.fn(async (wordBookId: WordBookId) => [
        Word.fromPersistence({
          id: 1,
          wordBookId: wordBookId.value,
          term: "Word 1",
          meaning: "Meaning 1",
          createdAt: new Date(),
          consecutiveCorrectCount: 0,
          nextReviewDate: new Date(),
        }),
        Word.fromPersistence({
          id: 2,
          wordBookId: wordBookId.value,
          term: "Word 2",
          meaning: "Meaning 2",
          createdAt: new Date(),
          consecutiveCorrectCount: 0,
          nextReviewDate: new Date(),
        }),
      ]),
      update: vi.fn(async (_word: Word) => {}),
      delete: vi.fn(async (_id: WordId) => {}),
    };
    const service = new WordService(mockWordRepository);

    const input = {
      wordBookId: WordBookId.create(1),
      term: Term.create("test term"),
      meaning: Meaning.create("test meaning"),
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
    expect(createdWord.wordBookId.value).toBe(input.wordBookId.value);
    expect(createdWord.term.value).toBe(input.term.value);
    expect(createdWord.meaning.value).toBe(input.meaning.value);
  });

  it("should update a word", async () => {
    const mockWordRepository: WordRepository = {
      createWord: vi.fn(async (word: Word) => word),
      findById: vi.fn(async (id: WordId) => {
        if (id.value === 1) {
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
      findWordsByWordBookId: vi.fn(async (_wordBookId: WordBookId) => []),
      update: vi.fn(async (_word: Word) => {}),
      delete: vi.fn(async (_id: WordId) => {}),
    };
    const service = new WordService(mockWordRepository);

    const input = {
      id: WordId.create(1),
      term: Term.create("New Term"),
      meaning: Meaning.create("New Meaning"),
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
    expect(updatedWord.term.value).toBe(input.term.value);
    expect(updatedWord.meaning.value).toBe(input.meaning.value);
  });

  it("should find words by word book ID", async () => {
    const mockWordRepository: WordRepository = {
      createWord: vi.fn(async (word: Word) => word),
      findById: vi.fn(async (_id: WordId) => undefined),
      findWordsByWordBookId: vi.fn(async (wordBookId: WordBookId) => [
        Word.fromPersistence({
          id: 1,
          wordBookId: wordBookId.value,
          term: "Word 1",
          meaning: "Meaning 1",
          createdAt: new Date(),
          consecutiveCorrectCount: 0,
          nextReviewDate: new Date(),
        }),
      ]),
      update: vi.fn(async (_word: Word) => {}),
      delete: vi.fn(async (_id: WordId) => {}),
    };
    const service = new WordService(mockWordRepository);

    const wordBookId = WordBookId.create(1);
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
      findById: vi.fn(async (id: WordId) => {
        if (id.value === 1) {
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
      findWordsByWordBookId: vi.fn(async (_wordBookId: WordBookId) => []),
      update: vi.fn(async (_word: Word) => {}),
      delete: vi.fn(async (_id: WordId) => {}),
    };
    const service = new WordService(mockWordRepository);

    const wordId = WordId.create(1);
    const foundWord = await service.findById(wordId);

    expect(mockWordRepository.findById).toHaveBeenCalledWith(wordId);
    expect(foundWord).toBeInstanceOf(Word);
    expect(foundWord?.id?.value).toBe(wordId.value);
  });

  it("should return undefined if word is not found by ID", async () => {
    const mockWordRepository: WordRepository = {
      createWord: vi.fn(async (word: Word) => word),
      findById: vi.fn(async (_id: WordId) => undefined),
      findWordsByWordBookId: vi.fn(async (_wordBookId: WordBookId) => []),
      update: vi.fn(async (_word: Word) => {}),
      delete: vi.fn(async (_id: WordId) => {}),
    };
    const service = new WordService(mockWordRepository);

    const wordId = WordId.create(999);
    const foundWord = await service.findById(wordId);

    expect(mockWordRepository.findById).toHaveBeenCalledWith(wordId);
    expect(foundWord).toBeUndefined();
  });

  it("should delete a word", async () => {
    const mockWordRepository: WordRepository = {
      createWord: vi.fn(async (word: Word) => word),
      findById: vi.fn(async (_id: WordId) => undefined),
      findWordsByWordBookId: vi.fn(async (_wordBookId: WordBookId) => []),
      update: vi.fn(async (_word: Word) => {}),
      delete: vi.fn(async (_id: WordId) => {}),
    };
    const service = new WordService(mockWordRepository);

    const wordId = WordId.create(1);
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

      const wordBookId = WordBookId.create(1);
      const csvContent = "term1,meaning1\nterm2,meaning2";

      const importedWords = await service.importWordsFromCsv(
        wordBookId,
        csvContent,
      );

      expect(mockWordRepository.createWord).toHaveBeenCalledTimes(2);
      expect(mockWordRepository.createWord).toHaveBeenCalledWith(
        expect.objectContaining({
          wordBookId: wordBookId,
          term: Term.create("term1"),
          meaning: Meaning.create("meaning1"),
        }),
      );
      expect(mockWordRepository.createWord).toHaveBeenCalledWith(
        expect.objectContaining({
          wordBookId: wordBookId,
          term: Term.create("term2"),
          meaning: Meaning.create("meaning2"),
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

      const wordBookId = WordBookId.create(1);
      const csvContent = "term1,meaning1\nmalformed_line\nterm2,meaning2,extra";

      const importedWords = await service.importWordsFromCsv(
        wordBookId,
        csvContent,
      );

      expect(mockWordRepository.createWord).toHaveBeenCalledTimes(2);
      expect(mockWordRepository.createWord).toHaveBeenCalledWith(
        expect.objectContaining({
          wordBookId: wordBookId,
          term: Term.create("term1"),
          meaning: Meaning.create("meaning1"),
        }),
      );
      expect(mockWordRepository.createWord).toHaveBeenCalledWith(
        expect.objectContaining({
          wordBookId: wordBookId,
          term: Term.create("term2"),
          meaning: Meaning.create("meaning2"),
        }),
      );
      expect(importedWords).toHaveLength(2);
    });
  });
});
