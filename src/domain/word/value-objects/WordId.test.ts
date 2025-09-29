import { describe, expect, it } from "vitest";
import z from "zod";
import { WordId } from "./WordId";

describe("WordId", () => {
  it("cuid2形式のIDでWordIdインスタンスを生成できる", () => {
    const cuid = "cklb5z0z70001h8l4b8b8b8b8";
    const wordId = WordId.from(cuid);
    expect(wordId).toBeInstanceOf(WordId);
    expect(wordId.value).toBe(cuid);
  });

  it("不正なcuid2形式のIDの場合はエラーを投げる", () => {
    expect(() => WordId.from("")).toThrow("Invalid cuid");
    expect(() => WordId.from("not-a-cuid2")).toThrow("Invalid cuid");
  });

  it("同じ値のWordIdインスタンスはequalsでtrueを返す", () => {
    const cuid = "cklb5z0z70001h8l4b8b8b8b8";
    const wordId1 = WordId.from(cuid);
    const wordId2 = WordId.from(cuid);
    expect(wordId1.equals(wordId2)).toBe(true);
  });

  it("異なる値のWordIdインスタンスはequalsでfalseを返す", () => {
    const wordId1 = WordId.from("cklb5z0z70001h8l4b8b8b8b8");
    const wordId2 = WordId.from("cklb5z0z70002h8l4b8b8b8b9");
    expect(wordId1.equals(wordId2)).toBe(false);
  });

  it("create()で生成したIDはcuid2形式である", () => {
    const wordId = WordId.create();
    // cuid2は25文字程度の英数字で始まる
    expect(typeof wordId.value).toBe("string");
    expect(wordId.value.length).toBeGreaterThanOrEqual(20);
    expect(() => z.cuid2().parse(wordId.value)).not.toThrow();
  });
});
