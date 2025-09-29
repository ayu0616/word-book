import z from "zod";
import { ValueObject } from "../../../lib/value-object";

export class ConsecutiveCorrectCount extends ValueObject<number> {
  protected constructor(value: number) {
    super(value);
  }

  static from(value: number): ConsecutiveCorrectCount {
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

  add(): ConsecutiveCorrectCount {
    return new ConsecutiveCorrectCount(this.value + 1);
  }

  nextReviewDate(): Date {
    const now = new Date();
    const daysToAdd = 2 ** (this.value - 1);
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);
    return nextReviewDate;
  }
}
