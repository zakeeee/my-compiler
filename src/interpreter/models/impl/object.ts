import { ObjectType, PopBoolean, PopObject, PopString } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopStringImpl from './string'

export default class PopObjectImpl implements PopObject {
  $equal(other: PopObject): PopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  $toBoolean(): PopBoolean {
    return C_TRUE
  }

  $toString(): PopString {
    return new PopStringImpl('<Object>')
  }

  $type(): ObjectType {
    return ObjectType.OBJECT
  }
}
