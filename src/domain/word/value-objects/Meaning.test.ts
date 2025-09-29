import { describe, expect, it } from "vitest";
import { Meaning } from "./Meaning";

describe("Meaning", () => {
  it("should create a Meaning instance with a non-empty string", () => {
    const meaning = Meaning.create("意味");
    expect(meaning).toBeInstanceOf(Meaning);
    expect(meaning.value).toBe("意味");
  });

  it("should throw an error if meaning is empty", () => {
    expect(() => Meaning.create("")).toThrow("Meaning cannot be empty.");
  });

  it("should throw an error if meaning is only whitespace", () => {
    expect(() => Meaning.create("   ")).toThrow("Meaning cannot be empty.");
  });

  it("should return true for equal Meaning instances", () => {
    const meaning1 = Meaning.create("意味1");
    const meaning2 = Meaning.create("意味1");
    expect(meaning1.equals(meaning2)).toBe(true);
  });

  it("should return false for different Meaning instances", () => {
    const meaning1 = Meaning.create("意味1");
    const meaning2 = Meaning.create("意味2");
    expect(meaning1.equals(meaning2)).toBe(false);
  });
});
