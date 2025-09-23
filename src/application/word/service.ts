import { Word } from "@/domain/word/entities";
import type { WordRepository } from "./ports";

export class WordService {
  constructor(private readonly repo: WordRepository) {}

  async createWord(input: {
    wordBookId: number;
    term: string;
    meaning: string;
  }): Promise<Word> {
    const word = Word.create(input);
    return this.repo.createWord(word);
  }
}
