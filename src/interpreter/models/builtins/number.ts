import { ModelType } from '../types';
import { PopObject } from './object';

export class PopNumber extends PopObject {
  protected value: number;

  constructor(value: number) {
    super();
    this.type = ModelType.NUMBER;
    this.value = value;
  }

  getValue() {
    return this.value;
  }

  equals(other: PopObject): boolean {
    return other instanceof PopNumber && this.value === other.getValue();
  }

  toBoolean(): boolean {
    return !!this.value;
  }

  toString(): string {
    return `${this.value}`;
  }
}
