import { Environment } from 'src/interpreter/environment';
import { PopClass } from '../class';
import { PopFunction } from '../function';
import { PopInstance } from '../instance';
import { NULL } from '../null';
import { PopNumber } from '../number';

export type NumberInstance = PopInstance;

export class NumberClass extends PopClass {
  constructor(env: Environment, superClass: PopClass | null) {
    super(env, 'Number', superClass);

    this.setMethod(
      'init',
      new PopFunction(this.env, {
        name: 'init',
        params: ['arg0'],
        func: (env) => {
          const thisInstance = env.getValue<NumberInstance>('this')!;
          const arg0 = env.getValue('arg0');
          if (arg0 instanceof PopNumber) {
            thisInstance.setProperty('value', arg0);
            return NULL;
          }
          throw new Error('invalid arg type');
        },
      })
    );
  }
}
