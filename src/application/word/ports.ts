import type { Word } from "@/domain/word/entities";

export interface WordRepository {
  createWord(word: Word): Promise<Word>;
  findWordsByWordBookId(wordBookId: number): Promise<Word[]>;
}
