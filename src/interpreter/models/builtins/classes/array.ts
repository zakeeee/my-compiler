import { Environment } from 'src/interpreter/environment';
import { PopArray } from '../array';
import { PopClass } from '../class';
import { PopFunction } from '../function';
import { PopInstance } from '../instance';
import { NULL } from '../null';
import { PopNumber } from '../number';
import { PopString } from '../string';

export type ArrayInstance = PopInstance & {
  array: PopArray;
};

export class ArrayClass extends PopClass {
  constructor(env: Environment, superClass: PopClass | null) {
    super(env, 'Array', superClass);

    this.setMethod(
      'init',
      new PopFunction(this.env, {
        name: 'init',
        params: ['arg0'],
        func: (env) => {
          const thisInstance = env.getValue<ArrayInstance>('this')!;
          const arg0 = env.getValue('arg0');

          if (arg0 instanceof PopArray) {
            thisInstance.array = arg0;
            return NULL;
          }
          if (arg0 instanceof PopNumber) {
            thisInstance.array = new PopArray(arg0.getValue());
            return NULL;
          }
          if (arg0 instanceof PopInstance && arg0.isInstanceOf(this)) {
            thisInstance.array = (arg0 as ArrayInstance).array.slice();
            return NULL;
          }
          throw new Error('invalid arg type');
        },
      })
    );

    this.setMethod(
      'size',
      new PopFunction(this.env, {
        name: 'size',
        params: [],
        func: (env) => {
          const thisInstance = env.getValue<ArrayInstance>('this')!;
          return new PopNumber(thisInstance.array.size());
        },
      })
    );

    this.setMethod(
      'getAt',
      new PopFunction(this.env, {
        name: 'index',
        params: ['i'],
        func: (env) => {
          const idx = env.getValue('i')!;

          if (idx instanceof PopNumber) {
            const thisInstance = env.getValue<ArrayInstance>('this')!;
            return thisInstance.array.getAt(idx.getValue());
          }
          throw new Error(`"${idx.getType()}" cannot be used as array index`);
        },
      })
    );

    this.setMethod(
      'setAt',
      new PopFunction(this.env, {
        name: 'index',
        params: ['i', 'value'],
        func: (env) => {
          const idx = env.getValue('i')!;
          const value = env.getValue('value')!;

          if (idx instanceof PopNumber) {
            const thisInstance = env.getValue<ArrayInstance>('this')!;
            thisInstance.array.setAt(idx.getValue(), value);
            return NULL;
          }
          throw new Error(`"${idx.getType()}" cannot be used as array index`);
        },
      })
    );

    this.setMethod(
      'push',
      new PopFunction(this.env, {
        name: 'index',
        params: ['value'],
        func: (env) => {
          const value = env.getValue('value')!;

          const thisInstance = env.getValue<ArrayInstance>('this')!;
          thisInstance.array.push(value);
          return NULL;
        },
      })
    );

    this.setMethod(
      'pop',
      new PopFunction(this.env, {
        name: 'index',
        params: [],
        func: (env) => {
          const thisInstance = env.getValue<ArrayInstance>('this')!;
          return thisInstance.array.pop();
        },
      })
    );

    this.setMethod(
      'slice',
      new PopFunction(this.env, {
        name: 'index',
        params: ['start', 'end'],
        func: (env) => {
          const thisInstance = env.getValue<ArrayInstance>('this')!;
          return thisInstance.array.slice();
        },
      })
    );

    this.setMethod(
      'toString',
      new PopFunction(this.env, {
        name: 'toString',
        params: [],
        func: (env) => {
          const thisInstance = env.getValue<ArrayInstance>('this')!;
          return new PopString(thisInstance.array.toString());
        },
      })
    );
  }
}
