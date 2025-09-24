import { beforeEach, describe, expect, it } from "vitest";
import type { WordRepository } from "@/application/word/ports";
import type { words } from "@/db/schema";
import { Word } from "@/domain/word/entities";
import type { LearningRecordRepository } from "./ports";
import { LearningRecordService } from "./service";

// Mock WordRepository
class InMemoryWordRepository implements WordRepository {
  private words: (typeof words.$inferSelect)[] = [];

  async createWord(word: Word): Promise<Word> {
    const newWord = {
      id: this.words.length + 1,
      wordBookId: word.wordBookId,
      term: word.term,
      meaning: word.meaning,
      createdAt: word.createdAt,
      consecutiveCorrectCount: word.consecutiveCorrectCount,
      nextReviewDate: word.nextReviewDate,
    };
    this.words.push(newWord);
    return Word.fromPersistence(newWord);
  }

  async findById(id: number): Promise<Word | undefined> {
    const foundWord = this.words.find((word) => word.id === id);
    return foundWord ? Word.fromPersistence(foundWord) : undefined;
  }

  async findWordsByWordBookId(wordBookId: number): Promise<Word[]> {
    return this.words
      .filter((word) => word.wordBookId === wordBookId)
      .map((w) => Word.fromPersistence(w));
  }

  async update(word: Word): Promise<void> {
    const index = this.words.findIndex((w) => w.id === word.id);
    if (index !== -1) {
      this.words[index] = {
        ...this.words[index],
        term: word.term,
        meaning: word.meaning,
        consecutiveCorrectCount: word.consecutiveCorrectCount,
        nextReviewDate: word.nextReviewDate,
      };
    }
  }

  // Helper to add words for testing
  addWord(word: typeof words.$inferSelect) {
    this.words.push(word);
  }

  // Helper to update words for testing
  updateWord(word: typeof words.$inferSelect) {
    const index = this.words.findIndex((w) => w.id === word.id);
    if (index !== -1) {
      this.words[index] = word;
    }
  }
}

class InMemoryLearningRecordRepository implements LearningRecordRepository {
  private words: (typeof words.$inferSelect)[] = [];

  async findWordsToLearn(
    wordBookId: number,
  ): Promise<(typeof words.$inferSelect)[]> {
    const now = new Date();
    const filteredWords = this.words.filter((word) => {
      const isDueForReview = word.nextReviewDate <= now;
      const isMastered = word.consecutiveCorrectCount >= 5;
      const belongsToWordBook = word.wordBookId === wordBookId;

      return (
        belongsToWordBook &&
        (isDueForReview || word.consecutiveCorrectCount === 0) &&
        !isMastered
      );
    });

    return filteredWords;
  }

  async updateWordLearningData(
    wordId: number,
    consecutiveCorrectCount: number,
    nextReviewDate: Date,
  ): Promise<void> {
    const word = this.words.find((w) => w.id === wordId);
    if (word) {
      word.consecutiveCorrectCount = consecutiveCorrectCount;
      word.nextReviewDate = nextReviewDate;
    }
  }

  // Helper to add words for testing
  addWord(word: typeof words.$inferSelect) {
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
      const wordBookId = 1;
      const wordId = 1;
      const initialWord = {
        id: wordId,
        wordBookId: wordBookId,
        term: "test",
        meaning: "テスト",
        createdAt: new Date(),
        consecutiveCorrectCount: 0,
        nextReviewDate: new Date(),
      };
      wordRepository.addWord(initialWord);
      learningRecordRepository.addWord(initialWord);

      await service.recordLearningResult({ wordId, result: "correct" });

      const updatedWord = await wordRepository.findById(wordId);
      expect(updatedWord?.consecutiveCorrectCount).toBe(1);
      const expectedNextReviewDate1 = new Date();
      expectedNextReviewDate1.setDate(expectedNextReviewDate1.getDate() + 1); // 1日後に修正
      expect(updatedWord?.nextReviewDate.toDateString()).toBe(
        expectedNextReviewDate1.toDateString(),
      ); // 1 day + 1 day for next review
    });

    it("should reset consecutive count and next review date on incorrect result", async () => {
      const wordBookId = 1;
      const wordId = 1;
      const initialWord = {
        id: wordId,
        wordBookId: wordBookId,
        term: "test",
        meaning: "テスト",
        createdAt: new Date(),
        consecutiveCorrectCount: 2,
        nextReviewDate: new Date(new Date().getDate() + 4),
      };
      wordRepository.addWord(initialWord);
      learningRecordRepository.addWord(initialWord);

      await service.recordLearningResult({ wordId, result: "incorrect" });

      const updatedWord = await wordRepository.findById(wordId);
      expect(updatedWord?.consecutiveCorrectCount).toBe(0);
      const expectedNextReviewDate2 = new Date();
      expectedNextReviewDate2.setDate(expectedNextReviewDate2.getDate() + 0); // 0日後に修正
      expect(updatedWord?.nextReviewDate.toDateString()).toBe(
        expectedNextReviewDate2.toDateString(),
      ); // 1 day from now
    });
  });

  describe("getWordsToLearn", () => {
    it("should return words to learn based on next review date", async () => {
      const wordBookId = 1;
      const wordId1 = 101;
      const wordId2 = 102;

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
      expect(wordsToLearn[0].id).toBe(wordId1);
    });

    it("should not return mastered words", async () => {
      const wordBookId = 1;
      const wordId = 103;

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
      const wordBookId = 1;
      const wordId = 104;

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
      expect(wordsToLearn[0].id).toBe(wordId);
    });
  });
});
