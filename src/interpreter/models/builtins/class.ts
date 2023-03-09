import { Environment } from 'src/interpreter/environment';
import { PopObject } from 'src/interpreter/models/builtins/object';
import { Callable, ModelType } from '../types';
import { PopFunction } from './function';
import { PopInstance } from './instance';

export class PopClass extends PopObject implements Callable {
  protected env: Environment;
  protected name: string;
  protected superClass: PopClass | null;
  protected fields = new Map<string, PopObject>();
  protected methods: Map<string, PopFunction> = new Map();

  constructor(env: Environment, name: string, superClass: PopClass | null) {
    super();
    this.type = ModelType.CLASS;
    this.env = env;
    this.name = name;
    this.superClass = superClass;
  }

  call(args: PopObject[]): PopInstance {
    const instance = new PopInstance(this);
    const init = this.methods.get('init');
    if (init) {
      init.bind(instance).call(args);
    }
    return instance;
  }

  getName() {
    return this.name;
  }

  getSuperClass() {
    return this.superClass;
  }

  getProperty(name: string): PopObject | null {
    const prop = this.fields.get(name);
    if (prop) {
      return prop;
    }

    return null;
  }

  setProperty(name: string, object: PopObject) {
    this.fields.set(name, object);
  }

  getMethod(name: string): PopFunction | null {
    const method = this.methods.get(name);
    if (method) {
      return method;
    }
    if (this.superClass) {
      return this.superClass.getMethod(name);
    }
    return null;
  }

  setMethod(name: string, method: PopFunction) {
    this.methods.set(name, method);
  }

  toString(): string {
    return `<Class ${this.name}>`;
  }
}
