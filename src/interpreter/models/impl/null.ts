import { ObjectType, PopBoolean, PopNull, PopObject, PopString } from '../types'
import PopBooleanImpl from './boolean'
import PopStringImpl from './string'

export default class PopNullImpl implements PopNull {
  private static _null = new PopNullImpl()

  static get NULL(): PopNull {
    return this._null
  }

  // 禁止通过 new 创建
  private constructor() {}

  $equal(other: PopObject): PopBoolean {
    return this === other ? PopBooleanImpl.TRUE : PopBooleanImpl.FALSE
  }

  $toBoolean(): PopBoolean {
    return PopBooleanImpl.FALSE
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
