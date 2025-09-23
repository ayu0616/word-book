import type { Word } from "@/domain/word/entities";

export interface WordRepository {
  createWord(word: Word): Promise<Word>;
  findWordsByWordBookId(wordBookId: number): Promise<Word[]>;
  findById(id: number): Promise<Word | undefined>;
  update(word: Word): Promise<void>;
  delete(id: number): Promise<void>;
}
