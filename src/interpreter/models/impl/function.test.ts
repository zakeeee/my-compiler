import { BlockStatement } from 'src/ast'
import { Scope } from 'src/interpreter/scope'
import { Token } from 'src/lexer'
import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import { C_TRUE } from './boolean'
import PopFunction from './function'
import PopString from './string'

describe('PopFunction', () => {
  test('equal', () => {})

  test('toBoolean', () => {
    const func = new PopFunction(
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
      new Scope()
    )
    expect(func.toBoolean()).toBe(C_TRUE)
  })

  test('toString', () => {
    const func1 = new PopFunction(
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
      new Scope()
    )
    const func2 = new PopFunction(
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
    const a = func1.toString()
    const b = func2.toString()
    const c = new PopString(`<Function anonymous>`)
    const d = new PopString(`<Function foo>`)
    expect(a.equal(c)).toBe(C_TRUE)
    expect(b.equal(d)).toBe(C_TRUE)
  })

  test('type', () => {
    const func = new PopFunction(
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
      new Scope()
    )
    expect(func.type).toBe(ObjectType.FUNCTION)
  })
})
