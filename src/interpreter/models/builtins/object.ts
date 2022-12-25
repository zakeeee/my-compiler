import { ModelType } from '../types'

export class PopObject {
  protected type: ModelType = ModelType.OBJECT

  getType() {
    return this.type
  }

  equals(other: PopObject): boolean {
    return this === other
  }

  toBoolean(): boolean {
    return true
  }

  toString(): string {
    return `<Object>`
  }
}
