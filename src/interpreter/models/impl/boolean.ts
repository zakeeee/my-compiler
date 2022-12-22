import { ObjectType, PopBoolean, PopObject, PopString } from '../types'
import PopStringImpl from './string'

class PopBooleanImpl implements PopBoolean {
  constructor(private value: boolean) {}

  $equal(other: PopObject): PopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  $not(): PopBoolean {
    return this.value === true ? C_FALSE : C_TRUE
  }

  $toBoolean(): PopBoolean {
    return this
  }

  $toString(): PopString {
    return new PopStringImpl(`${this.value}`)
  }

  $type(): ObjectType {
    return ObjectType.BOOLEAN
  }

  $unwrap(): boolean {
    return this.value
  }
}

export const C_TRUE = new PopBooleanImpl(true)
export const C_FALSE = new PopBooleanImpl(false)
