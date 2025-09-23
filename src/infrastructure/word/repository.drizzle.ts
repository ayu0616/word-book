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
      consecutiveCorrectCount: newWord.consecutiveCorrectCount,
      nextReviewDate: newWord.nextReviewDate,
    });
  }

  async findById(id: number): Promise<Word | undefined> {
    const [result] = await db
      .select()
      .from(words)
      .where(eq(words.id, id))
      .limit(1);
    return result
      ? Word.fromPersistence({
          id: result.id,
          wordBookId: result.wordBookId,
          term: result.term,
          meaning: result.meaning,
          createdAt: result.createdAt,
          consecutiveCorrectCount: result.consecutiveCorrectCount,
          nextReviewDate: result.nextReviewDate,
        })
      : undefined;
  }

  async findWordsByWordBookId(wordBookId: number): Promise<Word[]> {
    const result = await db
      .select()
      .from(words)
      .where(eq(words.wordBookId, wordBookId));
    return result.map((w) =>
      Word.fromPersistence({
        id: w.id,
        wordBookId: w.wordBookId,
        term: w.term,
        meaning: w.meaning,
        createdAt: w.createdAt,
        consecutiveCorrectCount: w.consecutiveCorrectCount,
        nextReviewDate: w.nextReviewDate,
      }),
    );
  }
}
