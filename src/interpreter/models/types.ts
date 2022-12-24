export enum ObjectType {
  OBJECT = 'OBJECT',
  NULL = 'NULL',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  STRING = 'STRING',
  FUNCTION = 'FUNCTION',
  BUILTIN_FUNCTION = 'BUILTIN_FUNCTION',
  ARRAY = 'ARRAY',
  HASH = 'HASH',
}

export interface Wrapper<T> {
  $unwrap(): T
}

export interface BitwiseOperation<T> {
  $bitNot(): T
  $bitAnd(other: PopObject): T
  $bitOr(other: PopObject): T
  $bitXor(other: PopObject): T
}

export interface Comparable {
  $greaterThan(other: PopObject): PopBoolean
  $greaterThanEqual(other: PopObject): PopBoolean
  $lessThan(other: PopObject): PopBoolean
  $lessThanEqual(other: PopObject): PopBoolean
}

export interface Indexable {
  $index(index: PopObject): PopObject
}

export interface PopObject {
  $equal(other: PopObject): PopBoolean
  $toBoolean(): PopBoolean
  $toString(): PopString
  $type(): ObjectType
}

export interface PopBoolean extends PopObject, Wrapper<boolean> {
  $not(): PopBoolean
}

export interface PopFunction extends PopObject {
  $name: string
  $parameters: string[]
}

export interface PopBuiltinFunction extends PopFunction {
  $call(args: PopObject[]): PopObject
}

export interface PopNull extends PopObject, Wrapper<null> {}

export interface PopNumber
  extends PopObject,
    Wrapper<number>,
    BitwiseOperation<PopNumber>,
    Comparable {
  $add(other: PopObject): PopNumber
  $minus(other: PopObject): PopNumber
  $multiply(other: PopObject): PopNumber
  $divide(other: PopObject): PopNumber
  $modulo(other: PopObject): PopNumber
  $toPositive(): PopNumber
  $toNegative(): PopNumber
}

export interface PopString extends PopObject, Wrapper<string> {
  $add(other: PopObject): PopString
  $length(): PopNumber
}

export interface PopArray extends PopObject, Indexable {
  $length(): PopNumber
}

export interface PopHash extends PopObject, Indexable {}
