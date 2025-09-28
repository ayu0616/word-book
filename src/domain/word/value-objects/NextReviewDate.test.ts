import { describe, expect, it } from "vitest";
import { NextReviewDate } from "./NextReviewDate";

describe("NextReviewDate", () => {
  it("should create a NextReviewDate instance with a Date object", () => {
    const date = new Date();
    const nextReviewDate = NextReviewDate.create(date);
    expect(nextReviewDate).toBeInstanceOf(NextReviewDate);
    expect(nextReviewDate.value).toBe(date);
  });

  it("should return true for equal NextReviewDate instances", () => {
    const date = new Date();
    const nextReviewDate1 = NextReviewDate.create(date);
    const nextReviewDate2 = NextReviewDate.create(date);
    expect(nextReviewDate1.equals(nextReviewDate2)).toBe(true);
  });

  it("should return false for different NextReviewDate instances", () => {
    const date1 = new Date("2023-01-01");
    const date2 = new Date("2023-01-02");
    const nextReviewDate1 = NextReviewDate.create(date1);
    const nextReviewDate2 = NextReviewDate.create(date2);
    expect(nextReviewDate1.equals(nextReviewDate2)).toBe(false);
  });
});
