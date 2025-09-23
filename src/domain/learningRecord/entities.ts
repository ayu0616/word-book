export type LearningRecordProps = {
  id: number;
  wordId: number;
  recordDate: Date;
  result: "correct" | "incorrect";
  createdAt: Date;
  updatedAt: Date;
};

export class LearningRecord {
  readonly id: number;
  readonly wordId: number;
  readonly recordDate: Date;
  readonly result: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: LearningRecordProps) {
    this.id = props.id;
    this.wordId = props.wordId;
    this.recordDate = props.recordDate;
    this.result = props.result;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
