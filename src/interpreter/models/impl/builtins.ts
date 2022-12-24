import { IPopBoolean, IPopBuiltinFunction, IPopObject, IPopString, ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import { C_NULL } from './null'
import PopString from './string'

export abstract class PopBuiltinFunction implements IPopBuiltinFunction {
  get type(): ObjectType {
    return ObjectType.BUILTIN_FUNCTION
  }

  get name(): string {
    return this._name
  }

  get parameters(): string[] {
    return [...this._params]
  }

  protected constructor(private _name: string, private _params: string[]) {}

  abstract call(args: IPopObject[]): IPopObject

  equal(other: IPopObject): IPopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  toBoolean(): IPopBoolean {
    return C_TRUE
  }

  toString(): IPopString {
    return new PopString(`<BuiltInFunction ${this._name}>`)
  }
}

class Builtin_Len extends PopBuiltinFunction {
  constructor() {
    super('len', ['arg'])
  }

  call(args: IPopObject[]): IPopObject {
    const [arg] = args
    if ('length' in arg && typeof (arg as any).length === 'function') {
      return (arg as any).length()
    }
    throw new Error(`cannot perform len operation on ${arg.type}`)
  }
}

class Builtin_Type extends PopBuiltinFunction {
  constructor() {
    super('type', ['arg'])
  }

  call(args: IPopObject[]): IPopObject {
    const [arg] = args
    return new PopString(arg.type)
  }
}

class Builtin_Str extends PopBuiltinFunction {
  constructor() {
    super('str', ['arg'])
  }

  call(args: IPopObject[]): IPopObject {
    const [arg] = args
    return arg.toString()
  }
}

class Builtin_Print extends PopBuiltinFunction {
  constructor() {
    super('print', ['args'])
  }

  call(args: IPopObject[]): IPopObject {
    console.log(...args.map((o) => o.toString().unwrap()))
    return C_NULL
  }
}

export const builtinFunctions = Object.freeze({
  len: new Builtin_Len(),
  type: new Builtin_Type(),
  str: new Builtin_Str(),
  print: new Builtin_Print(),
})
