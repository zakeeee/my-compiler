export enum ObjectType {
  NULL = 'NULL',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  STRING = 'STRING',
  FUNCTION = 'FUNCTION',
}

export interface PopObject {
  $equals(other: PopObject): boolean;

  $toBoolean(): boolean;

  $toString(): string;

  $type(): ObjectType;
}
