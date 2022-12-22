import { ObjectType, PopBoolean, PopNull, PopObject, PopString } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopStringImpl from './string'

class PopNullImpl implements PopNull {
  $equal(other: PopObject): PopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  $toBoolean(): PopBoolean {
    return C_FALSE
  }

  $toString(): PopString {
    return new PopStringImpl('null')
  }

  $type(): ObjectType {
    return ObjectType.NULL
  }

  $unwrap(): null {
    return null
  }
}

export const C_NULL = new PopNullImpl()
