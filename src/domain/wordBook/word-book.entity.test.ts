import { createId } from "@paralleldrive/cuid2";
import { describe, expect, it } from "vitest";
import { WordBook } from "./word-book.entity";

describe("WordBook", () => {
  it("should create a new WordBook instance", () => {
    const wordBook = WordBook.create({
      userId: 1,
      title: "My First WordBook",
    });

    expect(wordBook).toBeInstanceOf(WordBook);
    expect(wordBook.id).toBeTypeOf("string"); // id is a cuid2 string
    expect(wordBook.userId).toBe(1);
    expect(wordBook.title).toBe("My First WordBook");
  });

  it("should create a WordBook instance from persistence", () => {
    const wordBookId = createId();
    const wordBook = WordBook.fromPersistence({
      id: wordBookId,
      userId: 2,
      title: "Persisted WordBook",
    });

    expect(wordBook).toBeInstanceOf(WordBook);
    expect(wordBook.id).toBe(wordBookId);
    expect(wordBook.userId).toBe(2);
    expect(wordBook.title).toBe("Persisted WordBook");
  });
});
