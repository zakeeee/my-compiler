import { BlockStatement } from 'src/ast'
import { ObjectType, PopBoolean, PopFunction, PopObject, PopString } from '../types'
import PopBooleanImpl from './boolean'
import PopStringImpl from './string'

export default class PopFunctionImpl implements PopFunction {
  constructor(
    private parameters: string[],
    readonly body: BlockStatement,
    private identifier?: string
  ) {}

  get $name(): string {
    return this.identifier ?? 'anonymous'
  }

  get $parameters(): string[] {
    return [...this.parameters]
  }

  $equal(other: PopObject): PopBoolean {
    return this === other ? PopBooleanImpl.TRUE : PopBooleanImpl.FALSE
  }

  $toBoolean(): PopBoolean {
    return PopBooleanImpl.TRUE
  }

  $toString(): PopString {
    return new PopStringImpl(`<Function ${this.$name}>`)
  }

  $type(): ObjectType {
    return ObjectType.FUNCTION
  }
}
