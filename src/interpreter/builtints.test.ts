import { BlockStatement } from 'src/ast'
import { describe, expect, test } from 'vitest'
import { len, str, type } from './builtins'
import PopBooleanImpl from './models/impl/boolean'
import PopFunctionImpl from './models/impl/function'
import PopNullImpl from './models/impl/null'
import PopNumberImpl from './models/impl/number'
import PopStringImpl from './models/impl/string'
import { ObjectType } from './models/types'

describe('Builtins', () => {
  test('len', () => {
    const s = new PopStringImpl('123')
    expect(len(s).$equal(new PopNumberImpl(3))).toBe(PopBooleanImpl.TRUE)
  })

  test('type', () => {
    const _null = PopNullImpl.NULL
    expect(type(_null).$equal(new PopStringImpl(ObjectType.NULL))).toBe(PopBooleanImpl.TRUE)

    const _true = PopBooleanImpl.TRUE
    const _false = PopBooleanImpl.FALSE
    expect(type(_true).$equal(new PopStringImpl(ObjectType.BOOLEAN))).toBe(PopBooleanImpl.TRUE)
    expect(type(_false).$equal(new PopStringImpl(ObjectType.BOOLEAN))).toBe(PopBooleanImpl.TRUE)

    const _num = new PopNumberImpl(123)
    expect(type(_num).$equal(new PopStringImpl(ObjectType.NUMBER))).toBe(PopBooleanImpl.TRUE)

    const _str = new PopStringImpl('123')
    expect(type(_str).$equal(new PopStringImpl(ObjectType.STRING))).toBe(PopBooleanImpl.TRUE)

    const _func = new PopFunctionImpl([], new BlockStatement(), 'foo')
    expect(type(_func).$equal(new PopStringImpl(ObjectType.FUNCTION))).toBe(PopBooleanImpl.TRUE)
  })

  test('str', () => {
    const _null = PopNullImpl.NULL
    expect(str(_null).$equal(new PopStringImpl('null'))).toBe(PopBooleanImpl.TRUE)

    const _true = PopBooleanImpl.TRUE
    const _false = PopBooleanImpl.FALSE
    expect(str(_true).$equal(new PopStringImpl('true'))).toBe(PopBooleanImpl.TRUE)
    expect(str(_false).$equal(new PopStringImpl('false'))).toBe(PopBooleanImpl.TRUE)

    const _num = new PopNumberImpl(123)
    expect(str(_num).$equal(new PopStringImpl('123'))).toBe(PopBooleanImpl.TRUE)

    const _str = new PopStringImpl('123')
    expect(str(_str).$equal(new PopStringImpl('123'))).toBe(PopBooleanImpl.TRUE)

    const _func = new PopFunctionImpl([], new BlockStatement(), 'foo')
    expect(str(_func).$equal(new PopStringImpl(`<Function foo>`))).toBe(PopBooleanImpl.TRUE)
  })
})
