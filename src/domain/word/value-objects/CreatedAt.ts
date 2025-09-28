import { ValueObject } from "../../../lib/value-object";

export class CreatedAt extends ValueObject<Date> {
  protected constructor(value: Date) {
    super(value);
  }

  static create(date: Date): CreatedAt {
    return new CreatedAt(date);
  }
}
