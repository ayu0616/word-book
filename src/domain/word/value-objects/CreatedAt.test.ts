import { describe, expect, it } from "vitest";
import { CreatedAt } from "./CreatedAt";

describe("CreatedAt", () => {
  it("should create a CreatedAt instance with a Date object", () => {
    const date = new Date();
    const createdAt = CreatedAt.create(date);
    expect(createdAt).toBeInstanceOf(CreatedAt);
    expect(createdAt.value).toBe(date);
  });

  it("should return true for equal CreatedAt instances", () => {
    const date = new Date();
    const createdAt1 = CreatedAt.create(date);
    const createdAt2 = CreatedAt.create(date);
    expect(createdAt1.equals(createdAt2)).toBe(true);
  });

  it("should return false for different CreatedAt instances", () => {
    const date1 = new Date("2023-01-01");
    const date2 = new Date("2023-01-02");
    const createdAt1 = CreatedAt.create(date1);
    const createdAt2 = CreatedAt.create(date2);
    expect(createdAt1.equals(createdAt2)).toBe(false);
  });
});
