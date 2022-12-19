import { describe, expect, test } from 'vitest';
import PopBoolean from './boolean';
import PopNull from './null';
import { ObjectType } from './object';

describe('PopNull', () => {
  test('equals', () => {
    expect(PopNull.NULL.equals(PopNull.NULL)).toBe(PopBoolean.TRUE);
    expect(PopNull.NULL.equals(PopBoolean.TRUE)).toBe(PopBoolean.FALSE);
  });

  test('toBoolean', () => {
    expect(PopNull.NULL.toBoolean()).toBe(PopBoolean.FALSE);
  });

  test('toString', () => {
    expect(PopNull.NULL.toString().$unwrap()).toBe('null');
  });

  test('$unwrap', () => {
    expect(PopNull.NULL.$unwrap()).toBe(null);
  });

  test('$type', () => {
    expect(PopNull.NULL.$type()).toBe(ObjectType.NULL);
  });
});
