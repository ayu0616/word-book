import { ValueObject } from "../../../lib/value-object";

export class WordId extends ValueObject<number> {
  protected constructor(value: number) {
    super(value);
  }

  static create(id: number): WordId {
    if (id <= 0) {
      throw new Error("WordId must be a positive number.");
    }
    return new WordId(id);
  }
}
