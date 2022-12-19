import PopBoolean from './boolean';
import { ObjectType, PopObject } from './object';
import PopString from './string';

export default class PopNumber implements PopObject {
  private value: number;

  constructor(value: PopNumber | number) {
    if (typeof value === 'number') {
      this.value = value;
    } else {
      this.value = value.$unwrap();
    }
  }

  equals(other: PopObject): PopBoolean {
    return this.$equals(other) ? PopBoolean.TRUE : PopBoolean.FALSE;
  }

  toBoolean(): PopBoolean {
    return this.$toBoolean() ? PopBoolean.TRUE : PopBoolean.FALSE;
  }

  toString(): PopString {
    return new PopString(this.$toString());
  }

  add(other: PopObject): PopNumber {
    if (other instanceof PopNumber) {
      return new PopNumber(this.value + other.$unwrap());
    }
    throw new Error(`cannot perform add operation on ${this.$type()} and ${other.$type()}`);
  }

  minus(other: PopObject): PopNumber {
    if (other instanceof PopNumber) {
      return new PopNumber(this.value - other.$unwrap());
    }
    throw new Error(`cannot perform minus operation on ${this.$type()} and ${other.$type()}`);
  }

  multiply(other: PopObject): PopNumber {
    if (other instanceof PopNumber) {
      return new PopNumber(this.value * other.$unwrap());
    }
    throw new Error(`cannot perform multiply operation on ${this.$type()} and ${other.$type()}`);
  }

  divide(other: PopObject): PopNumber {
    if (other instanceof PopNumber) {
      return new PopNumber(this.value / other.$unwrap());
    }
    throw new Error(`cannot perform divide operation on ${this.$type()} and ${other.$type()}`);
  }

  modulo(other: PopObject): PopNumber {
    if (other instanceof PopNumber) {
      return new PopNumber(this.value % other.$unwrap());
    }
    throw new Error(`cannot perform modulo operation on ${this.$type()} and ${other.$type()}`);
  }

  $equals(other: PopObject): boolean {
    if (other instanceof PopNumber) {
      return this.value === other.$unwrap();
    }
    return false;
  }

  $toBoolean(): boolean {
    return this.value !== 0;
  }

  $toString(): string {
    return `${this.value}`;
  }

  $type(): ObjectType {
    return ObjectType.NUMBER;
  }

  $unwrap(): number {
    return this.value;
  }
}
