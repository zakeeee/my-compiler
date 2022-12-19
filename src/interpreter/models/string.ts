import PopBoolean from './boolean';
import { PopObject, ObjectType } from './object';

export default class PopString implements PopObject {
  private value: string;

  constructor(value: PopObject | string) {
    if (typeof value === 'string') {
      this.value = value;
    } else {
      this.value = value.$toString();
    }
  }

  equals(other: PopObject): PopBoolean {
    return this.$equals(other) ? PopBoolean.TRUE : PopBoolean.FALSE;
  }

  toBoolean(): PopBoolean {
    return this.$toBoolean() ? PopBoolean.TRUE : PopBoolean.FALSE;
  }

  toString(): PopString {
    return this;
  }

  add(other: PopObject): PopString {
    if (other instanceof PopString) {
      return new PopString(this.value + other.$unwrap());
    }
    throw new Error(`cannot perform add operation on ${this.$type()} and ${other.$type()}`);
  }

  $equals(other: PopObject): boolean {
    return other instanceof PopString && this.value === other.$unwrap();
  }

  $toBoolean(): boolean {
    return !!this.value.length;
  }

  $toString(): string {
    return this.value;
  }

  $type(): ObjectType {
    return ObjectType.STRING;
  }

  $unwrap(): string {
    return this.value;
  }

  $length(): number {
    return this.value.length;
  }
}
