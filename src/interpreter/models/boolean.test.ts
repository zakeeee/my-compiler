import { describe, expect, test } from 'vitest';
import PopBoolean from './boolean';
import PopNull from './null';
import { ObjectType } from './object';

describe('PopBoolean', () => {
  test('equals', () => {
    expect(PopBoolean.TRUE.equals(PopBoolean.TRUE)).toBe(PopBoolean.TRUE);
    expect(PopBoolean.FALSE.equals(PopBoolean.FALSE)).toBe(PopBoolean.TRUE);
    expect(PopBoolean.TRUE.equals(PopBoolean.FALSE)).toBe(PopBoolean.FALSE);
    expect(PopBoolean.FALSE.equals(PopBoolean.TRUE)).toBe(PopBoolean.FALSE);
    expect(PopBoolean.TRUE.equals(new PopNull())).toBe(PopBoolean.FALSE);
    expect(PopBoolean.FALSE.equals(new PopNull())).toBe(PopBoolean.FALSE);
  });

  test('toBoolean', () => {
    expect(PopBoolean.TRUE.toBoolean()).toBe(PopBoolean.TRUE);
    expect(PopBoolean.FALSE.toBoolean()).toBe(PopBoolean.FALSE);
  });

  test('toString', () => {
    expect(PopBoolean.TRUE.toString().$unwrap()).toBe('true');
    expect(PopBoolean.FALSE.toString().$unwrap()).toBe('false');
  });

  test('$type', () => {
    expect(PopBoolean.TRUE.$type()).toBe(ObjectType.BOOLEAN);
    expect(PopBoolean.FALSE.$type()).toBe(ObjectType.BOOLEAN);
  });

  test('$unwrap', () => {
    expect(PopBoolean.TRUE.$unwrap()).toBe(true);
    expect(PopBoolean.FALSE.$unwrap()).toBe(false);
  });
});
