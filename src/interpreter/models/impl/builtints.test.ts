import { BlockStatement } from 'src/ast'
import { describe, expect, test } from 'vitest'
import { builtinFunctions } from './builtins'
import { C_FALSE, C_TRUE } from './boolean'
import PopFunctionImpl from './function'
import { C_NULL } from './null'
import PopNumberImpl from './number'
import PopStringImpl from './string'
import { ObjectType } from '../types'

const { len, type, str } = builtinFunctions

describe('Builtins', () => {
  test('len', () => {
    const s = new PopStringImpl('123')
    expect(len.$call([s]).$equal(new PopNumberImpl(3))).toBe(C_TRUE)
  })

  test('type', () => {
    const _null = C_NULL
    expect(type.$call([_null]).$equal(new PopStringImpl(ObjectType.NULL))).toBe(C_TRUE)

    const _true = C_TRUE
    const _false = C_FALSE
    expect(type.$call([_true]).$equal(new PopStringImpl(ObjectType.BOOLEAN))).toBe(C_TRUE)
    expect(type.$call([_false]).$equal(new PopStringImpl(ObjectType.BOOLEAN))).toBe(C_TRUE)

    const _num = new PopNumberImpl(123)
    expect(type.$call([_num]).$equal(new PopStringImpl(ObjectType.NUMBER))).toBe(C_TRUE)

    const _str = new PopStringImpl('123')
    expect(type.$call([_str]).$equal(new PopStringImpl(ObjectType.STRING))).toBe(C_TRUE)

    const _func = new PopFunctionImpl([], new BlockStatement(), 'foo')
    expect(type.$call([_func]).$equal(new PopStringImpl(ObjectType.FUNCTION))).toBe(C_TRUE)
  })

  test('str', () => {
    const _null = C_NULL
    expect(str.$call([_null]).$equal(new PopStringImpl('null'))).toBe(C_TRUE)

    const _true = C_TRUE
    const _false = C_FALSE
    expect(str.$call([_true]).$equal(new PopStringImpl('true'))).toBe(C_TRUE)
    expect(str.$call([_false]).$equal(new PopStringImpl('false'))).toBe(C_TRUE)

    const _num = new PopNumberImpl(123)
    expect(str.$call([_num]).$equal(new PopStringImpl('123'))).toBe(C_TRUE)

    const _str = new PopStringImpl('123')
    expect(str.$call([_str]).$equal(new PopStringImpl('123'))).toBe(C_TRUE)

    const _func = new PopFunctionImpl([], new BlockStatement(), 'foo')
    expect(str.$call([_func]).$equal(new PopStringImpl(`<Function foo>`))).toBe(C_TRUE)
  })
})
