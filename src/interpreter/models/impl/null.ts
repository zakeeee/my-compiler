import { IPopBoolean, IPopNull, IPopObject, IPopString, ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopString from './string'

class PopNull implements IPopNull {
  get type(): ObjectType {
    return ObjectType.NULL
  }

  equal(other: IPopObject): IPopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  toBoolean(): IPopBoolean {
    return C_FALSE
  }

  toString(): IPopString {
    return new PopString('null')
  }

  unwrap(): null {
    return null
  }
}

export const C_NULL = new PopNull()
