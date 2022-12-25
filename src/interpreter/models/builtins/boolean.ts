import { ModelType } from '../types'
import { PopObject } from './object'

export class PopBoolean extends PopObject {
  protected value: boolean

  constructor(value: boolean) {
    super()
    this.type = ModelType.BOOLEAN
    this.value = value
  }

  toBoolean(): boolean {
    return this.value
  }

  toString(): string {
    return this.value ? 'true' : 'false'
  }
}

export const TRUE = new PopBoolean(true)
export const FALSE = new PopBoolean(false)
