import { describe, expect, it } from "vitest";
import { ValueObject } from "./value-object";

class TestValueObject extends ValueObject<string> {
  // create メソッドを追加
  static create(value: string): TestValueObject {
    return new TestValueObject(value);
  }
}

describe("ValueObject", () => {
  it("should return true for equal value objects", () => {
    const vo1 = TestValueObject.create("test"); // create メソッドを使用
    const vo2 = TestValueObject.create("test"); // create メソッドを使用
    expect(vo1.equals(vo2)).toBe(true);
  });

  it("should return false for different value objects", () => {
    const vo1 = TestValueObject.create("test1"); // create メソッドを使用
    const vo2 = TestValueObject.create("test2"); // create メソッドを使用
    expect(vo1.equals(vo2)).toBe(false);
  });

  it("should return false when comparing with undefined or null", () => {
    const vo1 = TestValueObject.create("test"); // create メソッドを使用
    expect(vo1.equals(undefined)).toBe(false);
    // @ts-expect-error
    expect(vo1.equals(null)).toBe(false);
  });

  it("should return false when comparing with a value object with undefined value", () => {
    const vo1 = TestValueObject.create("test"); // create メソッドを使用
    const vo2 = { value: undefined };
    // @ts-expect-error
    expect(vo1.equals(vo2)).toBe(false);
  });

  it("should return true for complex equal value objects", () => {
    class ComplexValueObject extends ValueObject<{ a: number; b: string }> {
      // create メソッドを追加
      static create(value: { a: number; b: string }): ComplexValueObject {
        return new ComplexValueObject(value);
      }
    }
    const vo1 = ComplexValueObject.create({ a: 1, b: "hello" }); // create メソッドを使用
    const vo2 = ComplexValueObject.create({ a: 1, b: "hello" }); // create メソッドを使用
    expect(vo1.equals(vo2)).toBe(true);
  });

  it("should return false for complex different value objects", () => {
    class ComplexValueObject extends ValueObject<{ a: number; b: string }> {
      // create メソッドを追加
      static create(value: { a: number; b: string }): ComplexValueObject {
        return new ComplexValueObject(value);
      }
    }
    const vo1 = ComplexValueObject.create({ a: 1, b: "hello" }); // create メソッドを使用
    const vo2 = ComplexValueObject.create({ a: 2, b: "world" }); // create メソッドを使用
    expect(vo1.equals(vo2)).toBe(false);
  });
});
