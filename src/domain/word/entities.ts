import { ConsecutiveCorrectCount } from "./value-objects/ConsecutiveCorrectCount";
import { CreatedAt } from "./value-objects/CreatedAt";
import { Meaning } from "./value-objects/Meaning";
import { NextReviewDate } from "./value-objects/NextReviewDate";
import { Term } from "./value-objects/Term";
import { WordBookId } from "./value-objects/WordBookId";
import { WordId } from "./value-objects/WordId";

export interface WordProps {
  id: string;
  wordBookId: number;
  term: string;
  meaning: string;
  createdAt: Date;
  consecutiveCorrectCount: number;
  nextReviewDate: Date;
}

export class Word {
  readonly id: WordId;
  readonly wordBookId: WordBookId;
  readonly term: Term;
  readonly meaning: Meaning;
  readonly createdAt: CreatedAt;
  readonly consecutiveCorrectCount: ConsecutiveCorrectCount;
  readonly nextReviewDate: NextReviewDate;

  protected constructor(
    id: WordId,
    wordBookId: WordBookId,
    term: Term,
    meaning: Meaning,
    createdAt: CreatedAt,
    consecutiveCorrectCount: ConsecutiveCorrectCount,
    nextReviewDate: NextReviewDate,
  ) {
    this.id = id;
    this.wordBookId = wordBookId;
    this.term = term;
    this.meaning = meaning;
    this.createdAt = createdAt;
    this.consecutiveCorrectCount = consecutiveCorrectCount;
    this.nextReviewDate = nextReviewDate;
  }

  static create(props: {
    wordBookId: WordBookId;
    term: Term;
    meaning: Meaning;
  }): Word {
    return new Word(
      WordId.create(),
      props.wordBookId,
      props.term,
      props.meaning,
      CreatedAt.create(new Date()),
      ConsecutiveCorrectCount.from(0),
      NextReviewDate.create(new Date()),
    );
  }

  static fromPersistence(props: WordProps): Word {
    return new Word(
      WordId.from(props.id),
      WordBookId.create(props.wordBookId),
      Term.create(props.term),
      Meaning.create(props.meaning),
      CreatedAt.create(props.createdAt),
      ConsecutiveCorrectCount.from(props.consecutiveCorrectCount),
      NextReviewDate.create(props.nextReviewDate),
    );
  }

  markAsCorrect(): void {
    const newConsecutiveCorrectCount = this.consecutiveCorrectCount.add();
    const newNextReviewDate = newConsecutiveCorrectCount.nextReviewDate();
    Object.assign(this, {
      consecutiveCorrectCount: newConsecutiveCorrectCount,
      nextReviewDate: NextReviewDate.create(newNextReviewDate),
    });
  }

  markAsIncorrect(): void {
    Object.assign(this, {
      consecutiveCorrectCount: 0,
      nextReviewDate: NextReviewDate.create(new Date()),
    });
  }

  toJson(): WordProps {
    return {
      id: this.id.value,
      wordBookId: this.wordBookId.value,
      term: this.term.value,
      meaning: this.meaning.value,
      createdAt: this.createdAt.value,
      consecutiveCorrectCount: this.consecutiveCorrectCount.value,
      nextReviewDate: this.nextReviewDate.value,
    };
  }
}
