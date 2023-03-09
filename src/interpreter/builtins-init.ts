import { Environment } from './environment';
import { FALSE, TRUE } from './models/builtins/boolean';
import { PopClass } from './models/builtins/class';
import { ArrayClass } from './models/builtins/classes/array';
import { BooleanClass } from './models/builtins/classes/boolean';
import { HashClass } from './models/builtins/classes/hash';
import { NumberClass } from './models/builtins/classes/number';
import { ObjectClass } from './models/builtins/classes/object';
import { StringClass } from './models/builtins/classes/string';
import { PopFunction } from './models/builtins/function';
import { PopInstance } from './models/builtins/instance';
import { NULL } from './models/builtins/null';
import { PopObject } from './models/builtins/object';
import { PopString } from './models/builtins/string';

export function makeBuiltinFunctions(globals: Environment) {
  const type = new PopFunction(globals, {
    name: 'type',
    params: ['obj'],
    func: (env) => {
      const obj = env.getValue('obj');
      if (!(obj instanceof PopObject)) {
        throw new Error('');
      }
      return new PopString(obj.getType());
    },
  });

  const str = new PopFunction(globals, {
    name: 'str',
    params: ['obj'],
    func: (env) => {
      const obj = env.getValue('obj');
      if (!(obj instanceof PopObject)) {
        throw new Error('');
      }
      return new PopString(obj.toString());
    },
  });

  const print = new PopFunction(globals, {
    name: 'print',
    params: ['obj'],
    func: (env) => {
      const obj = env.getValue('obj');
      if (!obj) {
        throw new Error('');
      }
      console.log(obj.toString());
      return NULL;
    },
  });

  const isInstance = new PopFunction(globals, {
    name: 'isInstance',
    params: ['obj', 'cls'],
    func: (env) => {
      const obj = env.getValue('obj');
      const cls = env.getValue('cls');
      if (obj instanceof PopInstance && cls instanceof PopClass) {
        return obj.isInstanceOf(cls) ? TRUE : FALSE;
      }
      return FALSE;
    },
  });

  return { type, str, print, isInstance };
}

export function makeBuiltinClasses(globals: Environment) {
  const objectClass = new ObjectClass(globals);
  const arrayClass = new ArrayClass(globals, objectClass);
  const booleanClass = new BooleanClass(globals, objectClass);
  const hashClass = new HashClass(globals, objectClass);
  const numberClass = new NumberClass(globals, objectClass);
  const stringClass = new StringClass(globals, objectClass);

  return {
    Object: objectClass,
    Array: arrayClass,
    Boolean: booleanClass,
    Hash: hashClass,
    Number: numberClass,
    String: stringClass,
  };
}
