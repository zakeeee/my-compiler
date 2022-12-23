import {
  BlockStatement,
  BreakStatement,
  CallExpression,
  ContinueStatement,
  Expression,
  ExpressionStatement,
  ForStatement,
  FunctionExpression,
  FunctionStatement,
  IdentifierExpression,
  IfStatement,
  InfixExpression,
  LetExpression,
  LetStatement,
  LiteralExpression,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  TreeNodeType,
  WhileStatement,
} from 'src/ast'
import { getTokenName, Token } from '../lexer'
import { PopError } from './error'
import { C_FALSE, C_TRUE } from './models/impl/boolean'
import { builtinFunctions, PopBuiltinFunctionImpl } from './models/impl/builtins'
import PopFunctionImpl from './models/impl/function'
import { C_NULL } from './models/impl/null'
import PopNumberImpl from './models/impl/number'
import PopStringImpl from './models/impl/string'
import { C_VOID, isVoid, VoidType } from './models/impl/void'
import { PopFunction, PopObject } from './models/types'
import { Scope, uninitialized } from './scope'

type EvalResult<T> = [PopError, null] | [null, T]

class ContinueStatementEvalResult {}

class BreakStatementEvalResult {}

class ReturnStatementEvalResult {
  constructor(readonly returnValue: PopObject | VoidType) {}
}

export function evalProgram(node: Program, scope: Scope): VoidType {
  for (const stmt of node.body) {
    const [err, val] = evalStatement(stmt, scope)
    if (err) {
      err.pushStack(stmt.symbol.start)
      console.error(err.printStack())
      break
    }
    if (val instanceof ContinueStatementEvalResult) {
      const err = new PopError('continue outside of loop')
      err.pushStack(stmt.symbol.start)
      console.error(err.printStack())
      break
    }
    if (val instanceof BreakStatementEvalResult) {
      const err = new PopError('break outside of loop')
      err.pushStack(stmt.symbol.start)
      console.error(err.printStack())
      break
    }
    if (val instanceof ReturnStatementEvalResult) {
      const err = new PopError('return outside of function')
      err.pushStack(stmt.symbol.start)
      console.error(err.printStack())
      break
    }
  }
  return C_VOID
}

function evalStatement(
  stmt: Statement,
  scope: Scope
): EvalResult<
  VoidType | ContinueStatementEvalResult | BreakStatementEvalResult | ReturnStatementEvalResult
> {
  switch (stmt.nodeType) {
    case TreeNodeType.EMPTY_STATEMENT:
      return [null, C_VOID]
    case TreeNodeType.BLOCK_STATEMENT:
      return evalBlockStatement(stmt as BlockStatement, scope)
    case TreeNodeType.EXPRESSION_STATEMENT:
      return evalExpressionStatement(stmt as ExpressionStatement, scope)
    case TreeNodeType.LET_STATEMENT:
      return evalLetStatement(stmt as LetStatement, scope)
    case TreeNodeType.FUNCTION_STATEMENT:
      return evalFunctionStatement(stmt as FunctionStatement, scope)
    case TreeNodeType.IF_STATEMENT:
      return evalIfStatement(stmt as IfStatement, scope)
    case TreeNodeType.FOR_STATEMENT:
      return evalForStatement(stmt as ForStatement, scope)
    case TreeNodeType.WHILE_STATEMENT:
      return evalWhileStatement(stmt as WhileStatement, scope)
    case TreeNodeType.CONTINUE_STATEMENT:
      return evalContinueStatement(stmt as ContinueStatement, scope)
    case TreeNodeType.BREAK_STATEMENT:
      return evalBreakStatement(stmt as BreakStatement, scope)
    case TreeNodeType.RETURN_STATEMENT:
      return evalReturnStatement(stmt as ReturnStatement, scope)
    default: {
      const err = new PopError(`invalid statement type "${stmt.nodeType}"`)
      err.pushStack(stmt.symbol.start)
      return [err, null]
    }
  }
}

function evalBlockStatement(
  stmt: BlockStatement,
  scope: Scope
): EvalResult<
  VoidType | ContinueStatementEvalResult | BreakStatementEvalResult | ReturnStatementEvalResult
> {
  const blockScope = new Scope(scope)
  for (const childStmt of stmt.statements) {
    const [err, val] = evalStatement(childStmt, blockScope)
    if (err) {
      return [err, null]
    }
    if (
      val instanceof ContinueStatementEvalResult ||
      val instanceof BreakStatementEvalResult ||
      val instanceof ReturnStatementEvalResult
    ) {
      return [null, val]
    }
  }
  return [null, C_VOID]
}

function evalExpressionStatement(stmt: ExpressionStatement, scope: Scope): EvalResult<VoidType> {
  const [err] = evalExpression(stmt.expression, scope)
  if (err) {
    return [err, null]
  }
  return [null, C_VOID]
}

function evalLetStatement(stmt: LetStatement, scope: Scope): EvalResult<VoidType> {
  const [err] = evalLetExpression(stmt.expression, scope)
  if (err) {
    return [err, null]
  }
  return [null, C_VOID]
}

function evalFunctionStatement(stmt: FunctionStatement, scope: Scope): EvalResult<VoidType> {
  const name = stmt.identifier.literal
  if (scope.hasOwnValue(name)) {
    const err = new PopError(`duplicate function "${name}"`)
    err.pushStack(stmt.symbol.start)
    return [err, null]
  }
  const params = stmt.parameters.map((param) => param.literal)
  const func = new PopFunctionImpl(params, stmt.body, scope, name)
  scope.setOwnValue(name, func)
  return [null, C_VOID]
}

function evalIfStatement(
  stmt: IfStatement,
  scope: Scope
): EvalResult<
  VoidType | ContinueStatementEvalResult | BreakStatementEvalResult | ReturnStatementEvalResult
> {
  const [err, condition] = evalExpression(stmt.condition, scope)
  if (err) {
    return [err, null]
  }
  if (isVoid(condition)) {
    const err = new PopError(`condition is no value`)
    err.pushStack(stmt.condition.symbol.start)
    return [err, null]
  }
  if (condition.$toBoolean().$unwrap()) {
    return evalStatement(stmt.consequence, scope)
  } else if (stmt.alternative) {
    return evalStatement(stmt.alternative, scope)
  }
  return [null, C_NULL]
}

function evalForStatement(
  stmt: ForStatement,
  scope: Scope
): EvalResult<VoidType | ReturnStatementEvalResult> {
  const {
    initialize: initializeExpr,
    condition: conditionExpr,
    afterEach: afterEachExpr,
    body: bodyStatement,
  } = stmt
  if (initializeExpr) {
    const [err] = evalExpression(initializeExpr, scope)
    if (err) {
      return [err, null]
    }
  }

  let condition = true
  if (conditionExpr) {
    const [err, val] = evalExpression(conditionExpr, scope)
    if (err) {
      return [err, null]
    }
    if (isVoid(val)) {
      const err = new PopError(`condition is no value`)
      err.pushStack(conditionExpr.symbol.start)
      return [err, null]
    }
    condition = val.$toBoolean().$unwrap()
  }
  while (condition) {
    const [err, val] = evalStatement(bodyStatement, scope)
    if (err) {
      return [err, null]
    }
    if (val instanceof BreakStatementEvalResult) {
      break
    }
    if (val instanceof ReturnStatementEvalResult) {
      return [null, val]
    }

    if (afterEachExpr) {
      const [err] = evalExpression(afterEachExpr, scope)
      if (err) {
        return [err, null]
      }
    }

    if (conditionExpr) {
      const [err, val] = evalExpression(conditionExpr, scope)
      if (err) {
        return [err, null]
      }
      if (isVoid(val)) {
        const err = new PopError(`condition is no value`)
        err.pushStack(conditionExpr.symbol.start)
        return [err, null]
      }
      condition = val.$toBoolean().$unwrap()
    }
  }
  return [null, C_VOID]
}

function evalWhileStatement(
  stmt: WhileStatement,
  scope: Scope
): EvalResult<VoidType | ReturnStatementEvalResult> {
  const [err, val] = evalExpression(stmt.condition, scope)
  if (err) {
    return [err, null]
  }
  if (isVoid(val)) {
    const err = new PopError(`condition is no value`)
    err.pushStack(stmt.condition.symbol.start)
    return [err, null]
  }
  let condition = val.$toBoolean().$unwrap()
  while (condition) {
    const [err1, val1] = evalStatement(stmt.body, scope)
    if (err1) {
      return [err1, null]
    }
    if (val1 instanceof BreakStatementEvalResult) {
      break
    }
    if (val1 instanceof ReturnStatementEvalResult) {
      return [null, val1]
    }

    const [err2, val2] = evalExpression(stmt.condition, scope)
    if (err2) {
      return [err2, null]
    }
    if (isVoid(val2)) {
      const err = new PopError(`condition is no value`)
      err.pushStack(stmt.condition.symbol.start)
      return [err, null]
    }
    condition = val2.$toBoolean().$unwrap()
  }
  return [null, C_VOID]
}

function evalContinueStatement(
  stmt: ContinueStatement,
  scope: Scope
): EvalResult<ContinueStatementEvalResult> {
  return [null, new ContinueStatementEvalResult()]
}

function evalBreakStatement(
  stmt: BreakStatement,
  scope: Scope
): EvalResult<BreakStatementEvalResult> {
  return [null, new BreakStatementEvalResult()]
}

function evalReturnStatement(
  stmt: ReturnStatement,
  scope: Scope
): EvalResult<ReturnStatementEvalResult> {
  let ret: PopObject | VoidType = C_VOID
  if (stmt.returnValue) {
    const [err, val] = evalExpression(stmt.returnValue, scope)
    if (err) {
      return [err, null]
    }
    ret = val
  }
  return [null, new ReturnStatementEvalResult(ret)]
}

function evalExpression(expr: Expression, scope: Scope): EvalResult<PopObject | VoidType> {
  switch (expr.nodeType) {
    case TreeNodeType.PREFIX_EXPRESSION:
      return evalPrefixExpression(expr as PrefixExpression, scope)
    case TreeNodeType.INFIX_EXPRESSION:
      return evalInfixExpression(expr as InfixExpression, scope)
    case TreeNodeType.LET_EXPRESSION:
      return evalLetExpression(expr as LetExpression, scope)
    case TreeNodeType.CALL_EXPRESSION:
      return evalCallExpression(expr as CallExpression, scope)
    case TreeNodeType.LITERAL_EXPRESSION:
      return evalLiteralExpression(expr as LiteralExpression, scope)
    case TreeNodeType.IDENTIFIER_EXPRESSION:
      return evalIdentifierExpression(expr as IdentifierExpression, scope)
    case TreeNodeType.FUNCTION_EXPRESSION:
      return evalFunctionExpression(expr as FunctionExpression, scope)
    default: {
      const err = new PopError(`invalid expression type "${expr.nodeType}"`)
      err.pushStack(expr.symbol.start)
      return [err, null]
    }
  }
}

const prefixOpTokenToSlotNameMap = {
  [Token.PLUS]: '$toPositive',
  [Token.MINUS]: '$toNegative',
  [Token.BIT_NOT]: '$bitNot',
} as Record<Token, string>

function evalPrefixExpression(expr: PrefixExpression, scope: Scope): EvalResult<PopObject> {
  const [err, operand] = evalExpression(expr.operand, scope)
  if (err) {
    return [err, null]
  }
  if (isVoid(operand)) {
    const err = new PopError(`operand is no value`)
    err.pushStack(expr.operand.symbol.start)
    return [err, null]
  }

  switch (expr.operator.token) {
    case Token.NOT:
      return [null, operand.$toBoolean().$not()]
    default: {
      const token = expr.operator.token
      const slotName = prefixOpTokenToSlotNameMap[token]
      if (slotName && slotName in operand) {
        const func = (operand as any)[slotName]
        if (typeof func === 'function') {
          try {
            return [null, func.call(operand)]
          } catch (error) {
            const err = new PopError(`${error}`)
            err.pushStack(expr.operator.start)
            return [err, null]
          }
        }
      }
      const err = new PopError(`unsupported infix operation "${getTokenName(token)}"`)
      err.pushStack(expr.operator.start)
      return [err, null]
    }
  }
}

const infixOpTokenToSlotNameMap = {
  [Token.ASTERISK]: '$multiply',
  [Token.SLASH]: '$divide',
  [Token.PERCENT]: '$modulo',
  [Token.PLUS]: '$add',
  [Token.MINUS]: '$minus',
  [Token.GREATER_THAN]: '$greaterThan',
  [Token.GREATER_THAN_EQUAL]: '$greaterThanEqual',
  [Token.LESS_THAN]: '$lessThan',
  [Token.LESS_THAN_EQUAL]: '$lessThanEqual',
  [Token.BIT_AND]: '$bitAnd',
  [Token.BIT_OR]: '$bitOr',
  [Token.BIT_XOR]: '$bitXor',
  [Token.MULTIPLY_EQUAL]: '$multiply',
  [Token.DIVIDE_EQUAL]: '$divide',
  [Token.MODULO_EQUAL]: '$modulo',
  [Token.PLUS_EQUAL]: '$add',
  [Token.MINUS_EQUAL]: '$minus',
  [Token.BIT_AND_EQUAL]: '$bitAnd',
  [Token.BIT_OR_EQUAL]: '$bitOr',
  [Token.BIT_XOR_EQUAL]: '$bitXor',
} as Record<Token, string>

const assignmentOperators = [
  Token.MULTIPLY_EQUAL,
  Token.DIVIDE_EQUAL,
  Token.MODULO_EQUAL,
  Token.PLUS_EQUAL,
  Token.MINUS_EQUAL,
  Token.BIT_AND_EQUAL,
  Token.BIT_OR_EQUAL,
  Token.BIT_XOR_EQUAL,
]

function evalInfixExpression(
  expr: InfixExpression,
  scope: Scope
): EvalResult<VoidType | PopObject> {
  const [err1, rightOperand] = evalExpression(expr.right, scope)
  if (err1) {
    return [err1, null]
  }
  if (isVoid(rightOperand)) {
    const err = new PopError(`right operand is no value`)
    err.pushStack(expr.right.symbol.start)
    return [err, null]
  }

  if (expr.operator.token === Token.ASSIGN) {
    // lhs = rhs
    if (!(expr.left instanceof IdentifierExpression)) {
      // 不是左值
      const err = new PopError('cannot assign to lhs')
      err.pushStack(expr.left.symbol.start)
      return [err, null]
    }

    const { literal: name } = expr.left.symbol
    const targetScope = scope.getScope(name)
    if (!targetScope) {
      const err = new PopError(`"${name}" is not defined`)
      err.pushStack(expr.left.symbol.start)
      return [err, null]
    }

    targetScope.setOwnValue(name, rightOperand)
    return [null, C_VOID]
  }

  if (assignmentOperators.includes(expr.operator.token)) {
    // lhs += rhs, lhs -= rhs, ...
    if (!(expr.left instanceof IdentifierExpression)) {
      // 不是左值
      const err = new PopError('cannot assign to lhs')
      err.pushStack(expr.left.symbol.start)
      return [err, null]
    }

    const { literal: name } = expr.left.symbol
    const targetScope = scope.getScope(name)
    if (!targetScope) {
      const err = new PopError(`"${name}" is not defined`)
      err.pushStack(expr.left.symbol.start)
      return [err, null]
    }

    const leftOperand = targetScope.getValue(name)!
    if (leftOperand === uninitialized) {
      const err = new PopError(`"${name}" is not initialized`)
      err.pushStack(expr.left.symbol.start)
      return [err, null]
    }

    let value: PopObject
    const { token } = expr.operator
    const slotName = infixOpTokenToSlotNameMap[token]
    if (
      slotName &&
      slotName in leftOperand &&
      typeof (leftOperand as any)[slotName] === 'function'
    ) {
      value = (leftOperand as any)[slotName].call(leftOperand, rightOperand)
    } else {
      const err = new PopError(`unsupported infix operation "${getTokenName(token)}"`)
      err.pushStack(expr.operator.start)
      return [err, null]
    }

    targetScope.setOwnValue(name, value)
    return [null, C_VOID]
  }

  const [err2, leftOperand] = evalExpression(expr.left, scope)
  if (err2) {
    return [err2, null]
  }
  if (isVoid(leftOperand)) {
    const err = new PopError(`left operator is no value`)
    err.pushStack(expr.left.symbol.start)
    return [err, null]
  }
  const { token } = expr.operator
  switch (token) {
    case Token.EQUAL:
      return [null, leftOperand.$equal(rightOperand)]
    case Token.NOT_EQUAL: {
      return [null, leftOperand.$equal(rightOperand).$not()]
    }
    case Token.LOGIC_AND: {
      const a = leftOperand.$toBoolean()
      const b = rightOperand.$toBoolean()
      return [null, a.$unwrap() && b.$unwrap() ? C_TRUE : C_FALSE]
    }
    case Token.LOGIC_OR: {
      const a = leftOperand.$toBoolean()
      const b = rightOperand.$toBoolean()
      return [null, a.$unwrap() || b.$unwrap() ? C_TRUE : C_FALSE]
    }
    default: {
      const slotName = infixOpTokenToSlotNameMap[token]
      if (slotName && slotName in leftOperand) {
        const func = (leftOperand as any)[slotName]
        if (typeof func === 'function') {
          try {
            return [null, func.call(leftOperand, rightOperand)]
          } catch (error) {
            const err = new PopError(`${error}`)
            err.pushStack(expr.operator.start)
            return [err, null]
          }
        }
      }
      const err = new PopError(`unsupported infix operation "${getTokenName(token)}"`)
      err.pushStack(expr.operator.start)
      return [err, null]
    }
  }
}

function evalLetExpression(expr: LetExpression, scope: Scope): EvalResult<VoidType> {
  const arr = expr.variableDeclarationSequence
  for (const item of arr) {
    const name = item.identifier.literal

    if (scope.hasOwnValue(name)) {
      // 当前作用域内重复声明
      const err = new PopError(`duplicate variable "${name}"`)
      err.pushStack(item.identifier.start)
      return [err, null]
    }

    if (item.value) {
      const [err, val] = evalExpression(item.value, scope)
      if (err) {
        return [err, null]
      }
      if (isVoid(val)) {
        const err = new PopError(`rhs is no value`)
        err.pushStack(item.identifier.start)
        return [err, null]
      }
      scope.setOwnValue(name, val)
    } else {
      scope.setOwnValue(name, uninitialized)
    }
  }
  return [null, C_VOID]
}

function evalCallExpression(expr: CallExpression, scope: Scope): EvalResult<VoidType | PopObject> {
  const [err1, func] = evalExpression(expr.callable!, scope)
  if (err1) {
    err1.pushStack(expr.symbol.start)
    return [err1, null]
  }

  if (!(func instanceof PopFunctionImpl || func instanceof PopBuiltinFunctionImpl)) {
    const err = new PopError(`object is not callable`)
    err.pushStack(expr.symbol.start)
    return [err, null]
  }

  const args: PopObject[] = []
  for (const arg of expr.args) {
    const [err, val] = evalExpression(arg, scope)
    if (err) {
      return [err, null]
    }
    if (isVoid(val)) {
      const err = new PopError(`no value used as args`)
      err.pushStack(arg.symbol.start)
      return [err, null]
    }
    args.push(val)
  }
  if (args.length < func.$parameters.length) {
    const err = new PopError(
      `${func.$name} requires at least ${func.$parameters.length} arguments but ${args.length} is given`
    )
    err.pushStack(expr.symbol.start)
    return [err, null]
  }

  if (func instanceof PopBuiltinFunctionImpl) {
    try {
      return [null, func.$call(args)]
    } catch (error) {
      const err = new PopError(`${error}`)
      err.pushStack(expr.symbol.start)
      return [err, null]
    }
  }

  const funcScope = new Scope(func.scope)
  func.$parameters.forEach((paramName, idx) => {
    funcScope.setOwnValue(paramName, args[idx])
  })
  const [err2, res] = evalStatement(func.body, funcScope)
  if (err2) {
    err2.pushStack(expr.symbol.start)
    return [err2, null]
  }
  if (res instanceof ContinueStatementEvalResult) {
    const err = new PopError('continue outside of loop')
    err.pushStack(expr.symbol.start)
    return [err, null]
  }
  if (res instanceof BreakStatementEvalResult) {
    const err = new PopError('break outside of loop')
    err.pushStack(expr.symbol.start)
    return [err, null]
  }
  if (res instanceof ReturnStatementEvalResult) {
    return [null, res.returnValue]
  }
  return [null, C_VOID]
}

function evalLiteralExpression(expr: LiteralExpression, scope: Scope): EvalResult<PopObject> {
  switch (expr.symbol.token) {
    case Token.NUMBER_LITERAL:
      return [null, new PopNumberImpl(expr.value as number)]
    case Token.STRING_LITERAL:
      // TODO
      return [null, new PopStringImpl(eval(expr.value as string))]
    case Token.TRUE:
      return [null, C_TRUE]
    case Token.FALSE:
      return [null, C_FALSE]
    case Token.NULL:
      return [null, C_NULL]
    default: {
      const err = new PopError('unknown literal expression')
      err.pushStack(expr.symbol.start)
      return [err, null]
    }
  }
}

function evalIdentifierExpression(expr: IdentifierExpression, scope: Scope): EvalResult<PopObject> {
  const name = expr.symbol.literal
  const obj = scope.getValue(name)
  if (obj) {
    // 使用了未初始化的变量
    if (obj === uninitialized) {
      const err = new PopError(`${name} is not initialized`)
      err.pushStack(expr.symbol.start)
      return [err, null]
    }

    return [null, obj]
  }

  // 内置功能
  if (name in builtinFunctions) {
    const builtin = builtinFunctions[name as keyof typeof builtinFunctions]
    return [null, builtin]
  }

  // 未定义变量
  const err = new PopError(`${name} is not defined`)
  err.pushStack(expr.symbol.start)
  return [err, null]
}

function evalFunctionExpression(expr: FunctionExpression, scope: Scope): EvalResult<PopFunction> {
  const parameters = expr.params.map((param) => param.symbol.literal)
  return [null, new PopFunctionImpl(parameters, expr.body, scope)]
}
