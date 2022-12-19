import { ObjectType, PopBoolean, PopNumber, PopObject, PopString } from '../types'
import PopBooleanImpl from './boolean'
import PopNumberImpl from './number'

export default class PopStringImpl implements PopString {
  private value: string

  constructor(value: PopObject | string) {
    if (typeof value === 'string') {
      this.value = value
    } else {
      this.value = value.$toString().$unwrap()
    }
  }

  $add(other: PopObject): PopString {
    if (other instanceof PopStringImpl) {
      return new PopStringImpl(this.value + other.$unwrap())
    }
    throw new Error(`cannot perform add operation on ${this.$type()} and ${other.$type()}`)
  }

  $equal(other: PopObject): PopBoolean {
    return other instanceof PopStringImpl && this.value === other.$unwrap()
      ? PopBooleanImpl.TRUE
      : PopBooleanImpl.FALSE
  }

  $length(): PopNumber {
    return new PopNumberImpl(this.value.length)
  }

  $toBoolean(): PopBoolean {
    return this.value.length ? PopBooleanImpl.TRUE : PopBooleanImpl.FALSE
  }

  $toString(): PopString {
    return this
  }

  $type(): ObjectType {
    return ObjectType.STRING
  }

  $unwrap(): string {
    return this.value
  }
}
