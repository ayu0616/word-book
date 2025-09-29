import { describe, expect, it } from "vitest";
import { ConsecutiveCorrectCount } from "./ConsecutiveCorrectCount";

describe("ConsecutiveCorrectCount", () => {
  it("0以上の整数で生成できる", () => {
    expect(() => ConsecutiveCorrectCount.create(0)).not.toThrow();
    expect(() => ConsecutiveCorrectCount.create(5)).not.toThrow();
    const count = ConsecutiveCorrectCount.create(3);
    expect(count.value).toBe(3);
  });

  it("負の値ではエラーになる", () => {
    expect(() => ConsecutiveCorrectCount.create(-1)).toThrow(
      "ConsecutiveCorrectCount must be a non-negative integer",
    );
    expect(() => ConsecutiveCorrectCount.create(-100)).toThrow(
      "ConsecutiveCorrectCount must be a non-negative integer",
    );
  });

  it("小数ではエラーになる", () => {
    expect(() => ConsecutiveCorrectCount.create(1.5)).toThrow(
      "ConsecutiveCorrectCount must be a non-negative integer",
    );
    expect(() => ConsecutiveCorrectCount.create(-2.3)).toThrow(
      "ConsecutiveCorrectCount must be a non-negative integer",
    );
  });

  it("数値以外ではエラーになる", () => {
    // @ts-expect-error 整数以外
    expect(() => ConsecutiveCorrectCount.create("abc")).toThrow();
    // @ts-expect-error undefined
    expect(() => ConsecutiveCorrectCount.create(undefined)).toThrow();
    // @ts-expect-error null
    expect(() => ConsecutiveCorrectCount.create(null)).toThrow();
  });
});
