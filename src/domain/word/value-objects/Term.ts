import { ValueObject } from "../../../lib/value-object";

export class Term extends ValueObject<string> {
  protected constructor(value: string) {
    super(value);
  }

  static create(term: string): Term {
    if (!term || term.trim() === "") {
      throw new Error("Term cannot be empty.");
    }
    return new Term(term);
  }
}
