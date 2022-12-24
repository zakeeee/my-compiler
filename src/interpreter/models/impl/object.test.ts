import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopObject from './object'
import PopString from './string'

describe('PopObject', () => {
  test('equal', () => {
    const a = new PopObject()
    const b = new PopObject()
    expect(a.equal(a)).toBe(C_TRUE)
    expect(a.equal(b)).toBe(C_FALSE)
  })

  test('toBoolean', () => {
    const a = new PopObject().toBoolean()
    expect(a).toBe(C_TRUE)
  })

  test('toString', () => {
    const a = new PopObject().toString()
    const b = new PopString('<Object>')
    expect(a.equal(b)).toBe(C_TRUE)
  })

  test('type', () => {
    const a = new PopObject().type
    expect(a).toBe(ObjectType.OBJECT)
  })
})
