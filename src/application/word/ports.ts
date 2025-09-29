import type { Word } from "@/domain/word/entities";
import type { WordBookId } from "@/domain/word/value-objects/WordBookId";
import type { WordId } from "@/domain/word/value-objects/WordId";

export interface WordRepository {
  createWord(word: Word): Promise<Word>;
  findWordsByWordBookId(wordBookId: WordBookId): Promise<Word[]>;
  findById(id: WordId): Promise<Word | undefined>;
  update(word: Word): Promise<void>;
  delete(id: WordId): Promise<void>;
}
