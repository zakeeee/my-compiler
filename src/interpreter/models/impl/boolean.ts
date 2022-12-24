import { IPopBoolean, IPopObject, IPopString, ObjectType } from '../types'
import PopString from './string'

class PopBoolean implements IPopBoolean {
  get type(): ObjectType {
    return ObjectType.BOOLEAN
  }

  constructor(private value: boolean) {}

  equal(other: IPopObject): IPopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  not(): IPopBoolean {
    return this.value === true ? C_FALSE : C_TRUE
  }

  toBoolean(): IPopBoolean {
    return this
  }

  toString(): IPopString {
    return new PopString(`${this.value}`)
  }

  unwrap(): boolean {
    return this.value
  }
}

export const C_TRUE = new PopBoolean(true)
export const C_FALSE = new PopBoolean(false)
