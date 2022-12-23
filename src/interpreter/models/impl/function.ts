import { BlockStatement } from 'src/ast'
import { Scope } from 'src/interpreter/scope'
import { ObjectType, PopBoolean, PopFunction, PopObject, PopString } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopStringImpl from './string'

export default class PopFunctionImpl implements PopFunction {
  constructor(
    private parameters: string[],
    readonly body: BlockStatement,
    readonly scope: Scope,
    private identifier?: string
  ) {}

  get $name(): string {
    return this.identifier ?? 'anonymous'
  }

  get $parameters(): string[] {
    return [...this.parameters]
  }

  $equal(other: PopObject): PopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  $toBoolean(): PopBoolean {
    return C_TRUE
  }

  $toString(): PopString {
    return new PopStringImpl(`<Function ${this.$name}>`)
  }

  $type(): ObjectType {
    return ObjectType.FUNCTION
  }
}
