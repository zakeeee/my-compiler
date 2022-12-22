import { ObjectType, PopBoolean, PopNumber, PopObject, PopString } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopStringImpl from './string'

export default class PopNumberImpl implements PopNumber {
  private value: number

  constructor(value: PopNumber | number) {
    if (typeof value === 'number') {
      this.value = value
    } else {
      this.value = value.$unwrap()
    }
  }

  $equal(other: PopObject): PopBoolean {
    return other instanceof PopNumberImpl && this.value === other.$unwrap() ? C_TRUE : C_FALSE
  }

  $toBoolean(): PopBoolean {
    return this.value !== 0 ? C_TRUE : C_FALSE
  }

  $toString(): PopString {
    return new PopStringImpl(`${this.value}`)
  }

  $type(): ObjectType {
    return ObjectType.NUMBER
  }

  $unwrap(): number {
    return this.value
  }

  $add(other: PopObject): PopNumber {
    if (other instanceof PopNumberImpl) {
      return new PopNumberImpl(this.value + other.$unwrap())
    }
    throw new Error(`cannot perform add operation on ${this.$type()} and ${other.$type()}`)
  }

  $minus(other: PopObject): PopNumber {
    if (other instanceof PopNumberImpl) {
      return new PopNumberImpl(this.value - other.$unwrap())
    }
    throw new Error(`cannot perform minus operation on ${this.$type()} and ${other.$type()}`)
  }

  $multiply(other: PopObject): PopNumber {
    if (other instanceof PopNumberImpl) {
      return new PopNumberImpl(this.value * other.$unwrap())
    }
    throw new Error(`cannot perform multiply operation on ${this.$type()} and ${other.$type()}`)
  }

  $divide(other: PopObject): PopNumber {
    if (other instanceof PopNumberImpl) {
      return new PopNumberImpl(this.value / other.$unwrap())
    }
    throw new Error(`cannot perform divide operation on ${this.$type()} and ${other.$type()}`)
  }

  $modulo(other: PopObject): PopNumber {
    if (other instanceof PopNumberImpl) {
      return new PopNumberImpl(this.value % other.$unwrap())
    }
    throw new Error(`cannot perform modulo operation on ${this.$type()} and ${other.$type()}`)
  }

  $toPositive(): PopNumber {
    return this
  }

  $toNegative(): PopNumber {
    return new PopNumberImpl(-this.value)
  }

  $bitNot(): PopNumber {
    return new PopNumberImpl(~this.value)
  }

  $bitAnd(other: PopObject): PopNumber {
    if (other instanceof PopNumberImpl) {
      return new PopNumberImpl(this.value & other.$unwrap())
    }
    throw new Error(`cannot perform bitAnd operation on ${this.$type()} and ${other.$type()}`)
  }

  $bitOr(other: PopObject): PopNumber {
    if (other instanceof PopNumberImpl) {
      return new PopNumberImpl(this.value | other.$unwrap())
    }
    throw new Error(`cannot perform bitOr operation on ${this.$type()} and ${other.$type()}`)
  }

  $bitXor(other: PopObject): PopNumber {
    if (other instanceof PopNumberImpl) {
      return new PopNumberImpl(this.value ^ other.$unwrap())
    }
    throw new Error(`cannot perform bitXor operation on ${this.$type()} and ${other.$type()}`)
  }

  $greaterThan(other: PopObject): PopBoolean {
    if (other instanceof PopNumberImpl) {
      return this.value > other.$unwrap() ? C_TRUE : C_FALSE
    }
    throw new Error(`cannot perform greaterThan operation on ${this.$type()} and ${other.$type()}`)
  }

  $greaterThanEqual(other: PopObject): PopBoolean {
    if (other instanceof PopNumberImpl) {
      return this.value >= other.$unwrap() ? C_TRUE : C_FALSE
    }
    throw new Error(
      `cannot perform greaterThanEqual operation on ${this.$type()} and ${other.$type()}`
    )
  }

  $lessThan(other: PopObject): PopBoolean {
    if (other instanceof PopNumberImpl) {
      return this.value < other.$unwrap() ? C_TRUE : C_FALSE
    }
    throw new Error(`cannot perform lessThan operation on ${this.$type()} and ${other.$type()}`)
  }

  $lessThanEqual(other: PopObject): PopBoolean {
    if (other instanceof PopNumberImpl) {
      return this.value <= other.$unwrap() ? C_TRUE : C_FALSE
    }
    throw new Error(
      `cannot perform lessThanEqual operation on ${this.$type()} and ${other.$type()}`
    )
  }
}
