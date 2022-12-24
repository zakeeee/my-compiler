import { IPopArray, IPopBoolean, IPopNumber, IPopObject, IPopString, ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopNumber from './number'
import PopString from './string'

export default class PopArray implements IPopArray {
  get type(): ObjectType {
    return ObjectType.ARRAY
  }

  constructor(private elements: IPopObject[]) {}

  equal(other: IPopObject): IPopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  toBoolean(): IPopBoolean {
    return C_TRUE
  }

  toString(): IPopString {
    return new PopString(`[${this.elements.map((el) => el.toString().unwrap()).join(', ')}]`)
  }

  length(): IPopNumber {
    return new PopNumber(this.elements.length)
  }

  index(index: IPopObject): IPopObject {
    if (index instanceof PopNumber) {
      const idx = index.unwrap()
      if (idx < 0 || idx >= this.elements.length) {
        throw new Error('index out of range')
      }
      return this.elements[idx]
    }
    throw new Error(`"${index.type}" cannot be used as array index`)
  }
}
