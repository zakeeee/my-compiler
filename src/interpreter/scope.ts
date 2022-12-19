import { PopObject } from './models/object';

export class Scope {
  private map = new Map<string, PopObject>();
  private outer: Scope | null;

  constructor(outer?: Scope) {
    this.outer = outer || null;
  }

  getName(name: string): PopObject | null {
    let object = this.map.get(name);
    if (object) {
      return object;
    }
    if (!this.outer) {
      return null;
    }
    return this.outer.getName(name);
  }

  setName(name: string, object: PopObject): void {
    this.map.set(name, object);
  }
}
