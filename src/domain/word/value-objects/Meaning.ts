import { ValueObject } from "../../../lib/value-object";

export class Meaning extends ValueObject<string> {
  protected constructor(value: string) {
    super(value);
  }

  static create(meaning: string): Meaning {
    if (!meaning || meaning.trim() === "") {
      throw new Error("Meaning cannot be empty.");
    }
    return new Meaning(meaning);
  }
}
