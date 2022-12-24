import { IPosition } from 'src/types'
import { IPopBoolean, IPopError, IPopObject, IPopString, ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopString from './string'

export default class PopError implements IPopError {
  protected name: string = 'Error'
  private errorStack: string[] = []

  get type(): ObjectType {
    return ObjectType.ERROR
  }

  constructor(private message: string) {
    this.errorStack.push(`${this.name}: ${this.message}`)
  }

  equal(other: IPopObject): IPopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  toBoolean(): IPopBoolean {
    return C_TRUE
  }

  toString(): IPopString {
    return new PopString(this.message)
  }

  pushStack(pos: IPosition) {
    const { line, column } = pos
    this.errorStack.push(`    at ${line}:${column}`)
  }

  printStack(): string {
    return this.errorStack.join('\n')
  }
}
