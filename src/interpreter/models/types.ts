export enum ObjectType {
  OBJECT = 'OBJECT',
  NULL = 'NULL',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  STRING = 'STRING',
  FUNCTION = 'FUNCTION',
  BUILTIN_FUNCTION = 'BUILTIN_FUNCTION',
  ERROR = 'ERROR',
  ARRAY = 'ARRAY',
  HASH = 'HASH',
}

export interface IWrapper<T> {
  unwrap(): T
}

export interface IBitwiseOperation<T> {
  bitNot(): T
  bitAnd(other: IPopObject): T
  bitOr(other: IPopObject): T
  bitXor(other: IPopObject): T
}

export interface IComparable {
  greaterThan(other: IPopObject): IPopBoolean
  greaterThanEqual(other: IPopObject): IPopBoolean
  lessThan(other: IPopObject): IPopBoolean
  lessThanEqual(other: IPopObject): IPopBoolean
}

export interface IIndexable {
  index(index: IPopObject): IPopObject
}

export interface IPopObject {
  readonly type: ObjectType
  equal(other: IPopObject): IPopBoolean
  toBoolean(): IPopBoolean
  toString(): IPopString
}

export interface IPopBoolean extends IPopObject, IWrapper<boolean> {
  not(): IPopBoolean
}

export interface IPopFunction extends IPopObject {
  readonly name: string
  readonly parameters: string[]
}

export interface IPopBuiltinFunction extends IPopFunction {
  call(args: IPopObject[]): IPopObject
}

export interface IPopNull extends IPopObject, IWrapper<null> {}

export interface IPopNumber
  extends IPopObject,
    IWrapper<number>,
    IBitwiseOperation<IPopNumber>,
    IComparable {
  add(other: IPopObject): IPopNumber
  minus(other: IPopObject): IPopNumber
  multiply(other: IPopObject): IPopNumber
  divide(other: IPopObject): IPopNumber
  modulo(other: IPopObject): IPopNumber
  toPositive(): IPopNumber
  toNegative(): IPopNumber
}

export interface IPopString extends IPopObject, IWrapper<string> {
  add(other: IPopObject): IPopString
  length(): IPopNumber
}

export interface IPopArray extends IPopObject, IIndexable {
  length(): IPopNumber
}

export interface IPopHash extends IPopObject, IIndexable {}

export interface IPopError extends IPopObject {}
