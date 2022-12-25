import { PopObject } from './models/builtins/object'

export class Environment {
  private values = new Map<string, PopObject | null>()
  private outer: Environment | null

  constructor(outer?: Environment) {
    this.outer = outer || null
  }

  getValue<T = PopObject>(name: string): T | null {
    if (this.values.has(name)) {
      return this.values.get(name) as T | null
    }

    if (this.outer) {
      return this.outer.getValue<T>(name)
    }

    return null
  }

  define(name: string, value: PopObject | null) {
    this.values.set(name, value)
  }

  assign(name: string, value: PopObject): boolean {
    if (this.values.has(name)) {
      this.values.set(name, value)
      return true
    }

    if (this.outer) {
      return this.outer.assign(name, value)
    }

    return false
  }

  ancestor(distance: number): Environment | null {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let cur: Environment | null = this
    for (let i = 0; i < distance; i++) {
      if (!cur) {
        break
      }
      cur = cur.outer
    }
    return cur
  }
}
