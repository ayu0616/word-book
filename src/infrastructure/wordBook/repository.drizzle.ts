import { eq } from "drizzle-orm";
import type { WordBookRepository } from "@/application/wordBook/ports";
import { db } from "@/db";
import { wordBooks } from "@/db/schema";
import { WordBook } from "@/domain/wordBook/entities";

export class DrizzleWordBookRepository implements WordBookRepository {
  async createWordBook(wordBook: WordBook): Promise<WordBook> {
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
}
