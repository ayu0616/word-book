import { describe, expect, it } from "vitest";
import { WordBookId } from "./word-book-id";

describe("WordBookId", () => {
  it("有効なcuid2形式のIDでWordBookIdインスタンスを生成できる", () => {
    // cuid2の例: "cklb5z0z70001h8v4gk5q7x1r"
    const validCuid2 = "cklb5z0z70001h8v4gk5q7x1r";
    const wordBookId = WordBookId.from(validCuid2);
    expect(wordBookId).toBeInstanceOf(WordBookId);
    expect(wordBookId.value).toBe(validCuid2);
  });

  it("無効なIDの場合はエラーを投げる", () => {
    expect(() => WordBookId.from("invalid-id")).toThrow(
      "WordBookIdは有効なcuid2形式でなければなりません。",
    );
    expect(() => WordBookId.from("")).toThrow(
      "WordBookIdは有効なcuid2形式でなければなりません。",
    );
  });

  it("同じ値のWordBookId同士は等価とみなされる", () => {
    const cuid = "cklb5z0z70001h8v4gk5q7x1r";
    const wordBookId1 = WordBookId.from(cuid);
    const wordBookId2 = WordBookId.from(cuid);
    expect(wordBookId1.equals(wordBookId2)).toBe(true);
  });

  it("異なる値のWordBookId同士は等価でない", () => {
    const wordBookId1 = WordBookId.from("cklb5z0z70001h8v4gk5q7x1r");
    const wordBookId2 = WordBookId.from("cklb5z0z70001h8v4gk5q7x1s");
    expect(wordBookId1.equals(wordBookId2)).toBe(false);
  });
});
