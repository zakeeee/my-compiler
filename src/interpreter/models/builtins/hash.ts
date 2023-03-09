import { NULL } from './null';
import { PopObject } from './object';

export class PopHash extends PopObject {
  protected map: Map<string, PopObject>;

  constructor(arg?: Map<string, PopObject>) {
    super();
    this.map = arg ?? new Map();
  }

  getMap() {
    return this.map;
  }

  size() {
    return this.map.size;
  }

  get(key: string) {
    return this.map.get(key) ?? NULL;
  }

  set(key: string, value: PopObject) {
    this.map.set(key, value);
  }

  toString(): string {
    return this.map.toString();
  }
}
