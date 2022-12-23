export const C_VOID = Symbol('C_VOID')

export type VoidType = typeof C_VOID

export function isVoid(o: unknown): o is VoidType {
  return o === C_VOID
}
