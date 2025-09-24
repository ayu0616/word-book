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

  async findWordsByWordBookId(wordBookId: number): Promise<Word[]> {
    return this.repo.findWordsByWordBookId(wordBookId);
  }

  async findById(id: number): Promise<Word | undefined> {
    return this.repo.findById(id);
  }

  async updateWord(input: {
    id: number;
    term: string;
    meaning: string;
  }): Promise<Word> {
    const existingWord = await this.repo.findById(input.id);
    if (!existingWord) {
      throw new Error("Word not found");
    }

    const updatedWord = Word.fromPersistence({
      id: existingWord.id,
      wordBookId: existingWord.wordBookId,
      term: input.term,
      meaning: input.meaning,
      createdAt: existingWord.createdAt,
      consecutiveCorrectCount: existingWord.consecutiveCorrectCount,
      nextReviewDate: existingWord.nextReviewDate,
    });

    await this.repo.update(updatedWord);
    return updatedWord;
  }

  async deleteWord(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async importWordsFromCsv(
    wordBookId: number,
    csvContent: string,
  ): Promise<Word[]> {
    const lines = csvContent.split("\n").filter((line) => line.trim() !== "");
    const importedWords: Word[] = [];

    for (const line of lines) {
      const [term, meaning] = line.split(",").map((s) => s.trim());

      if (term && meaning) {
        const word = Word.create({ wordBookId, term, meaning });
        await this.repo.createWord(word);
        importedWords.push(word);
      } else {
        console.warn(`Skipping malformed CSV line: ${line}`);
      }
    }
    return importedWords;
  }
}
