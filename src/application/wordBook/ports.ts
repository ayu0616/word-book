import type { WordBook } from "@/domain/wordBook/entities";

export interface WordBookRepository {
  createWordBook(wordBook: WordBook): Promise<WordBook>;
  findWordBooksByUserId(userId: number): Promise<WordBook[]>;
  findWordBookById(id: number): Promise<WordBook | null>;
}
