import { eq } from "drizzle-orm";
import type { WordRepository } from "@/application/word/ports";
import { db } from "@/db";
import { words } from "@/db/schema";
import { Word } from "@/domain/word/entities";

export class DrizzleWordRepository implements WordRepository {
  async createWord(word: Word): Promise<Word> {
    const [newWord] = await db
      .insert(words)
      .values({
        wordBookId: word.wordBookId,
        term: word.term,
        meaning: word.meaning,
        createdAt: word.createdAt,
      })
      .returning();
    return Word.fromPersistence({
      id: newWord.id,
      wordBookId: newWord.wordBookId,
      term: newWord.term,
      meaning: newWord.meaning,
      createdAt: newWord.createdAt,
    });
  }

  async findWordsByWordBookId(wordBookId: number): Promise<Word[]> {
    const result = await db
      .select()
      .from(words)
      .where(eq(words.wordBookId, wordBookId));
    return result.map((w) => Word.fromPersistence(w));
  }
}
