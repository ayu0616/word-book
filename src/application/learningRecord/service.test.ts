import { createId } from "@paralleldrive/cuid2";
import { describe, expect, it, vi } from "vitest";
import { Word, type WordProps } from "@/domain/word/entities";
import { WordId } from "@/domain/word/value-objects/WordId";
import { WordBookId } from "@/domain/wordBook/value-objects/word-book-id";
import type { WordRepository } from "../word/ports";
import type { LearningRecordRepository } from "./ports";
import { LearningRecordService } from "./service";

// Mock WordRepository
class InMemoryWordRepository implements WordRepository {
  private words: WordProps[] = [];

  async createWord(word: Word): Promise<Word> {
    const newWord = {
      id: createId(),
      wordBookId: word.wordBookId.value,
      term: word.term.value,
      meaning: word.meaning.value,
      createdAt: word.createdAt.value,
      consecutiveCorrectCount: word.consecutiveCorrectCount.value,
      nextReviewDate: word.nextReviewDate.value,
    };
    this.words.push(newWord);
    return Word.fromPersistence(newWord);
  }

  async findById(id: WordId): Promise<Word | undefined> {
    const foundWord = this.words.find((word) => word.id === id.value);
    return foundWord ? Word.fromPersistence(foundWord) : undefined;
  }

  async findWordsByWordBookId(wordBookId: WordBookId): Promise<Word[]> {
    return this.words
      .filter((word) => word.wordBookId === wordBookId.value)
      .map((w) => Word.fromPersistence(w));
  }

  async update(word: Word): Promise<void> {
    const index = this.words.findIndex((w) => w.id === word.id.value);
    if (index !== -1) {
      this.words[index] = {
        ...this.words[index],
        term: word.term.value,
        meaning: word.meaning.value,
        consecutiveCorrectCount: word.consecutiveCorrectCount.value,
        nextReviewDate: word.nextReviewDate.value,
      };
    }
  }

  // Helper to add words for testing
  addWord(word: WordProps) {
    this.words.push(word);
  }

  // Helper to update words for testing
  updateWord(word: WordProps) {
    const index = this.words.findIndex((w) => w.id === word.id);
    if (index !== -1) {
      this.words[index] = word;
    }
  }

  async delete(id: WordId): Promise<void> {
    this.words = this.words.filter((word) => word.id !== id.value);
  }
}

class InMemoryLearningRecordRepository implements LearningRecordRepository {
  private words: WordProps[] = [];

  async findWordsToLearn(wordBookId: WordBookId): Promise<Word[]> {
    const now = new Date();
    const filteredWords = this.words.filter((word) => {
      const isDueForReview = word.nextReviewDate <= now;
      const isMastered = word.consecutiveCorrectCount >= 5;
      const belongsToWordBook = word.wordBookId === wordBookId.value;

      return (
        belongsToWordBook &&
        (isDueForReview || word.consecutiveCorrectCount === 0) &&
        !isMastered
      );
    });

    return filteredWords.map(Word.fromPersistence);
  }

  async countWordsToLearn(wordBookId: WordBookId): Promise<number> {
    const now = new Date();
    const filteredWords = this.words.filter((word) => {
      const isDueForReview = word.nextReviewDate <= now;
      const isMastered = word.consecutiveCorrectCount >= 5;
      const belongsToWordBook = word.wordBookId === wordBookId.value;

      return (
        belongsToWordBook &&
        (isDueForReview || word.consecutiveCorrectCount === 0) &&
        !isMastered
      );
    });
    return filteredWords.length;
  }

  // Helper to add words for testing
  addWord(word: WordProps) {
    this.words.push(word);
  }
}

describe("LearningRecordService", () => {
  let learningRecordRepository: InMemoryLearningRecordRepository;
  let wordRepository: InMemoryWordRepository;
  let service: LearningRecordService;

  beforeEach(() => {
    learningRecordRepository = new InMemoryLearningRecordRepository();
    wordRepository = new InMemoryWordRepository();
    service = new LearningRecordService(
      learningRecordRepository,
      wordRepository,
    );
  });

  describe("recordLearningResult", () => {
    it("should update an existing word with correct result", async () => {
      const wordId = WordId.create();
      const wordBookId = WordBookId.from(createId());
      const initialNextReviewDate = new Date();
      initialNextReviewDate.setDate(initialNextReviewDate.getDate() - 1); // 昨日

      const mockWord = Word.fromPersistence({
        id: wordId.value,
        wordBookId: wordBookId.value,
        term: "test",
        meaning: "テスト",
        createdAt: new Date(),
        consecutiveCorrectCount: 0,
        nextReviewDate: initialNextReviewDate,
      });

      const wordRepository: WordRepository = {
        createWord: vi.fn(),
        findWordsByWordBookId: vi.fn(),
        findById: vi.fn(async (id: WordId) =>
          id.value === wordId.value ? mockWord : undefined,
        ),
        update: vi
          .fn(async (word: Word) => {
            Object.assign(mockWord, word); // ここを再度追加
            expect(word.id?.value).toBe(mockWord.id?.value);
            expect(word.wordBookId.value).toBe(mockWord.wordBookId.value);
            expect(word.term.value).toBe(mockWord.term.value);
            expect(word.meaning.value).toBe(mockWord.meaning.value);
            expect(word.createdAt.value).toEqual(mockWord.createdAt.value);
            expect(word.consecutiveCorrectCount).toBe(1); // 期待される値
            const expectedNextReviewDate1 = new Date();
            expectedNextReviewDate1.setDate(
              expectedNextReviewDate1.getDate() + 1,
            );
            expect(word.nextReviewDate.value.toDateString()).toBe(
              expectedNextReviewDate1.toDateString(),
            );
          })
          .mockResolvedValue(undefined),
        delete: vi.fn(),
      };

      const learningRecordRepository: LearningRecordRepository = {
        findWordsToLearn: vi.fn(),
        countWordsToLearn: vi.fn(),
      };

      const service = new LearningRecordService(
        learningRecordRepository,
        wordRepository,
      );

      await service.recordLearningResult(wordId, true);

      expect(wordRepository.findById).toHaveBeenCalledWith(wordId);
      expect(wordRepository.update).toHaveBeenCalledOnce(); // updateが一度呼ばれたことを確認

      const updatedWord = await wordRepository.findById(wordId);
      expect(updatedWord?.consecutiveCorrectCount.value).toBe(1);
      const expectedNextReviewDate1 = new Date();
      expectedNextReviewDate1.setDate(expectedNextReviewDate1.getDate() + 1); // 1日後
      expect(updatedWord?.nextReviewDate.value.toDateString()).toBe(
        expectedNextReviewDate1.toDateString(),
      );
    });

    it("should reset consecutive count and next review date on incorrect result", async () => {
      const wordId = WordId.create();
      const wordBookId = WordBookId.from(createId());
      const initialNextReviewDate = new Date();
      initialNextReviewDate.setDate(initialNextReviewDate.getDate() - 1); // 昨日

      const mockWord = Word.fromPersistence({
        id: wordId.value,
        wordBookId: wordBookId.value,
        term: "test",
        meaning: "テスト",
        createdAt: new Date(),
        consecutiveCorrectCount: 2,
        nextReviewDate: initialNextReviewDate,
      });

      const wordRepository: WordRepository = {
        createWord: vi.fn(),
        findWordsByWordBookId: vi.fn(),
        findById: vi.fn(async (id: WordId) =>
          id.value === wordId.value ? mockWord : undefined,
        ),
        update: vi
          .fn(async (word: Word) => {
            Object.assign(mockWord, word); // ここを再度追加
            expect(word.id?.value).toBe(mockWord.id?.value);
            expect(word.wordBookId.value).toBe(mockWord.wordBookId.value);
            expect(word.term.value).toBe(mockWord.term.value);
            expect(word.meaning.value).toBe(mockWord.meaning.value);
            expect(word.createdAt.value).toEqual(mockWord.createdAt.value);
            expect(word.consecutiveCorrectCount).toBe(0); // 期待される値
            const expectedNextReviewDate2 = new Date();
            expectedNextReviewDate2.setDate(
              expectedNextReviewDate2.getDate() + 1,
            );
            expect(word.nextReviewDate.value.toDateString()).toBe(
              expectedNextReviewDate2.toDateString(),
            );
          })
          .mockResolvedValue(undefined),
        delete: vi.fn(),
      };

      const learningRecordRepository: LearningRecordRepository = {
        findWordsToLearn: vi.fn(),
        countWordsToLearn: vi.fn(),
      };

      const service = new LearningRecordService(
        learningRecordRepository,
        wordRepository,
      );

      await service.recordLearningResult(wordId, false);

      expect(wordRepository.findById).toHaveBeenCalledWith(wordId);
      expect(wordRepository.update).toHaveBeenCalledOnce(); // updateが一度呼ばれたことを確認

      const updatedWord = await wordRepository.findById(wordId);
      expect(updatedWord?.consecutiveCorrectCount).toBe(0);
      const expectedNextReviewDate2 = new Date();
      expect(updatedWord?.nextReviewDate.value.toDateString()).toBe(
        expectedNextReviewDate2.toDateString(),
      );
    });
  });

  describe("getWordsToLearn", () => {
    it("should return words to learn based on next review date", async () => {
      const wordBookId = createId();
      const wordId1 = createId();
      const wordId2 = createId();

      const word1 = {
        id: wordId1,
        wordBookId: wordBookId,
        term: "term1",
        meaning: "meaning1",
        createdAt: new Date(),
        consecutiveCorrectCount: 0,
        nextReviewDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Due for review
      };
      const word2 = {
        id: wordId2,
        wordBookId: wordBookId,
        term: "term2",
        meaning: "meaning2",
        createdAt: new Date(),
        consecutiveCorrectCount: 0,
        nextReviewDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Not due yet
      };

      wordRepository.addWord(word1);
      wordRepository.addWord(word2);
      learningRecordRepository.addWord(word1);
      learningRecordRepository.addWord(word2);

      const wordsToLearn = await service.getWordsToLearn(wordBookId);

      expect(wordsToLearn).toHaveLength(2);
      expect(wordsToLearn[0].id.value).toBe(wordId1);
    });

    it("should not return mastered words", async () => {
      const wordBookId = createId();
      const wordId = createId();

      const masteredWord = {
        id: wordId,
        wordBookId: wordBookId,
        term: "mastered",
        meaning: "マスター済み",
        createdAt: new Date(),
        consecutiveCorrectCount: 5,
        nextReviewDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Due for review but mastered
      };

      wordRepository.addWord(masteredWord);
      learningRecordRepository.addWord(masteredWord);

      const wordsToLearn = await service.getWordsToLearn(wordBookId);
      expect(wordsToLearn).toHaveLength(0);
    });

    it("should return words with no learning records (initial learning)", async () => {
      const wordBookId = createId();
      const wordId = createId();

      const newWord = {
        id: wordId,
        wordBookId: wordBookId,
        term: "new word",
        meaning: "新しい単語",
        createdAt: new Date(),
        consecutiveCorrectCount: 0,
        nextReviewDate: new Date(), // Default nextReviewDate is now
      };

      wordRepository.addWord(newWord);
      learningRecordRepository.addWord(newWord);

      const wordsToLearn = await service.getWordsToLearn(wordBookId);

      expect(wordsToLearn).toHaveLength(1);
      expect(wordsToLearn[0].id.value).toBe(wordId);
    });
  });

  describe("countWordsToLearn", () => {
    it("should return the correct count of words to learn", async () => {
      const wordBookId = createId();
      const wordId1 = createId();
      const wordId2 = createId();
      const wordId3 = createId();

      const word1 = {
        id: wordId1,
        wordBookId: wordBookId,
        term: "term1",
        meaning: "meaning1",
        createdAt: new Date(),
        consecutiveCorrectCount: 0,
        nextReviewDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Due for review
      };
      const word2 = {
        id: wordId2,
        wordBookId: wordBookId,
        term: "term2",
        meaning: "meaning2",
        createdAt: new Date(),
        consecutiveCorrectCount: 1, // 復習日が先の日付になるのは正解回数1回以上の時のみ
        nextReviewDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Not due yet
      };
      const word3 = {
        id: wordId3,
        wordBookId: wordBookId,
        term: "mastered",
        meaning: "マスター済み",
        createdAt: new Date(),
        consecutiveCorrectCount: 5,
        nextReviewDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Due for review but mastered
      };

      learningRecordRepository.addWord(word1);
      learningRecordRepository.addWord(word2);
      learningRecordRepository.addWord(word3);

      const count = await service.countWordsToLearn(wordBookId);
      expect(count).toBe(1); // Only word1 is due for review and not mastered
    });

    it("should return 0 if no words are due for learning", async () => {
      const wordBookId = createId();
      const wordId1 = createId();

      const word1 = {
        id: wordId1,
        wordBookId: wordBookId,
        term: "term1",
        meaning: "meaning1",
        createdAt: new Date(),
        consecutiveCorrectCount: 1,
        nextReviewDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Not due yet
      };

      learningRecordRepository.addWord(word1);

      const count = await service.countWordsToLearn(wordBookId);
      expect(count).toBe(0);
    });

    it("should return 0 if all words are mastered", async () => {
      const wordBookId = createId();
      const wordId1 = createId();

      const word1 = {
        id: wordId1,
        wordBookId: wordBookId,
        term: "mastered",
        meaning: "マスター済み",
        createdAt: new Date(),
        consecutiveCorrectCount: 5,
        nextReviewDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Due for review but mastered
      };

      learningRecordRepository.addWord(word1);

      const count = await service.countWordsToLearn(wordBookId);
      expect(count).toBe(0);
    });
  });
});
