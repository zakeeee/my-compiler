import { IPopObject } from './models/types'

export const uninitialized = Symbol()

export class Scope {
  private map = new Map<string, IPopObject | typeof uninitialized>()
  private readonly outer: Scope | null

  constructor(outer?: Scope) {
    this.outer = outer || null
  }

  getValue(name: string): IPopObject | typeof uninitialized | null {
    const object = this.map.get(name)
    if (object) {
      return object
    }
    if (!this.outer) {
      return null
    }
    return this.outer.getValue(name)
  }

  hasValue(name: string): boolean {
    const object = this.map.get(name)
    if (object) {
      return true
    }
    if (!this.outer) {
      return false
    }
    return this.outer.hasValue(name)
  }

  getOwnValue(name: string): IPopObject | typeof uninitialized | null {
    return this.map.get(name) ?? null
  }

  setOwnValue(name: string, object: IPopObject | typeof uninitialized): void {
    this.map.set(name, object)
  }

  hasOwnValue(name: string): boolean {
    return this.map.has(name)
  }

  /**
   * 获取 name 对应的标识符所在作用域
   */
  getScope(name: string): Scope | null {
    if (this.hasOwnValue(name)) {
      return this
    }
    if (!this.outer) {
      return null
    }
    return this.outer.getScope(name)
  }
}
