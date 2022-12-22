import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopNumberImpl from './number'
import PopStringImpl from './string'

describe('PopString', () => {
  test('$add', () => {
    const a = new PopStringImpl('123')
    const b = new PopStringImpl('456')
    const c = new PopStringImpl('123456')
    expect(a.$add(b).$equal(c)).toBe(C_TRUE)
  })

  test('$equal', () => {
    const a = new PopStringImpl('123')
    const b = new PopStringImpl('123')
    const c = new PopStringImpl('124')
    expect(a.$equal(b)).toBe(C_TRUE)
    expect(a.$equal(c)).toBe(C_FALSE)
  })

  test('$length', () => {
    const len1 = new PopStringImpl('').$length()
    const len2 = new PopStringImpl('123').$length()
    expect(len1.$equal(new PopNumberImpl(0))).toBe(C_TRUE)
    expect(len2.$equal(new PopNumberImpl(3))).toBe(C_TRUE)
  })

  test('$toBoolean', () => {
    const a = new PopStringImpl('').$toBoolean()
    const b = new PopStringImpl('123').$toBoolean()
    expect(a).toBe(C_FALSE)
    expect(b).toBe(C_TRUE)
  })

  test('$toString', () => {
    const a = new PopStringImpl('123').$toString()
    expect(a).toBe(a)
    expect(a.$equal(new PopStringImpl('123'))).toBe(C_TRUE)
  })

  test('$type', () => {
    const a = new PopStringImpl('123').$type()
    expect(a).toBe(ObjectType.STRING)
  })

  test('$unwrap', () => {
    const a = new PopStringImpl('123').$unwrap()
    expect(a).toBe('123')
  })
})
