import { createId } from "@paralleldrive/cuid2";
import z from "zod";
import { ValueObject } from "@/lib/value-object";

export class Cuid extends ValueObject<string> {
  protected constructor(value: string) {
    super(value);
  }

  static from(id: string): Cuid {
    const parsed = z.cuid2().safeParse(id);
    if (!parsed.success) {
      throw new Error("Invalid cuid");
    }
    return new Cuid(id);
  }

  static create(): Cuid {
    const id = z.cuid2().parse(createId());
    return new Cuid(id);
  }
}
