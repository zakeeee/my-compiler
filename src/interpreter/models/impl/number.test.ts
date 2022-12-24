import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import { C_FALSE, C_TRUE } from './boolean'
import PopNumber from './number'
import PopString from './string'

describe('PopNumber', () => {
  test('equal', () => {
    const a = new PopNumber(1.0)
    const b = new PopNumber(1.0)
    const c = new PopNumber(2)
    expect(a.equal(b)).toBe(C_TRUE)
    expect(a.equal(c)).toBe(C_FALSE)
  })

  test('toBoolean', () => {
    const a = new PopNumber(0).toBoolean()
    const b = new PopNumber(1).toBoolean()
    expect(a).toBe(C_FALSE)
    expect(b).toBe(C_TRUE)
  })

  test('toString', () => {
    const a = new PopNumber(123).toString()
    const b = new PopNumber(1.2).toString()
    expect(a.equal(new PopString('123'))).toBe(C_TRUE)
    expect(b.equal(new PopString('1.2'))).toBe(C_TRUE)
  })

  test('type', () => {
    const a = new PopNumber(123).type
    expect(a).toBe(ObjectType.NUMBER)
  })

  test('unwrap', () => {
    const a = new PopNumber(123).unwrap()
    expect(a).toBe(123)
  })

  test('add', () => {
    const a = new PopNumber(123)
    const b = new PopNumber(123)
    const c = a.add(b)
    expect(c.equal(new PopNumber(246))).toBe(C_TRUE)
  })

  test('minus', () => {
    const a = new PopNumber(123)
    const b = new PopNumber(123)
    const c = a.minus(b)
    expect(c.equal(new PopNumber(0))).toBe(C_TRUE)
  })

  test('multiply', () => {
    const a = new PopNumber(2)
    const b = new PopNumber(2)
    const c = a.multiply(b)
    expect(c.equal(new PopNumber(4))).toBe(C_TRUE)
  })

  test('divide', () => {
    const a = new PopNumber(2)
    const b = new PopNumber(2)
    const c = a.divide(b)
    expect(c.equal(new PopNumber(1))).toBe(C_TRUE)
  })

  test('modulo', () => {
    const a = new PopNumber(2)
    const b = new PopNumber(3)
    const c = a.modulo(b)
    expect(c.equal(new PopNumber(2))).toBe(C_TRUE)
  })

  test('toPositive', () => {
    const a = new PopNumber(2)
    const b = a.toPositive()
    expect(a).toBe(b)
    expect(a.equal(b)).toBe(C_TRUE)
  })

  test('toNegative', () => {
    const a = new PopNumber(2)
    const b = new PopNumber(0)
    expect(a.toNegative().equal(new PopNumber(-2))).toBe(C_TRUE)
    expect(b.toNegative().equal(new PopNumber(0))).toBe(C_TRUE)
  })

  test('bitNot', () => {
    const a = new PopNumber(2)
    expect(a.bitNot().equal(new PopNumber(~2))).toBe(C_TRUE)
  })

  test('bitAnd', () => {
    const a = new PopNumber(123)
    const b = new PopNumber(456)
    expect(a.bitAnd(b).equal(new PopNumber(123 & 456))).toBe(C_TRUE)
  })

  test('bitOr', () => {
    const a = new PopNumber(123)
    const b = new PopNumber(456)
    expect(a.bitOr(b).equal(new PopNumber(123 | 456))).toBe(C_TRUE)
  })

  test('bitXor', () => {
    const a = new PopNumber(123)
    const b = new PopNumber(456)
    expect(a.bitXor(b).equal(new PopNumber(123 ^ 456))).toBe(C_TRUE)
  })

  test('greaterThan', () => {
    const a = new PopNumber(2)
    const b = new PopNumber(1)
    expect(a.greaterThan(b)).toBe(C_TRUE)
  })

  test('greaterThanEqual', () => {
    const a = new PopNumber(2)
    const b = new PopNumber(2)
    expect(a.greaterThanEqual(b)).toBe(C_TRUE)
  })

  test('lessThan', () => {
    const a = new PopNumber(1)
    const b = new PopNumber(2)
    expect(a.lessThan(b)).toBe(C_TRUE)
  })

  test('lessThanEqual', () => {
    const a = new PopNumber(2)
    const b = new PopNumber(2)
    expect(a.lessThanEqual(b)).toBe(C_TRUE)
  })
})
