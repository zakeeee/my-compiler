import type { PopClass } from './class'
import { PopObject } from './object'

export class PopInstance extends PopObject {
  protected cls: PopClass
  protected fields = new Map<string, PopObject>()

  constructor(cls: PopClass) {
    super()
    this.cls = cls
  }

  getProperty(name: string): PopObject | null {
    const prop = this.fields.get(name)
    if (prop) {
      return prop
    }

    const method = this.cls.getMethod(name)
    if (method) {
      return method.bind(this)
    }

    return null
  }

  setProperty(name: string, object: PopObject) {
    this.fields.set(name, object)
  }

  toString(): string {
    return `<Object>`
  }

  isInstanceOf(cls: PopClass): boolean {
    if (this.cls) {
      let cur: PopClass | null = cls
      while (cur) {
        if (this.cls === cur) {
          return true
        }
        cur = cur.getSuperClass()
      }
    }
    return false
  }
}
