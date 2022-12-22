import { BlockStatement } from 'src/ast'
import { describe, expect, test } from 'vitest'
import { builtinFunctions } from './builtins'
import PopBooleanImpl from './boolean'
import PopFunctionImpl from './function'
import PopNullImpl from './null'
import PopNumberImpl from './number'
import PopStringImpl from './string'
import { ObjectType } from '../types'

const { len, type, str } = builtinFunctions

describe('Builtins', () => {
  test('len', () => {
    const s = new PopStringImpl('123')
    expect(len.$call([s]).$equal(new PopNumberImpl(3))).toBe(PopBooleanImpl.TRUE)
  })

  test('type', () => {
    const _null = PopNullImpl.NULL
    expect(type.$call([_null]).$equal(new PopStringImpl(ObjectType.NULL))).toBe(PopBooleanImpl.TRUE)

    const _true = PopBooleanImpl.TRUE
    const _false = PopBooleanImpl.FALSE
    expect(type.$call([_true]).$equal(new PopStringImpl(ObjectType.BOOLEAN))).toBe(
      PopBooleanImpl.TRUE
    )
    expect(type.$call([_false]).$equal(new PopStringImpl(ObjectType.BOOLEAN))).toBe(
      PopBooleanImpl.TRUE
    )

    const _num = new PopNumberImpl(123)
    expect(type.$call([_num]).$equal(new PopStringImpl(ObjectType.NUMBER))).toBe(
      PopBooleanImpl.TRUE
    )

    const _str = new PopStringImpl('123')
    expect(type.$call([_str]).$equal(new PopStringImpl(ObjectType.STRING))).toBe(
      PopBooleanImpl.TRUE
    )

    const _func = new PopFunctionImpl([], new BlockStatement(), 'foo')
    expect(type.$call([_func]).$equal(new PopStringImpl(ObjectType.FUNCTION))).toBe(
      PopBooleanImpl.TRUE
    )
  })

  test('str', () => {
    const _null = PopNullImpl.NULL
    expect(str.$call([_null]).$equal(new PopStringImpl('null'))).toBe(PopBooleanImpl.TRUE)

    const _true = PopBooleanImpl.TRUE
    const _false = PopBooleanImpl.FALSE
    expect(str.$call([_true]).$equal(new PopStringImpl('true'))).toBe(PopBooleanImpl.TRUE)
    expect(str.$call([_false]).$equal(new PopStringImpl('false'))).toBe(PopBooleanImpl.TRUE)

    const _num = new PopNumberImpl(123)
    expect(str.$call([_num]).$equal(new PopStringImpl('123'))).toBe(PopBooleanImpl.TRUE)

    const _str = new PopStringImpl('123')
    expect(str.$call([_str]).$equal(new PopStringImpl('123'))).toBe(PopBooleanImpl.TRUE)

    const _func = new PopFunctionImpl([], new BlockStatement(), 'foo')
    expect(str.$call([_func]).$equal(new PopStringImpl(`<Function foo>`))).toBe(PopBooleanImpl.TRUE)
  })
})
