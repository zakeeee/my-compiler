import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopHash from './hash'
import PopNumber from './number'
import PopString from './string'

describe('PopHash', () => {
  test('equal', () => {
    const a = new PopHash(new Map())
    const b = a
    expect(a.equal(b)).toBe(C_TRUE)
    expect(a.equal(new PopHash(new Map()))).toBe(C_FALSE)
  })

  test('toBoolean', () => {
    const a = new PopHash(new Map())
    expect(a.toBoolean()).toBe(C_TRUE)
  })

  test('toString', () => {
    const a = new PopHash(new Map())
    const b = new PopHash(
      new Map([
        ['a', new PopNumber(1)],
        ['b', new PopNumber(2)],
      ])
    )
    expect(a.toString().equal(new PopString('{}'))).toBe(C_TRUE)
    expect(b.toString().equal(new PopString('{"a": 1, "b": 2}'))).toBe(C_TRUE)
  })

  test('type', () => {
    const a = new PopHash(new Map())
    expect(a.type).toBe(ObjectType.HASH)
  })

  test('index', () => {
    const a = new PopHash(
      new Map([
        ['a', new PopNumber(1)],
        ['b', new PopNumber(2)],
      ])
    )
    expect(a.index(new PopString('a')).equal(new PopNumber(1))).toBe(C_TRUE)
  })
})
