import { IPopBoolean, IPopNumber, IPopObject, IPopString, ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopNumber from './number'

export default class PopString implements IPopString {
  private value: string

  get type(): ObjectType {
    return ObjectType.STRING
  }

  constructor(value: IPopObject | string) {
    if (typeof value === 'string') {
      this.value = value
    } else {
      this.value = value.toString().unwrap()
    }
  }

  add(other: IPopObject): IPopString {
    if (other instanceof PopString) {
      return new PopString(this.value + other.unwrap())
    }
    throw new Error(`cannot perform add operation on ${this.type} and ${other.type}`)
  }

  equal(other: IPopObject): IPopBoolean {
    return other instanceof PopString && this.value === other.unwrap() ? C_TRUE : C_FALSE
  }

  length(): IPopNumber {
    return new PopNumber(this.value.length)
  }

  toBoolean(): IPopBoolean {
    return this.value.length ? C_TRUE : C_FALSE
  }

  toString(): IPopString {
    return this
  }

  unwrap(): string {
    return this.value
  }
}
