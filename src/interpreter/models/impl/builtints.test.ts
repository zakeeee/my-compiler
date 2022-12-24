import { BlockStatement } from 'src/ast'
import { Scope } from 'src/interpreter/scope'
import { Token } from 'src/lexer'
import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import { builtinFunctions } from './builtins'
import PopFunction from './function'
import { C_NULL } from './null'
import PopNumber from './number'
import PopString from './string'

const { len, type, str } = builtinFunctions

describe('Builtins', () => {
  test('len', () => {
    const s = new PopString('123')
    expect(len.call([s]).equal(new PopNumber(3))).toBe(C_TRUE)
  })

  test('type', () => {
    const _null = C_NULL
    expect(type.call([_null]).equal(new PopString(ObjectType.NULL))).toBe(C_TRUE)

    const _true = C_TRUE
    const _false = C_FALSE
    expect(type.call([_true]).equal(new PopString(ObjectType.BOOLEAN))).toBe(C_TRUE)
    expect(type.call([_false]).equal(new PopString(ObjectType.BOOLEAN))).toBe(C_TRUE)

    const _num = new PopNumber(123)
    expect(type.call([_num]).equal(new PopString(ObjectType.NUMBER))).toBe(C_TRUE)

    const _str = new PopString('123')
    expect(type.call([_str]).equal(new PopString(ObjectType.STRING))).toBe(C_TRUE)

    const _func = new PopFunction(
      [],
      new BlockStatement(
        {
          token: Token.NUMBER_LITERAL,
          literal: '1',
          start: { line: 1, column: 1 },
          end: { line: 1, column: 1 },
        },
        []
      ),
      new Scope(),
      'foo'
    )
    expect(type.call([_func]).equal(new PopString(ObjectType.FUNCTION))).toBe(C_TRUE)
  })

  test('str', () => {
    const _null = C_NULL
    expect(str.call([_null]).equal(new PopString('null'))).toBe(C_TRUE)

    const _true = C_TRUE
    const _false = C_FALSE
    expect(str.call([_true]).equal(new PopString('true'))).toBe(C_TRUE)
    expect(str.call([_false]).equal(new PopString('false'))).toBe(C_TRUE)

    const _num = new PopNumber(123)
    expect(str.call([_num]).equal(new PopString('123'))).toBe(C_TRUE)

    const _str = new PopString('123')
    expect(str.call([_str]).equal(new PopString('123'))).toBe(C_TRUE)

    const _func = new PopFunction(
      [],
      new BlockStatement(
        {
          token: Token.NUMBER_LITERAL,
          literal: '1',
          start: { line: 1, column: 1 },
          end: { line: 1, column: 1 },
        },
        []
      ),
      new Scope(),
      'foo'
    )
    expect(str.call([_func]).equal(new PopString(`<Function foo>`))).toBe(C_TRUE)
  })
})
