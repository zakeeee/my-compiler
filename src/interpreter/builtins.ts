import PopNumber from './models/number';
import { PopObject } from './models/object';
import PopString from './models/string';

export function len(object: PopObject): PopNumber {
  if ('$length' in object && typeof object['$length'] === 'function') {
    const length = object['$length']();
    return new PopNumber(length);
  }
  throw new Error(`cannot perform len operation on ${object.$type()}`);
}

export function type(object: PopObject): PopString {
  return new PopString(object.$type());
}

export function str(object: PopObject): PopString {
  return new PopString(object.$toString());
}
