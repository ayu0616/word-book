import { Word } from "@/domain/word/entities";
import type { WordRepository } from "./ports";

export class WordService {
  constructor(private readonly repo: WordRepository) {}

  async createWord(input: {
    wordBookId: number;
    term: string;
    meaning: string;
  }): Promise<Word> {
    const word = Word.create(input);
    return this.repo.createWord(word);
  }

  async findWordsByWordBookId(wordBookId: number): Promise<Word[]> {
    return this.repo.findWordsByWordBookId(wordBookId);
  }

  async findById(id: number): Promise<Word | undefined> {
    return this.repo.findById(id);
  }

  async updateWord(input: {
    id: number;
    term: string;
    meaning: string;
  }): Promise<Word> {
    const existingWord = await this.repo.findById(input.id);
    if (!existingWord) {
      throw new Error("Word not found");
    }

    const updatedWord = Word.fromPersistence({
      id: existingWord.id,
      wordBookId: existingWord.wordBookId,
      term: input.term,
      meaning: input.meaning,
      createdAt: existingWord.createdAt,
      consecutiveCorrectCount: existingWord.consecutiveCorrectCount,
      nextReviewDate: existingWord.nextReviewDate,
    });

    await this.repo.update(updatedWord);
    return updatedWord;
  }
}
