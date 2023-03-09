import { Environment } from 'src/interpreter/environment';
import { FALSE, TRUE } from '../boolean';
import { PopClass } from '../class';
import { PopFunction } from '../function';
import { PopInstance } from '../instance';
import { NULL } from '../null';
import { PopObject } from '../object';

export type BooleanInstance = PopInstance;

export class BooleanClass extends PopClass {
  constructor(env: Environment, superClass: PopClass | null) {
    super(env, 'Boolean', superClass);

    this.setMethod(
      'init',
      new PopFunction(this.env, {
        name: 'init',
        params: ['arg0'],
        func: (env) => {
          const thisInstance = env.getValue<BooleanInstance>('this')!;
          const arg0 = env.getValue('arg0');
          if (arg0 instanceof PopObject) {
            thisInstance.setProperty('value', arg0.toBoolean() ? TRUE : FALSE);
            return NULL;
          }
          throw new Error('invalid arg type');
        },
      })
    );
  }
}
