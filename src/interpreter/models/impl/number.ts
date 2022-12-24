import { IPopBoolean, IPopNumber, IPopObject, IPopString, ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopString from './string'

export default class PopNumber implements IPopNumber {
  private value: number

  get type(): ObjectType {
    return ObjectType.NUMBER
  }

  constructor(value: IPopNumber | number) {
    if (typeof value === 'number') {
      this.value = value
    } else {
      this.value = value.unwrap()
    }
  }

  equal(other: IPopObject): IPopBoolean {
    return other instanceof PopNumber && this.value === other.unwrap() ? C_TRUE : C_FALSE
  }

  toBoolean(): IPopBoolean {
    return this.value !== 0 ? C_TRUE : C_FALSE
  }

  toString(): IPopString {
    return new PopString(`${this.value}`)
  }

  unwrap(): number {
    return this.value
  }

  add(other: IPopObject): IPopNumber {
    if (other instanceof PopNumber) {
      return new PopNumber(this.value + other.unwrap())
    }
    throw new Error(`cannot perform add operation on ${this.type} and ${other.type}`)
  }

  minus(other: IPopObject): IPopNumber {
    if (other instanceof PopNumber) {
      return new PopNumber(this.value - other.unwrap())
    }
    throw new Error(`cannot perform minus operation on ${this.type} and ${other.type}`)
  }

  multiply(other: IPopObject): IPopNumber {
    if (other instanceof PopNumber) {
      return new PopNumber(this.value * other.unwrap())
    }
    throw new Error(`cannot perform multiply operation on ${this.type} and ${other.type}`)
  }

  divide(other: IPopObject): IPopNumber {
    if (other instanceof PopNumber) {
      return new PopNumber(this.value / other.unwrap())
    }
    throw new Error(`cannot perform divide operation on ${this.type} and ${other.type}`)
  }

  modulo(other: IPopObject): IPopNumber {
    if (other instanceof PopNumber) {
      return new PopNumber(this.value % other.unwrap())
    }
    throw new Error(`cannot perform modulo operation on ${this.type} and ${other.type}`)
  }

  toPositive(): IPopNumber {
    return this
  }

  toNegative(): IPopNumber {
    return new PopNumber(-this.value)
  }

  bitNot(): IPopNumber {
    return new PopNumber(~this.value)
  }

  bitAnd(other: IPopObject): IPopNumber {
    if (other instanceof PopNumber) {
      return new PopNumber(this.value & other.unwrap())
    }
    throw new Error(`cannot perform bitAnd operation on ${this.type} and ${other.type}`)
  }

  bitOr(other: IPopObject): IPopNumber {
    if (other instanceof PopNumber) {
      return new PopNumber(this.value | other.unwrap())
    }
    throw new Error(`cannot perform bitOr operation on ${this.type} and ${other.type}`)
  }

  bitXor(other: IPopObject): IPopNumber {
    if (other instanceof PopNumber) {
      return new PopNumber(this.value ^ other.unwrap())
    }
    throw new Error(`cannot perform bitXor operation on ${this.type} and ${other.type}`)
  }

  greaterThan(other: IPopObject): IPopBoolean {
    if (other instanceof PopNumber) {
      return this.value > other.unwrap() ? C_TRUE : C_FALSE
    }
    throw new Error(`cannot perform greaterThan operation on ${this.type} and ${other.type}`)
  }

  greaterThanEqual(other: IPopObject): IPopBoolean {
    if (other instanceof PopNumber) {
      return this.value >= other.unwrap() ? C_TRUE : C_FALSE
    }
    throw new Error(`cannot perform greaterThanEqual operation on ${this.type} and ${other.type}`)
  }

  lessThan(other: IPopObject): IPopBoolean {
    if (other instanceof PopNumber) {
      return this.value < other.unwrap() ? C_TRUE : C_FALSE
    }
    throw new Error(`cannot perform lessThan operation on ${this.type} and ${other.type}`)
  }

  lessThanEqual(other: IPopObject): IPopBoolean {
    if (other instanceof PopNumber) {
      return this.value <= other.unwrap() ? C_TRUE : C_FALSE
    }
    throw new Error(`cannot perform lessThanEqual operation on ${this.type} and ${other.type}`)
  }
}
