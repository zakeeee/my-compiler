import PopBoolean from './boolean';
import { ObjectType, PopObject } from './object';
import PopString from './string';

export default class PopNull implements PopObject {
  private static _null = new PopNull();

  static get NULL(): PopNull {
    return this._null;
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

  $equals(other: PopObject): boolean {
    return this === other;
  }

  $toBoolean(): boolean {
    return false;
  }

  $toString(): string {
    return 'null';
  }

  $type(): ObjectType {
    return ObjectType.NULL;
  }

  $unwrap(): null {
    return null;
  }
}
