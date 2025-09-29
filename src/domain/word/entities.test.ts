import { createId } from "@paralleldrive/cuid2";
import { describe, expect, it } from "vitest";
import { Word } from "./entities";
import { CreatedAt } from "./value-objects/CreatedAt";
import { Meaning } from "./value-objects/Meaning";
import { NextReviewDate } from "./value-objects/NextReviewDate";
import { Term } from "./value-objects/Term";
import { WordBookId } from "./value-objects/WordBookId";
import { WordId } from "./value-objects/WordId";

describe("Word", () => {
  it("新しいWordインスタンスを生成できる", () => {
    const wordBookId = WordBookId.create(1);
    const term = Term.create("test");
    const meaning = Meaning.create("テスト");

    const word = Word.create({ wordBookId, term, meaning });

    expect(word).toBeInstanceOf(Word);
    expect(word.id).toBeInstanceOf(WordId);
    expect(word.wordBookId).toEqual(wordBookId);
    expect(word.term).toEqual(term);
    expect(word.meaning).toEqual(meaning);
    expect(word.createdAt).toBeInstanceOf(CreatedAt);
    expect(word.consecutiveCorrectCount.value).toBe(0);
    expect(word.nextReviewDate).toBeInstanceOf(NextReviewDate);
  });

  it("永続化データからWordインスタンスを生成できる", () => {
    const now = new Date();
    const wordId = createId();
    const word = Word.fromPersistence({
      id: wordId,
      wordBookId: 1,
      term: "persisted",
      meaning: "永続化された",
      createdAt: now,
      consecutiveCorrectCount: 0,
      nextReviewDate: now,
    });

    expect(word).toBeInstanceOf(Word);
    expect(word.id).toBeInstanceOf(WordId);
    expect(word.id?.value).toBe(wordId);
    expect(word.wordBookId).toBeInstanceOf(WordBookId);
    expect(word.wordBookId.value).toBe(1);
    expect(word.term).toBeInstanceOf(Term);
    expect(word.term.value).toBe("persisted");
    expect(word.meaning).toBeInstanceOf(Meaning);
    expect(word.meaning.value).toBe("永続化された");
    expect(word.createdAt).toBeInstanceOf(CreatedAt);
    expect(word.createdAt.value).toEqual(now);
    expect(word.consecutiveCorrectCount.value).toBe(0);
    expect(word.nextReviewDate).toBeInstanceOf(NextReviewDate);
    expect(word.nextReviewDate.value).toEqual(now);
  });

  it("正解時に連続正解数と次回復習日が正しく更新される", () => {
    const _wordBookId = WordBookId.create(1);
    const _term = Term.create("test");
    const _meaning = Meaning.create("テスト");
    const initialDate = new Date("2025-01-01T00:00:00.000Z");

    // fromPersistenceの引数はプリミティブ型で渡す
    const word = Word.fromPersistence({
      id: createId(),
      wordBookId: 1,
      term: "test",
      meaning: "テスト",
      createdAt: initialDate,
      consecutiveCorrectCount: 0,
      nextReviewDate: initialDate,
    });

    word.markAsCorrect();
    expect(word.consecutiveCorrectCount.value).toBe(1);
    // 1日後
    const expectedDate1 = new Date();
    expectedDate1.setDate(expectedDate1.getDate() + 1);
    expect(word.nextReviewDate.value.toDateString()).toBe(
      expectedDate1.toDateString(),
    );

    word.markAsCorrect();
    expect(word.consecutiveCorrectCount.value).toBe(2);
    // 2日後
    const expectedDate2 = new Date();
    expectedDate2.setDate(expectedDate2.getDate() + 2);
    expect(word.nextReviewDate.value.toDateString()).toBe(
      expectedDate2.toDateString(),
    );
  });

  it("不正解時に連続正解数がリセットされ次回復習日が当日になる", () => {
    const _wordBookId = WordBookId.create(1);
    const _term = Term.create("test");
    const _meaning = Meaning.create("テスト");
    const initialDate = new Date("2025-01-01T00:00:00.000Z");

    // fromPersistenceの引数はプリミティブ型で渡す
    const word = Word.fromPersistence({
      id: createId(),
      wordBookId: 1,
      term: "test",
      meaning: "テスト",
      createdAt: initialDate,
      consecutiveCorrectCount: 2,
      nextReviewDate: new Date("2025-01-04T00:00:00.000Z"),
    });

    word.markAsIncorrect();
    expect(word.consecutiveCorrectCount).toBe(0);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate());
    expect(word.nextReviewDate.value.toDateString()).toBe(
      expectedDate.toDateString(),
    );
  });
});
