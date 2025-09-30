import { createId } from "@paralleldrive/cuid2";
import z from "zod";
import { ValueObject } from "../../../lib/value-object";

export class WordBookId extends ValueObject<string> {
  protected constructor(value: string) {
    super(value);
  }

  static from(id: string): WordBookId {
    const schema = z.cuid2();
    const result = schema.safeParse(id);
    if (!result.success) {
      throw new Error("WordBookIdは有効なcuid2形式でなければなりません。");
    }
    return new WordBookId(id);
  }

  static create(): WordBookId {
    return new WordBookId(z.cuid2().parse(createId()));
  }
}
