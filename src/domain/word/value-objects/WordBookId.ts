import { ValueObject } from "../../../lib/value-object";

export class WordBookId extends ValueObject<number> {
  protected constructor(value: number) {
    super(value);
  }

  static create(id: number): WordBookId {
    if (id <= 0) {
      throw new Error("WordBookId must be a positive number.");
    }
    return new WordBookId(id);
  }
}
