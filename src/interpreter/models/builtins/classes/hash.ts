import { Environment } from 'src/interpreter/environment'
import { PopClass } from '../class'
import { PopFunction } from '../function'
import { PopHash } from '../hash'
import { PopInstance } from '../instance'
import { NULL } from '../null'
import { PopNumber } from '../number'
import { PopObject } from '../object'
import { PopString } from '../string'
import { ObjectClass } from './object'

export type HashInstance = PopInstance & {
  hash: PopHash
}

export class HashClass extends PopClass {
  constructor(env: Environment, superClass: ObjectClass) {
    super(env, 'Hash', superClass)

    this.setMethod(
      'init',
      new PopFunction(this.env, {
        name: 'init',
        params: ['arg0'],
        func: (env) => {
          const thisInstance = env.getValue<HashInstance>('this')!
          const arg0 = env.getValue('arg0')
          if (arg0 instanceof PopHash) {
            thisInstance.hash = arg0
            return NULL
          }
          if (arg0 instanceof PopInstance && arg0.isInstanceOf(this)) {
            thisInstance.hash = new PopHash((arg0 as HashInstance).hash.getMap())
            return NULL
          }
          throw new Error('')
        },
      })
    )

    this.setMethod(
      'size',
      new PopFunction(this.env, {
        name: 'size',
        params: [],
        func: (env) => {
          const thisInstance = env.getValue<HashInstance>('this')!
          return new PopNumber(thisInstance.hash.size())
        },
      })
    )

    this.setMethod(
      'get',
      new PopFunction(this.env, {
        name: 'get',
        params: ['key'],
        func: (env) => {
          const thisInstance = env.getValue<HashInstance>('this')!
          const key = env.getValue('key')
          if (!(key instanceof PopString)) {
            throw new Error('invalid arg type of param "key"')
          }
          thisInstance.hash.get(key.getValue())
          return NULL
        },
      })
    )

    this.setMethod(
      'set',
      new PopFunction(this.env, {
        name: 'set',
        params: ['key', 'value'],
        func: (env) => {
          const thisInstance = env.getValue<HashInstance>('this')!
          const key = env.getValue('key')
          const value = env.getValue('value')
          if (!(key instanceof PopString)) {
            throw new Error('invalid arg type of param "key"')
          }
          if (!(value instanceof PopObject)) {
            throw new Error('invalid arg type of param "value"')
          }
          thisInstance.hash.set(key.getValue(), value)
          return NULL
        },
      })
    )

    this.setMethod(
      'toString',
      new PopFunction(this.env, {
        name: 'toString',
        params: [],
        func: (env) => {
          const thisInstance = env.getValue<HashInstance>('this')!
          return new PopString(thisInstance.hash.toString())
        },
      })
    )
  }
}
