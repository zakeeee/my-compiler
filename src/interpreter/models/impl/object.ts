import { IPopBoolean, IPopObject, IPopString, ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopString from './string'

export default class PopObject implements IPopObject {
  get type(): ObjectType {
    return ObjectType.OBJECT
  }

  equal(other: IPopObject): IPopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  toBoolean(): IPopBoolean {
    return C_TRUE
  }

  toString(): IPopString {
    return new PopString('<Object>')
  }
}
