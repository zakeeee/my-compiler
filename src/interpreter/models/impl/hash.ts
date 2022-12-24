import { ObjectType, PopBoolean, PopHash, PopObject, PopString } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopStringImpl from './string'

export default class PopHashImpl implements PopHash {
  constructor(private elements: Map<string, PopObject>) {}

  $equal(other: PopObject): PopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  $toBoolean(): PopBoolean {
    return C_TRUE
  }

  $toString(): PopString {
    const arr: string[] = []
    const entries = this.elements.entries()
    for (const [key, value] of entries) {
      if (arr.length > 9) {
        arr.push('...')
        break
      }
      arr.push(`${key}: ${value.$toString().$unwrap()}`)
    }
    return new PopStringImpl(`{${arr.join(', ')}}`)
  }

  $type(): ObjectType {
    return ObjectType.HASH
  }

  $index(index: PopObject): PopObject {
    if (index instanceof PopStringImpl) {
      const key = index.$unwrap()
      if (!this.elements.has(key)) {
        throw new Error(`hash has no key "${key}"`)
      }
      return this.elements.get(key)!
    }
    throw new Error(`"${index.$type()}" cannot be used as hash index`)
  }
}
