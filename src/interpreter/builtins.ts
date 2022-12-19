import PopStringImpl from './models/impl/string'
import { PopNumber, PopObject, PopString } from './models/types'

export function len(object: PopObject): PopNumber {
  if ('$length' in object && typeof object.$length === 'function') {
    return object.$length()
  }
  throw new Error(`cannot perform len operation on ${object.$type()}`)
}

export function type(object: PopObject): PopString {
  return new PopStringImpl(object.$type())
}

export function str(object: PopObject): PopString {
  return object.$toString()
}

export function print(...objects: PopObject[]): void {
  console.log(...objects.map((o) => o.$toString().$unwrap()))
}
