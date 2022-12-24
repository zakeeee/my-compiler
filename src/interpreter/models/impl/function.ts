import { BlockStatement } from 'src/ast'
import { Scope } from 'src/interpreter/scope'
import { IPopBoolean, IPopFunction, IPopObject, IPopString, ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopString from './string'

export default class PopFunction implements IPopFunction {
  get type(): ObjectType {
    return ObjectType.FUNCTION
  }

  get name(): string {
    return this.identifier ?? 'anonymous'
  }

  get parameters(): string[] {
    return [...this.params]
  }

  constructor(
    private params: string[],
    readonly body: BlockStatement,
    readonly scope: Scope,
    private identifier?: string
  ) {}

  equal(other: IPopObject): IPopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  toBoolean(): IPopBoolean {
    return C_TRUE
  }

  toString(): IPopString {
    return new PopString(`<Function ${this.name}>`)
  }
}
