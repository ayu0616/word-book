import type { Word } from "@/domain/word/entities";
import type { WordId } from "@/domain/word/value-objects/WordId";
import type { WordBookId } from "@/domain/wordBook/value-objects/word-book-id";

export interface WordRepository {
  createWord(word: Word): Promise<Word>;
  findWordsByWordBookId(wordBookId: WordBookId): Promise<Word[]>;
  findById(id: WordId): Promise<Word | undefined>;
  update(word: Word): Promise<void>;
  delete(id: WordId): Promise<void>;
}
