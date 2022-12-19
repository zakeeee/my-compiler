import { ObjectType, PopObject } from './object';
import PopString from './string';

export default class PopBoolean implements PopObject {
  private static _true = new PopBoolean(true);
  private static _false = new PopBoolean(false);

  static get TRUE(): PopBoolean {
    return this._true;
  }

  static get FALSE(): PopBoolean {
    return this._false;
  }

  private constructor(private value: boolean) {}

  equals(other: PopObject): PopBoolean {
    return this.$equals(other) ? PopBoolean.TRUE : PopBoolean.FALSE;
  }

  toBoolean(): PopBoolean {
    return this;
  }

  toString(): PopString {
    return new PopString(this.$toString());
  }

  $equals(other: PopObject): boolean {
    return this === other;
  }

  $toBoolean(): boolean {
    return this.value;
  }

  $toString(): string {
    return `${this.value}`;
  }

  $type(): ObjectType {
    return ObjectType.BOOLEAN;
  }

  $unwrap(): boolean {
    return this.value;
  }
}
