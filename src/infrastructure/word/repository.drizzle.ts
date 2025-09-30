import { eq } from "drizzle-orm";
import type { WordRepository } from "@/application/word/ports";
import { db } from "@/db";
import { words } from "@/db/schema";
import { Word } from "@/domain/word/entities";
import type { WordId } from "@/domain/word/value-objects/WordId";
import type { WordBookId } from "@/domain/wordBook/value-objects/word-book-id";

export class DrizzleWordRepository implements WordRepository {
  async createWord(word: Word): Promise<Word> {
    const [newWord] = await db
      .insert(words)
      .values({
        id: word.id.value,
        wordBookId: word.wordBookId.value,
        term: word.term.value,
        meaning: word.meaning.value,
        createdAt: word.createdAt.value,
        consecutiveCorrectCount: word.consecutiveCorrectCount.value,
        nextReviewDate: word.nextReviewDate.value,
      })
      .returning();
    return Word.fromPersistence({
      id: newWord.id,
      wordBookId: newWord.wordBookId,
      term: newWord.term,
      meaning: newWord.meaning,
      createdAt: new Date(newWord.createdAt),
      consecutiveCorrectCount: newWord.consecutiveCorrectCount,
      nextReviewDate: new Date(newWord.nextReviewDate),
    });
  }

  async findById(id: WordId): Promise<Word | undefined> {
    const [result] = await db
      .select()
      .from(words)
      .where(eq(words.id, id.value))
      .limit(1);
    return result
      ? Word.fromPersistence({
          id: result.id,
          wordBookId: result.wordBookId,
          term: result.term,
          meaning: result.meaning,
          createdAt: new Date(result.createdAt),
          consecutiveCorrectCount: result.consecutiveCorrectCount,
          nextReviewDate: new Date(result.nextReviewDate),
        })
      : undefined;
  }

  async findWordsByWordBookId(wordBookId: WordBookId): Promise<Word[]> {
    const result = await db
      .select()
      .from(words)
      .where(eq(words.wordBookId, wordBookId.value));
    return result.map((w) =>
      Word.fromPersistence({
        id: w.id,
        wordBookId: w.wordBookId,
        term: w.term,
        meaning: w.meaning,
        createdAt: new Date(w.createdAt),
        consecutiveCorrectCount: w.consecutiveCorrectCount,
        nextReviewDate: new Date(w.nextReviewDate),
      }),
    );
  }

  async update(word: Word): Promise<void> {
    if (!word.id) {
      throw new Error("Word ID is required for update.");
    }
    await db
      .update(words)
      .set({
        term: word.term.value,
        meaning: word.meaning.value,
        consecutiveCorrectCount: word.consecutiveCorrectCount.value,
        nextReviewDate: word.nextReviewDate.value,
      })
      .where(eq(words.id, word.id.value));
  }

  async delete(id: WordId): Promise<void> {
    await db.delete(words).where(eq(words.id, id.value));
  }
}
