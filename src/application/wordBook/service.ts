import { WordBook } from "@/domain/wordBook/entities";
import type { WordBookRepository } from "./ports";

export class WordBookService {
  constructor(private readonly repo: WordBookRepository) {}

  async createWordBook(input: {
    userId: number;
    title: string;
  }): Promise<WordBook> {
    const wordBook = WordBook.create(input);
    return this.repo.createWordBook(wordBook);
  }

  async findWordBooksByUserId(userId: number): Promise<WordBook[]> {
    return this.repo.findWordBooksByUserId(userId);
  }
}
