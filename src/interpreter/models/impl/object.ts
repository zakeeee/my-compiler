import { ObjectType, PopBoolean, PopObject, PopString } from '../types'
import PopBooleanImpl from './boolean'
import PopStringImpl from './string'

export default class PopObjectImpl implements PopObject {
  $equal(other: PopObject): PopBoolean {
    return this === other ? PopBooleanImpl.TRUE : PopBooleanImpl.FALSE
  }

  $toBoolean(): PopBoolean {
    return PopBooleanImpl.TRUE
  }

  $toString(): PopString {
    return new PopStringImpl('<Object>')
  }

  $type(): ObjectType {
    return ObjectType.OBJECT
  }
}
