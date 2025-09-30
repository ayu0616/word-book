import { createId } from "@paralleldrive/cuid2";
import { describe, expect, it } from "vitest";
import { WordBookId } from "./value-objects/word-book-id";
import { WordBookTitle } from "./value-objects/word-book-title";
import { WordBook } from "./word-book.entity";

describe("WordBook", () => {
  it("should create a new WordBook instance", () => {
    const wordBook = WordBook.create({
      userId: 1,
      title: "My First WordBook",
    });

    expect(wordBook).toBeInstanceOf(WordBook);
    expect(wordBook.id).toBeInstanceOf(WordBookId);
    expect(wordBook.id.value).toBeDefined();
    expect(wordBook.userId).toBe(1);
    expect(wordBook.title).toBeInstanceOf(WordBookTitle);
    expect(wordBook.title.value).toBe("My First WordBook");
  });

  it("should create a WordBook instance from persistence", () => {
    const wordBookId = createId();
    const wordBook = WordBook.fromPersistence({
      id: wordBookId,
      userId: 2,
      title: "Persisted WordBook",
    });

    expect(wordBook).toBeInstanceOf(WordBook);
    expect(wordBook.id.value).toBe(wordBookId);
    expect(wordBook.userId).toBe(2);
    expect(wordBook.title.value).toBe("Persisted WordBook");
  });
});
