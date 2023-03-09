import { Environment } from 'src/interpreter/environment';
import { PopClass } from '../class';
import { PopInstance } from '../instance';

export type ObjectInstance = PopInstance;

export class ObjectClass extends PopClass {
  constructor(env: Environment) {
    super(env, 'Object', null);
  }
}
