import { BlockStatement } from 'src/ast'
import { ObjectType, PopBoolean, PopFunction, PopObject, PopString } from '../types'
import PopBooleanImpl from './boolean'
import PopStringImpl from './string'

export default class PopFunctionImpl implements PopFunction {
  constructor(
    readonly parameters: string[],
    readonly body: BlockStatement,
    readonly identifier?: string
  ) {}

  $equal(other: PopObject): PopBoolean {
    return this === other ? PopBooleanImpl.TRUE : PopBooleanImpl.FALSE
  }

  $toBoolean(): PopBoolean {
    return PopBooleanImpl.TRUE
  }

  $toString(): PopString {
    return new PopStringImpl(`<Function ${this.identifier ?? 'anonymous'}>`)
  }

  $type(): ObjectType {
    return ObjectType.FUNCTION
  }
}
