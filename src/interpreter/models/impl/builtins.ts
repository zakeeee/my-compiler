import { ObjectType, PopBoolean, PopBuiltinFunction, PopObject, PopString } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import { C_NULL } from './null'
import PopStringImpl from './string'

export abstract class PopBuiltinFunctionImpl implements PopBuiltinFunction {
  protected constructor(private name: string, private parameters: string[]) {}

  abstract $call(args: PopObject[]): PopObject

  get $name(): string {
    return this.name
  }

  get $parameters(): string[] {
    return [...this.parameters]
  }

  $equal(other: PopObject): PopBoolean {
    return this === other ? C_TRUE : C_FALSE
  }

  $toBoolean(): PopBoolean {
    return C_TRUE
  }

  $toString(): PopString {
    return new PopStringImpl(`<BuiltInFunction ${this.$name}>`)
  }

  $type(): ObjectType {
    return ObjectType.BUILTIN_FUNCTION
  }
}

class Builtin_Len extends PopBuiltinFunctionImpl {
  constructor() {
    super('len', ['arg'])
  }

  $call(args: PopObject[]): PopObject {
    const [arg] = args
    if ('$length' in arg && typeof (arg as any).$length === 'function') {
      return (arg as any).$length()
    }
    throw new Error(`cannot perform len operation on ${arg.$type()}`)
  }
}

class Builtin_Type extends PopBuiltinFunctionImpl {
  constructor() {
    super('type', ['arg'])
  }

  $call(args: PopObject[]): PopObject {
    const [arg] = args
    return new PopStringImpl(arg.$type())
  }
}

class Builtin_Str extends PopBuiltinFunctionImpl {
  constructor() {
    super('str', ['arg'])
  }

  $call(args: PopObject[]): PopObject {
    const [arg] = args
    return arg.$toString()
  }
}

class Builtin_Print extends PopBuiltinFunctionImpl {
  constructor() {
    super('print', ['args'])
  }

  $call(args: PopObject[]): PopObject {
    console.log(...args.map((o) => o.$toString().$unwrap()))
    return C_NULL
  }
}

export const builtinFunctions = Object.freeze({
  len: new Builtin_Len(),
  type: new Builtin_Type(),
  str: new Builtin_Str(),
  print: new Builtin_Print(),
})
