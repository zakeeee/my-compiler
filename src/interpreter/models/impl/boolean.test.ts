import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import PopBooleanImpl from './boolean'
import PopNullImpl from './null'
import PopStringImpl from './string'

describe('PopBoolean', () => {
  test('$equal', () => {
    expect(PopBooleanImpl.TRUE.$equal(PopBooleanImpl.TRUE)).toBe(PopBooleanImpl.TRUE)
    expect(PopBooleanImpl.FALSE.$equal(PopBooleanImpl.FALSE)).toBe(PopBooleanImpl.TRUE)
    expect(PopBooleanImpl.TRUE.$equal(PopBooleanImpl.FALSE)).toBe(PopBooleanImpl.FALSE)
    expect(PopBooleanImpl.FALSE.$equal(PopBooleanImpl.TRUE)).toBe(PopBooleanImpl.FALSE)
    expect(PopBooleanImpl.TRUE.$equal(PopNullImpl.NULL)).toBe(PopBooleanImpl.FALSE)
    expect(PopBooleanImpl.FALSE.$equal(PopNullImpl.NULL)).toBe(PopBooleanImpl.FALSE)
  })

  test('$not', () => {
    expect(PopBooleanImpl.TRUE.$not()).toBe(PopBooleanImpl.FALSE)
    expect(PopBooleanImpl.FALSE.$not()).toBe(PopBooleanImpl.TRUE)
  })

  test('$toBoolean', () => {
    const a = PopBooleanImpl.TRUE.$toBoolean()
    const b = PopBooleanImpl.FALSE.$toBoolean()
    expect(a).toBe(PopBooleanImpl.TRUE)
    expect(b).toBe(PopBooleanImpl.FALSE)
  })

  test('$toString', () => {
    const a = PopBooleanImpl.TRUE.$toString()
    const b = PopBooleanImpl.FALSE.$toString()
    expect(a.$equal(new PopStringImpl('true'))).toBe(PopBooleanImpl.TRUE)
    expect(b.$equal(new PopStringImpl('false'))).toBe(PopBooleanImpl.TRUE)
  })

  test('$type', () => {
    const a = PopBooleanImpl.TRUE.$type()
    const b = PopBooleanImpl.FALSE.$type()
    expect(a).toBe(ObjectType.BOOLEAN)
    expect(b).toBe(ObjectType.BOOLEAN)
  })

  test('$unwrap', () => {
    const a = PopBooleanImpl.TRUE.$unwrap()
    const b = PopBooleanImpl.FALSE.$unwrap()
    expect(a).toBe(true)
    expect(b).toBe(false)
  })
})
