import { ValueObject } from "../../../lib/value-object";

export class NextReviewDate extends ValueObject<Date> {
  protected constructor(value: Date) {
    super(value);
  }

  static create(date: Date): NextReviewDate {
    return new NextReviewDate(date);
  }
}
