import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import { C_NULL } from './null'
import PopString from './string'

describe('PopBoolean', () => {
  test('equal', () => {
    expect(C_TRUE.equal(C_TRUE)).toBe(C_TRUE)
    expect(C_FALSE.equal(C_FALSE)).toBe(C_TRUE)
    expect(C_TRUE.equal(C_FALSE)).toBe(C_FALSE)
    expect(C_FALSE.equal(C_TRUE)).toBe(C_FALSE)
    expect(C_TRUE.equal(C_NULL)).toBe(C_FALSE)
    expect(C_FALSE.equal(C_NULL)).toBe(C_FALSE)
  })

  test('not', () => {
    expect(C_TRUE.not()).toBe(C_FALSE)
    expect(C_FALSE.not()).toBe(C_TRUE)
  })

  test('toBoolean', () => {
    const a = C_TRUE.toBoolean()
    const b = C_FALSE.toBoolean()
    expect(a).toBe(C_TRUE)
    expect(b).toBe(C_FALSE)
  })

  test('toString', () => {
    const a = C_TRUE.toString()
    const b = C_FALSE.toString()
    expect(a.equal(new PopString('true'))).toBe(C_TRUE)
    expect(b.equal(new PopString('false'))).toBe(C_TRUE)
  })

  test('type', () => {
    const a = C_TRUE.type
    const b = C_FALSE.type
    expect(a).toBe(ObjectType.BOOLEAN)
    expect(b).toBe(ObjectType.BOOLEAN)
  })

  test('unwrap', () => {
    const a = C_TRUE.unwrap()
    const b = C_FALSE.unwrap()
    expect(a).toBe(true)
    expect(b).toBe(false)
  })
})
