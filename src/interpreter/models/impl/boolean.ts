import { ObjectType, PopBoolean, PopObject, PopString } from '../types'
import PopStringImpl from './string'

export default class PopBooleanImpl implements PopBoolean {
  private static _true = new PopBooleanImpl(true)
  private static _false = new PopBooleanImpl(false)

  static get TRUE(): PopBoolean {
    return this._true
  }

  static get FALSE(): PopBoolean {
    return this._false
  }

  private constructor(private value: boolean) {}

  $equal(other: PopObject): PopBoolean {
    return this === other ? PopBooleanImpl.TRUE : PopBooleanImpl.FALSE
  }

  $not(): PopBoolean {
    return this.value === true ? PopBooleanImpl.FALSE : PopBooleanImpl.TRUE
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
