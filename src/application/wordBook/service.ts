import { WordBook } from "@/domain/wordBook/entities";
import type { WordBookRepository } from "./ports";

export class WordBookService {
  constructor(private readonly repo: WordBookRepository) {}

  async create(input: { userId: number; title: string }): Promise<WordBook> {
    const wordBook = WordBook.create(input);
    return this.repo.create(wordBook);
  }

  async findWordBooksByUserId(userId: number): Promise<WordBook[]> {
    return this.repo.findWordBooksByUserId(userId);
  }

  async findWordBookById(id: number): Promise<WordBook | null> {
    return this.repo.findWordBookById(id);
  }
}
