import { describe, expect, it } from "vitest";
import { WordBookId } from "./WordBookId";

describe("WordBookId", () => {
  it("should create a WordBookId instance with a positive number", () => {
    const wordBookId = WordBookId.create(1);
    expect(wordBookId).toBeInstanceOf(WordBookId);
    expect(wordBookId.value).toBe(1);
  });

  it("should throw an error if id is not a positive number", () => {
    expect(() => WordBookId.create(0)).toThrow(
      "WordBookId must be a positive number.",
    );
    expect(() => WordBookId.create(-1)).toThrow(
      "WordBookId must be a positive number.",
    );
  });

  it("should return true for equal WordBookId instances", () => {
    const wordBookId1 = WordBookId.create(1);
    const wordBookId2 = WordBookId.create(1);
    expect(wordBookId1.equals(wordBookId2)).toBe(true);
  });

  it("should return false for different WordBookId instances", () => {
    const wordBookId1 = WordBookId.create(1);
    const wordBookId2 = WordBookId.create(2);
    expect(wordBookId1.equals(wordBookId2)).toBe(false);
  });
});
