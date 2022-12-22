import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopObjectImpl from './object'
import PopStringImpl from './string'

describe('PopObject', () => {
  test('$equal', () => {
    const a = new PopObjectImpl()
    const b = new PopObjectImpl()
    expect(a.$equal(a)).toBe(C_TRUE)
    expect(a.$equal(b)).toBe(C_FALSE)
  })

  test('$toBoolean', () => {
    const a = new PopObjectImpl().$toBoolean()
    expect(a).toBe(C_TRUE)
  })

  test('$toString', () => {
    const a = new PopObjectImpl().$toString()
    const b = new PopStringImpl('<Object>')
    expect(a.$equal(b)).toBe(C_TRUE)
  })

  test('$type', () => {
    const a = new PopObjectImpl().$type()
    expect(a).toBe(ObjectType.OBJECT)
  })
})
