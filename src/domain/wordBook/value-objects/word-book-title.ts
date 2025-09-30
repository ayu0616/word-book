import z from "zod";
import { ValueObject } from "@/lib/value-object";

export class WordBookTitle extends ValueObject<string> {
  private static readonly MAX_LENGTH = 255;
  private static readonly schema = z
    .string()
    .min(1)
    .max(WordBookTitle.MAX_LENGTH);

  protected constructor(value: string) {
    super(value);
  }

  static from(title: string): WordBookTitle {
    const result = WordBookTitle.schema.safeParse(title);
    if (!result.success) {
      throw new Error("Invalid word book title");
    }
    return new WordBookTitle(title);
  }
}
