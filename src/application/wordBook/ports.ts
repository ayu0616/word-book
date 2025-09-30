import type { WordBook } from "@/domain/wordBook/word-book.entity";

export interface WordBookRepository {
  findWordBooksByUserId(userId: number): Promise<WordBook[]>;
  findWordBookById(id: string): Promise<WordBook | null>;
  create(wordBook: WordBook): Promise<WordBook>;
  delete(id: string): Promise<void>;
  updateTitle(id: string, title: string): Promise<void>;
}
