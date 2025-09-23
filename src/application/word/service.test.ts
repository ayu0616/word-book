import { describe, expect, it, vi } from "vitest";
import { Word } from "@/domain/word/entities";
import type { WordRepository } from "./ports";
import { WordService } from "./service";

describe("WordService", () => {
  it("should create a word", async () => {
    const mockWordRepository: WordRepository = {
      createWord: vi.fn(async (word: Word) => word),
      findWordsByWordBookId: vi.fn(async (wordBookId: number) => [
        Word.fromPersistence({
          id: 1,
          wordBookId,
          term: "Word 1",
          meaning: "Meaning 1",
          createdAt: new Date(),
        }),
        Word.fromPersistence({
          id: 2,
          wordBookId,
          term: "Word 2",
          meaning: "Meaning 2",
          createdAt: new Date(),
        }),
      ]),
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
});
