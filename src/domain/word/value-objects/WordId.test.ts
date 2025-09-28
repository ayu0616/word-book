import { describe, expect, it } from "vitest";
import { WordId } from "./WordId";

describe("WordId", () => {
  it("should create a WordId instance with a positive number", () => {
    const wordId = WordId.create(1);
    expect(wordId).toBeInstanceOf(WordId);
    expect(wordId.value).toBe(1);
  });

  it("should throw an error if id is not a positive number", () => {
    expect(() => WordId.create(0)).toThrow("WordId must be a positive number.");
    expect(() => WordId.create(-1)).toThrow(
      "WordId must be a positive number.",
    );
  });

  it("should return true for equal WordId instances", () => {
    const wordId1 = WordId.create(1);
    const wordId2 = WordId.create(1);
    expect(wordId1.equals(wordId2)).toBe(true);
  });

  it("should return false for different WordId instances", () => {
    const wordId1 = WordId.create(1);
    const wordId2 = WordId.create(2);
    expect(wordId1.equals(wordId2)).toBe(false);
  });
});
