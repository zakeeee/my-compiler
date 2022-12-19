import { describe, expect, test } from 'vitest';
import { len, str, type } from './builtins';
import PopBoolean from './models/boolean';
import PopFunction from './models/function';
import PopNull from './models/null';
import PopNumber from './models/number';
import { ObjectType } from './models/object';
import PopString from './models/string';

describe('Builtins', () => {
  test('len', () => {
    const s = new PopString('123');
    expect(len(s).$unwrap()).toBe(3);
  });

  test('type', () => {
    const _null = PopNull.NULL;
    expect(type(_null).$unwrap()).toBe(ObjectType.NULL);

    const _true = PopBoolean.TRUE;
    const _false = PopBoolean.FALSE;
    expect(type(_true).$unwrap()).toBe(ObjectType.BOOLEAN);
    expect(type(_false).$unwrap()).toBe(ObjectType.BOOLEAN);

    const _num = new PopNumber(123);
    expect(type(_num).$unwrap()).toBe(ObjectType.NUMBER);

    const _str = new PopString('123');
    expect(type(_str).$unwrap()).toBe(ObjectType.STRING);

    const _func = new PopFunction(new PopString('foo'), [], () => {});
    expect(type(_func).$unwrap()).toBe(ObjectType.FUNCTION);
  });

  test('str', () => {
    const _null = PopNull.NULL;
    expect(str(_null).$equals(_null.toString())).toBe(true);

    const _true = PopBoolean.TRUE;
    const _false = PopBoolean.FALSE;
    expect(str(_true).$equals(_true.toString())).toBe(true);
    expect(str(_false).$equals(_false.toString())).toBe(true);

    const _num = new PopNumber(123);
    expect(str(_num).$equals(_num.toString())).toBe(true);

    const _str = new PopString('123');
    expect(str(_str).$equals(_str.toString())).toBe(true);

    const _func = new PopFunction(new PopString('foo'), [], () => {});
    expect(str(_func).$equals(_func.toString())).toBe(true);
  });
});
