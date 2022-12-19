import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import PopBooleanImpl from './boolean'
import PopObjectImpl from './object'
import PopStringImpl from './string'

describe('PopObject', () => {
  test('$equal', () => {
    const a = new PopObjectImpl()
    const b = new PopObjectImpl()
    expect(a.$equal(a)).toBe(PopBooleanImpl.TRUE)
    expect(a.$equal(b)).toBe(PopBooleanImpl.FALSE)
  })

  test('$toBoolean', () => {
    const a = new PopObjectImpl().$toBoolean()
    expect(a).toBe(PopBooleanImpl.TRUE)
  })

  test('$toString', () => {
    const a = new PopObjectImpl().$toString()
    const b = new PopStringImpl('<Object>')
    expect(a.$equal(b)).toBe(PopBooleanImpl.TRUE)
  })

  test('$type', () => {
    const a = new PopObjectImpl().$type()
    expect(a).toBe(ObjectType.OBJECT)
  })
})
