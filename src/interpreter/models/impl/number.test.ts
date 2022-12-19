import { describe, expect, test } from 'vitest'
import { ObjectType } from '../types'
import PopBooleanImpl from './boolean'
import PopNumberImpl from './number'
import PopStringImpl from './string'

describe('PopNumber', () => {
  test('$equal', () => {
    const a = new PopNumberImpl(1.0)
    const b = new PopNumberImpl(1.0)
    const c = new PopNumberImpl(2)
    expect(a.$equal(b)).toBe(PopBooleanImpl.TRUE)
    expect(a.$equal(c)).toBe(PopBooleanImpl.FALSE)
  })

  test('$toBoolean', () => {
    const a = new PopNumberImpl(0).$toBoolean()
    const b = new PopNumberImpl(1).$toBoolean()
    expect(a).toBe(PopBooleanImpl.FALSE)
    expect(b).toBe(PopBooleanImpl.TRUE)
  })

  test('$toString', () => {
    const a = new PopNumberImpl(123).$toString()
    const b = new PopNumberImpl(1.2).$toString()
    expect(a.$equal(new PopStringImpl('123'))).toBe(PopBooleanImpl.TRUE)
    expect(b.$equal(new PopStringImpl('1.2'))).toBe(PopBooleanImpl.TRUE)
  })

  test('$type', () => {
    const a = new PopNumberImpl(123).$type()
    expect(a).toBe(ObjectType.NUMBER)
  })

  test('$unwrap', () => {
    const a = new PopNumberImpl(123).$unwrap()
    expect(a).toBe(123)
  })

  test('$add', () => {
    const a = new PopNumberImpl(123)
    const b = new PopNumberImpl(123)
    const c = a.$add(b)
    expect(c.$equal(new PopNumberImpl(246))).toBe(PopBooleanImpl.TRUE)
  })

  test('$minus', () => {
    const a = new PopNumberImpl(123)
    const b = new PopNumberImpl(123)
    const c = a.$minus(b)
    expect(c.$equal(new PopNumberImpl(0))).toBe(PopBooleanImpl.TRUE)
  })

  test('$multiply', () => {
    const a = new PopNumberImpl(2)
    const b = new PopNumberImpl(2)
    const c = a.$multiply(b)
    expect(c.$equal(new PopNumberImpl(4))).toBe(PopBooleanImpl.TRUE)
  })

  test('$divide', () => {
    const a = new PopNumberImpl(2)
    const b = new PopNumberImpl(2)
    const c = a.$divide(b)
    expect(c.$equal(new PopNumberImpl(1))).toBe(PopBooleanImpl.TRUE)
  })

  test('$modulo', () => {
    const a = new PopNumberImpl(2)
    const b = new PopNumberImpl(3)
    const c = a.$modulo(b)
    expect(c.$equal(new PopNumberImpl(2))).toBe(PopBooleanImpl.TRUE)
  })

  test('$toPositive', () => {
    const a = new PopNumberImpl(2)
    const b = a.$toPositive()
    expect(a).toBe(b)
    expect(a.$equal(b)).toBe(PopBooleanImpl.TRUE)
  })

  test('$toNegative', () => {
    const a = new PopNumberImpl(2)
    const b = new PopNumberImpl(0)
    expect(a.$toNegative().$equal(new PopNumberImpl(-2))).toBe(PopBooleanImpl.TRUE)
    expect(b.$toNegative().$equal(new PopNumberImpl(0))).toBe(PopBooleanImpl.TRUE)
  })

  test('$bitNot', () => {
    const a = new PopNumberImpl(2)
    expect(a.$bitNot().$equal(new PopNumberImpl(~2))).toBe(PopBooleanImpl.TRUE)
  })

  test('$bitAnd', () => {
    const a = new PopNumberImpl(123)
    const b = new PopNumberImpl(456)
    expect(a.$bitAnd(b).$equal(new PopNumberImpl(123 & 456))).toBe(PopBooleanImpl.TRUE)
  })

  test('$bitOr', () => {
    const a = new PopNumberImpl(123)
    const b = new PopNumberImpl(456)
    expect(a.$bitOr(b).$equal(new PopNumberImpl(123 | 456))).toBe(PopBooleanImpl.TRUE)
  })

  test('$bitXor', () => {
    const a = new PopNumberImpl(123)
    const b = new PopNumberImpl(456)
    expect(a.$bitXor(b).$equal(new PopNumberImpl(123 ^ 456))).toBe(PopBooleanImpl.TRUE)
  })

  test('$greaterThan', () => {
    const a = new PopNumberImpl(2)
    const b = new PopNumberImpl(1)
    expect(a.$greaterThan(b)).toBe(PopBooleanImpl.TRUE)
  })

  test('$greaterThanEqual', () => {
    const a = new PopNumberImpl(2)
    const b = new PopNumberImpl(2)
    expect(a.$greaterThanEqual(b)).toBe(PopBooleanImpl.TRUE)
  })

  test('$lessThan', () => {
    const a = new PopNumberImpl(1)
    const b = new PopNumberImpl(2)
    expect(a.$lessThan(b)).toBe(PopBooleanImpl.TRUE)
  })

  test('$lessThanEqual', () => {
    const a = new PopNumberImpl(2)
    const b = new PopNumberImpl(2)
    expect(a.$lessThanEqual(b)).toBe(PopBooleanImpl.TRUE)
  })
})
