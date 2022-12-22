import { PopObject } from './models/types'

export class Scope {
  private map = new Map<string, PopObject>()
  private readonly outer: Scope | null

  constructor(outer?: Scope) {
    this.outer = outer || null
  }

  getValue(name: string): PopObject | null {
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

  getOwnValue(name: string): PopObject | null {
    return this.map.get(name) ?? null
  }

  setOwnValue(name: string, object: PopObject): void {
    this.map.set(name, object)
  }

  hasOwnValue(name: string): boolean {
    return this.map.has(name)
  }

  /**
   * 获取 name 对应的标识符所在作用域
   */
  getScope(name: string): Scope | null {
    let result = this.map.has(name)
    if (result) {
      return this
    }
    if (!this.outer) {
      return null
    }
    return this.outer.getScope(name)
  }
}
