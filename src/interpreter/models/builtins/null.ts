import { ModelType } from '../types'
import { PopObject } from './object'

export class PopNull extends PopObject {
  constructor() {
    super()
    this.type = ModelType.NULL
  }

  toBoolean(): boolean {
    return false
  }

  toString(): string {
    return 'null'
  }
}

export const NULL = new PopNull()
