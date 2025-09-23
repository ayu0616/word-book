export type LearningRecordProps = {
  id: number;
  wordId: number;
  recordDate: Date;
  result: "correct" | "incorrect";
  consecutiveCorrectCount: number;
  nextReviewDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class LearningRecord {
  readonly id: number;
  readonly wordId: number;
  readonly recordDate: Date;
  readonly result: "correct" | "incorrect";
  readonly consecutiveCorrectCount: number;
  readonly nextReviewDate: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: LearningRecordProps) {
    this.id = props.id;
    this.wordId = props.wordId;
    this.recordDate = props.recordDate;
    this.result = props.result;
    this.consecutiveCorrectCount = props.consecutiveCorrectCount;
    this.nextReviewDate = props.nextReviewDate;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
