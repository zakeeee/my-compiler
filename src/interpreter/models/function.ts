import PopBoolean from './boolean';
import { ObjectType, PopObject } from './object';
import PopString from './string';

export default class PopFunction implements PopObject {
  constructor(
    private identifier: PopString,
    private parameters: PopString[],
    private func: Function
  ) {}

  equals(other: PopObject): PopBoolean {
    return this.$equals(other) ? PopBoolean.TRUE : PopBoolean.FALSE;
  }

  toBoolean(): PopBoolean {
    return this.$toBoolean() ? PopBoolean.TRUE : PopBoolean.FALSE;
  }

  toString(): PopString {
    return new PopString(this.$toString());
  }

  $call(args: PopObject[]) {}

  $equals(other: PopObject): boolean {
    throw new Error('Method not implemented.');
  }

  $toBoolean(): boolean {
    throw new Error('Method not implemented.');
  }

  $toString(): string {
    return `<Function ${this.identifier.$unwrap()}>`;
  }

  $type(): ObjectType {
    return ObjectType.FUNCTION;
  }
}
