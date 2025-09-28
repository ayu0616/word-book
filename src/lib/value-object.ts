export abstract class ValueObject<T> {
  protected readonly _value: T;

  protected constructor(value: T) {
    this._value = value;
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.value === undefined) {
      return false;
    }
    return JSON.stringify(this.value) === JSON.stringify(vo.value);
  }

  get value(): T {
    return this._value;
  }
}
