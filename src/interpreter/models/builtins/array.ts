import { PopObject } from './object'

export class PopArray extends PopObject {
  protected elements: PopObject[]

  constructor(arg: number | PopObject[]) {
    super()
    if (typeof arg === 'number') {
      this.elements = new Array(arg)
    } else {
      this.elements = arg
    }
  }

  getElements() {
    return this.elements
  }

  size() {
    return this.elements.length
  }

  getAt(i: number) {
    if (i < 0 || i > this.elements.length - 1) {
      throw new Error('index out of range')
    }
    return this.elements[i]
  }

  setAt(i: number, value: PopObject) {
    if (i < 0 || i > this.elements.length - 1) {
      throw new Error('index out of range')
    }
    this.elements[i] = value
  }

  push(value: PopObject) {
    this.elements.push(value)
  }

  pop() {
    if (this.elements.length === 0) {
      throw new Error('array is empty')
    }
    return this.elements.pop()!
  }

  slice(start?: number, end?: number) {
    return new PopArray(this.elements.slice(start, end))
  }

  toString(): string {
    return this.elements.toString()
  }
}
