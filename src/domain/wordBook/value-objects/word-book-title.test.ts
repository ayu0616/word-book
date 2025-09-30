import { describe, expect, it } from "vitest";
import { WordBookTitle } from "./word-book-title";

describe("WordBookTitle", () => {
  it("should create a WordBookTitle instance with a valid title", () => {
    const title = "My Awesome Word Book";
    const wordBookTitle = WordBookTitle.from(title);
    expect(wordBookTitle).toBeInstanceOf(WordBookTitle);
    expect(wordBookTitle.value).toBe(title);
  });

  it("should throw an error for an empty title", () => {
    const title = "";
    expect(() => WordBookTitle.from(title)).toThrow("Invalid word book title");
  });

  it("should throw an error for a title exceeding max length", () => {
    const longTitle = "a".repeat(256); // MAX_LENGTH is 255
    expect(() => WordBookTitle.from(longTitle)).toThrow(
      "Invalid word book title",
    );
  });

  it("should create a WordBookTitle instance with a title at max length", () => {
    const maxLengthTitle = "a".repeat(255);
    const wordBookTitle = WordBookTitle.from(maxLengthTitle);
    expect(wordBookTitle).toBeInstanceOf(WordBookTitle);
    expect(wordBookTitle.value).toBe(maxLengthTitle);
  });
});
