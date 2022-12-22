import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import { C_NULL } from './null'
import PopStringImpl from './string'

describe('PopNull', () => {
  test('$equal', () => {
    expect(C_NULL.$equal(C_NULL)).toBe(C_TRUE)
    expect(C_NULL.$equal(C_TRUE)).toBe(C_FALSE)
  })

  test('$toBoolean', () => {
    const a = C_NULL.$toBoolean()
    expect(a).toBe(C_FALSE)
  })

  test('$toString', () => {
    const a = C_NULL.$toString()
    const b = new PopStringImpl('null')
    expect(a.$equal(b)).toBe(C_TRUE)
  })

  test('$unwrap', () => {
    const a = C_NULL.$unwrap()
    expect(a).toBe(null)
  })

  test('$type', () => {
    const a = C_NULL.$type()
    expect(a).toBe(ObjectType.NULL)
  })
})
