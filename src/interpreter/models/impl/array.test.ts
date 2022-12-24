import PopArray from 'src/interpreter/models/impl/array'
import { C_FALSE, C_TRUE } from 'src/interpreter/models/impl/boolean'
import PopNumber from 'src/interpreter/models/impl/number'
import PopString from 'src/interpreter/models/impl/string'
import { ObjectType } from 'src/interpreter/models/types'
import { describe, expect, test } from 'vitest'

describe('PopArray', () => {
  test('equal', () => {
    const a = new PopArray([])
    const b = a
    expect(a.equal(b)).toBe(C_TRUE)
    expect(a.equal(new PopArray([]))).toBe(C_FALSE)
  })

  test('toBoolean', () => {
    const a = new PopArray([])
    expect(a.toBoolean()).toBe(C_TRUE)
  })

  test('toString', () => {
    const a = new PopArray([])
    const b = new PopArray([new PopNumber(1), new PopNumber(2), new PopNumber(3)])
    expect(a.toString().equal(new PopString('[]'))).toBe(C_TRUE)
    expect(b.toString().equal(new PopString('[1, 2, 3]'))).toBe(C_TRUE)
  })

  test('type', () => {
    const a = new PopArray([])
    expect(a.type).toBe(ObjectType.ARRAY)
  })

  test('length', () => {
    const a = new PopArray([])
    expect(a.length().equal(new PopNumber(0))).toBe(C_TRUE)
  })

  test('index', () => {
    const s = new PopString('123')
    const a = new PopArray([s])
    expect(a.index(new PopNumber(0)).equal(s)).toBe(C_TRUE)
  })
})
