import { ModelType } from '../types'
import { PopObject } from './object'

export class PopString extends PopObject {
  protected value: string

  constructor(value: string) {
    super()
    this.type = ModelType.STRING
    this.value = value
  }

  getValue() {
    return this.value
  }

  equals(other: PopObject): boolean {
    return other instanceof PopString && this.value === other.getValue()
  }

  toBoolean(): boolean {
    return !!this.value
  }

  toString(): string {
    return this.value
  }

  getLength(): number {
    return this.value.length
  }
}
