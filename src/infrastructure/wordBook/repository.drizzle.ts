import { eq } from "drizzle-orm";
import type { WordBookRepository } from "@/application/wordBook/ports";
import { db } from "@/db";
import { wordBooks } from "@/db/schema";
import { WordBook } from "@/domain/wordBook/word-book.entity";

export class DrizzleWordBookRepository implements WordBookRepository {
  async create(wordBook: WordBook): Promise<WordBook> {
    const [newWordBook] = await db
      .insert(wordBooks)
      .values({
        userId: wordBook.userId,
        title: wordBook.title,
      })
      .returning();
    return WordBook.fromPersistence({
      id: newWordBook.id,
      userId: newWordBook.userId,
      title: newWordBook.title,
    });
  }

  async findWordBooksByUserId(userId: number): Promise<WordBook[]> {
    const result = await db
      .select()
      .from(wordBooks)
      .where(eq(wordBooks.userId, userId));
    return result.map((wb) => WordBook.fromPersistence(wb));
  }

  async findWordBookById(id: number): Promise<WordBook | null> {
    const [result] = await db
      .select()
      .from(wordBooks)
      .where(eq(wordBooks.id, id));
    if (!result) return null;
    return WordBook.fromPersistence(result);
  }

  async delete(id: number): Promise<void> {
    await db.delete(wordBooks).where(eq(wordBooks.id, id));
  }

  async updateTitle(id: number, title: string): Promise<void> {
    await db.update(wordBooks).set({ title }).where(eq(wordBooks.id, id));
  }
}
