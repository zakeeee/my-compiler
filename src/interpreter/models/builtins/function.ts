import { Environment } from 'src/interpreter/environment'
import { Callable, ModelType } from '../types'
import { PopInstance } from './instance'
import { PopObject } from './object'

interface PopFunctionDescription {
  name?: string
  params: string[]
  func: (env: Environment, func: PopFunction) => PopObject
}

export class PopFunction extends PopObject implements Callable {
  protected env: Environment
  protected name: string
  protected params: string[]
  protected func: (env: Environment, func: PopFunction) => PopObject

  constructor(env: Environment, description: PopFunctionDescription) {
    super()
    this.env = env
    this.type = ModelType.FUNCTION
    this.name = description.name ?? 'anonymous'
    this.params = description.params
    this.func = description.func
  }

  getName() {
    return this.name
  }

  getParams() {
    return [...this.params]
  }

  call(args: PopObject[]): PopObject {
    const arity = this.params.length
    const argsLen = args.length
    if (argsLen !== arity) {
      throw new Error(`"${this.name}" requires ${arity} arguments but ${argsLen} is given`)
    }
    const env = new Environment(this.env)
    this.params.forEach((name, idx) => {
      env.define(name, args[idx])
    })
    return this.func.apply(null, [env, this])
  }

  bind(instance: PopInstance): PopFunction {
    const { name, params, func } = this
    const env = new Environment(this.env)
    env.define('this', instance)
    return new PopFunction(env, {
      name,
      params,
      func,
    })
  }
}
