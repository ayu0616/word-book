import type { WordBook } from "@/domain/wordBook/word-book.entity";

export interface WordBookRepository {
  findWordBooksByUserId(userId: number): Promise<WordBook[]>;
  findWordBookById(id: number): Promise<WordBook | null>;
  create(wordBook: WordBook): Promise<WordBook>;
  delete(id: number): Promise<void>;
  updateTitle(id: number, title: string): Promise<void>;
}
