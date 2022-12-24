import { IPopBoolean, IPopHash, IPopObject, IPopString, ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopString from './string'

export default class PopHash implements IPopHash {
  get type(): ObjectType {
    return ObjectType.HASH
  }

  constructor(private elements: Map<string, IPopObject>) {}

  equal(other: IPopObject): IPopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  toBoolean(): IPopBoolean {
    return C_TRUE
  }

  toString(): IPopString {
    const arr: string[] = []
    const entries = this.elements.entries()
    for (const [key, value] of entries) {
      if (arr.length > 9) {
        arr.push('...')
        break
      }
      arr.push(`"${key}": ${value.toString().unwrap()}`)
    }
    return new PopString(`{${arr.join(', ')}}`)
  }

  index(index: IPopObject): IPopObject {
    if (index instanceof PopString) {
      const key = index.unwrap()
      if (!this.elements.has(key)) {
        throw new Error(`hash has no key "${key}"`)
      }
      return this.elements.get(key)!
    }
    throw new Error(`"${index.type}" cannot be used as hash index`)
  }
}
