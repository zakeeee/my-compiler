export enum ModelType {
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  STRING = 'STRING',
  FUNCTION = 'FUNCTION',
  OBJECT = 'OBJECT',
  NULL = 'NULL',
  CLASS = 'CLASS',
}

export interface Callable {
  call(args: unknown[]): unknown;
}
