import { Cuid } from "@/domain/common/cuid";

export class WordId extends Cuid {
  static from(id: string): WordId {
    const parsed = Cuid.from(id);
    return new WordId(parsed.value);
  }

  static create(): WordId {
    const created = Cuid.create();
    return new WordId(created.value);
  }
}
