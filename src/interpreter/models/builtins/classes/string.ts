import { Environment } from 'src/interpreter/environment';
import { PopClass } from '../class';
import { PopFunction } from '../function';
import { PopInstance } from '../instance';
import { NULL } from '../null';
import { PopNumber } from '../number';
import { PopObject } from '../object';
import { PopString } from '../string';

export type StringInstance = PopInstance;

export class StringClass extends PopClass {
  constructor(env: Environment, superClass: PopClass | null) {
    super(env, 'String', superClass);

    this.setMethod(
      'init',
      new PopFunction(this.env, {
        name: 'init',
        params: ['arg0'],
        func: (env) => {
          const thisInstance = env.getValue<StringInstance>('this')!;
          const arg0 = env.getValue('arg0');
          if (arg0 instanceof PopObject) {
            thisInstance.setProperty('value', new PopString(arg0.toString()));
            return NULL;
          }
          throw new Error('invalid arg type');
        },
      })
    );

    this.setMethod(
      'length',
      new PopFunction(this.env, {
        name: 'length',
        params: [],
        func: (env) => {
          const thisInstance = env.getValue<StringInstance>('this')!;
          const value = thisInstance.getProperty('value') as PopString;
          return new PopNumber(value.getLength());
        },
      })
    );
  }
}
