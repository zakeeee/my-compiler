import { BlockStatement } from 'src/ast'
import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import { C_TRUE } from './boolean'
import PopFunctionImpl from './function'
import PopStringImpl from './string'

describe('PopFunction', () => {
  test('$equal', () => {})

  test('$toBoolean', () => {
    const func = new PopFunctionImpl([], new BlockStatement())
    expect(func.$toBoolean()).toBe(C_TRUE)
  })

  test('$toString', () => {
    const func1 = new PopFunctionImpl([], new BlockStatement())
    const func2 = new PopFunctionImpl([], new BlockStatement(), 'foo')
    const a = func1.$toString()
    const b = func2.$toString()
    const c = new PopStringImpl(`<Function anonymous>`)
    const d = new PopStringImpl(`<Function foo>`)
    expect(a.$equal(c)).toBe(C_TRUE)
    expect(b.$equal(d)).toBe(C_TRUE)
  })

  test('$type', () => {
    const func = new PopFunctionImpl([], new BlockStatement())
    expect(func.$type()).toBe(ObjectType.FUNCTION)
  })
})
