import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import PopBooleanImpl from './boolean'
import PopNullImpl from './null'
import PopStringImpl from './string'

describe('PopNull', () => {
  test('$equal', () => {
    expect(PopNullImpl.NULL.$equal(PopNullImpl.NULL)).toBe(PopBooleanImpl.TRUE)
    expect(PopNullImpl.NULL.$equal(PopBooleanImpl.TRUE)).toBe(PopBooleanImpl.FALSE)
  })

  test('$toBoolean', () => {
    const a = PopNullImpl.NULL.$toBoolean()
    expect(a).toBe(PopBooleanImpl.FALSE)
  })

  test('$toString', () => {
    const a = PopNullImpl.NULL.$toString()
    const b = new PopStringImpl('null')
    expect(a.$equal(b)).toBe(PopBooleanImpl.TRUE)
  })

  test('$unwrap', () => {
    const a = PopNullImpl.NULL.$unwrap()
    expect(a).toBe(null)
  })

  test('$type', () => {
    const a = PopNullImpl.NULL.$type()
    expect(a).toBe(ObjectType.NULL)
  })
})
