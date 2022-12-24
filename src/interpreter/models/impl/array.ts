import { ObjectType, PopArray, PopBoolean, PopNumber, PopObject, PopString } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopNumberImpl from './number'
import PopStringImpl from './string'

export default class PopArrayImpl implements PopArray {
  constructor(private elements: PopObject[]) {}

  $equal(other: PopObject): PopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  $toBoolean(): PopBoolean {
    return C_TRUE
  }

  $toString(): PopString {
    return new PopStringImpl(`[${this.elements.map((el) => el.$toString().$unwrap()).join(', ')}]`)
  }

  $type(): ObjectType {
    return ObjectType.ARRAY
  }

  $length(): PopNumber {
    return new PopNumberImpl(this.elements.length)
  }

  $index(index: PopObject): PopObject {
    if (index instanceof PopNumberImpl) {
      const idx = index.$unwrap()
      if (idx < 0 || idx >= this.elements.length) {
        throw new Error('index out of range')
      }
      return this.elements[idx]
    }
    throw new Error(`"${index.$type()}" cannot be used as array index`)
  }
}
