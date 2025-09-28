import { describe, expect, it } from "vitest";
import { Term } from "./Term";

describe("Term", () => {
  it("should create a Term instance with a non-empty string", () => {
    const term = Term.create("hello");
    expect(term).toBeInstanceOf(Term);
    expect(term.value).toBe("hello");
  });

  it("should throw an error if term is empty", () => {
    expect(() => Term.create("")).toThrow("Term cannot be empty.");
  });

  it("should throw an error if term is only whitespace", () => {
    expect(() => Term.create("   ")).toThrow("Term cannot be empty.");
  });

  it("should return true for equal Term instances", () => {
    const term1 = Term.create("hello");
    const term2 = Term.create("hello");
    expect(term1.equals(term2)).toBe(true);
  });

  it("should return false for different Term instances", () => {
    const term1 = Term.create("hello");
    const term2 = Term.create("world");
    expect(term1.equals(term2)).toBe(false);
  });
});
