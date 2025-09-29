import z from "zod";
import { ValueObject } from "../../../lib/value-object";

export class ConsecutiveCorrectCount extends ValueObject<number> {
  protected constructor(value: number) {
    super(value);
  }

  static create(value: number): ConsecutiveCorrectCount {
    const schema = z
      .int({
        error: "ConsecutiveCorrectCount must be a non-negative integer",
      })
      .nonnegative({
        message: "ConsecutiveCorrectCount must be a non-negative integer",
      });
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }
    return new ConsecutiveCorrectCount(parsed.data);
  }
}
