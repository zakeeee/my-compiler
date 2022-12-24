import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopNumber from './number'
import PopString from './string'

describe('PopString', () => {
  test('add', () => {
    const a = new PopString('123')
    const b = new PopString('456')
    const c = new PopString('123456')
    expect(a.add(b).equal(c)).toBe(C_TRUE)
  })

  test('equal', () => {
    const a = new PopString('123')
    const b = new PopString('123')
    const c = new PopString('124')
    expect(a.equal(b)).toBe(C_TRUE)
    expect(a.equal(c)).toBe(C_FALSE)
  })

  test('length', () => {
    const len1 = new PopString('').length()
    const len2 = new PopString('123').length()
    expect(len1.equal(new PopNumber(0))).toBe(C_TRUE)
    expect(len2.equal(new PopNumber(3))).toBe(C_TRUE)
  })

  test('toBoolean', () => {
    const a = new PopString('').toBoolean()
    const b = new PopString('123').toBoolean()
    expect(a).toBe(C_FALSE)
    expect(b).toBe(C_TRUE)
  })

  test('toString', () => {
    const a = new PopString('123').toString()
    expect(a).toBe(a)
    expect(a.equal(new PopString('123'))).toBe(C_TRUE)
  })

  test('type', () => {
    const a = new PopString('123').type
    expect(a).toBe(ObjectType.STRING)
  })

  test('unwrap', () => {
    const a = new PopString('123').unwrap()
    expect(a).toBe('123')
  })
})
