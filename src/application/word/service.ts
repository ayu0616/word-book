import { Word } from "@/domain/word/entities";
import { Meaning } from "@/domain/word/value-objects/Meaning";
import { Term } from "@/domain/word/value-objects/Term";
import type { WordId } from "@/domain/word/value-objects/WordId";
import type { WordBookId } from "@/domain/wordBook/value-objects/word-book-id";
import type { WordRepository } from "./ports";

export class WordService {
  constructor(private readonly repo: WordRepository) {}

  async createWord(input: {
    wordBookId: WordBookId;
    term: Term;
    meaning: Meaning;
  }): Promise<Word> {
    const word = Word.create(input);
    return this.repo.createWord(word);
  }

  async findWordsByWordBookId(wordBookId: WordBookId): Promise<Word[]> {
    return this.repo.findWordsByWordBookId(wordBookId);
  }

  async findById(id: WordId): Promise<Word | undefined> {
    return this.repo.findById(id);
  }

  async updateWord(input: {
    id: WordId;
    term: Term;
    meaning: Meaning;
  }): Promise<Word> {
    const existingWord = await this.repo.findById(input.id);
    if (!existingWord) {
      throw new Error("Word not found");
    }

    const updatedWord = Word.fromPersistence({
      id: existingWord.id.value,
      wordBookId: existingWord.wordBookId.value,
      term: input.term.value,
      meaning: input.meaning.value,
      createdAt: existingWord.createdAt.value,
      consecutiveCorrectCount: existingWord.consecutiveCorrectCount.value,
      nextReviewDate: existingWord.nextReviewDate.value,
    });

    await this.repo.update(updatedWord);
    return updatedWord;
  }

  async deleteWord(id: WordId): Promise<void> {
    await this.repo.delete(id);
  }

  async importWordsFromCsv(
    wordBookId: WordBookId,
    csvContent: string,
  ): Promise<Word[]> {
    const lines = csvContent.split("\n").filter((line) => line.trim() !== "");
    const importedWords: Word[] = [];

    for (const line of lines) {
      const [termStr, meaningStr] = line.split(",").map((s) => s.trim());

      if (termStr && meaningStr) {
        const term = Term.create(termStr);
        const meaning = Meaning.create(meaningStr);
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
