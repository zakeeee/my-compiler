import {
  BlockStatement,
  BreakStatement,
  CallExpression,
  ContinueStatement,
  EmptyStatement,
  Expression,
  ExpressionStatement,
  ForStatement,
  FuncDeclarationStatement,
  FunctionExpression,
  IdentifierExpression,
  IfStatement,
  InfixExpression,
  LetStatement,
  LiteralExpression,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  WhileStatement,
} from 'src/ast'
import { getTokenName, Token } from 'src/lexer'
import PopBooleanImpl from './models/impl/boolean'
import { builtinFunctions, PopBuiltinFunctionImpl } from './models/impl/builtins'
import PopFunctionImpl from './models/impl/function'
import PopNullImpl from './models/impl/null'
import PopNumberImpl from './models/impl/number'
import PopStringImpl from './models/impl/string'
import { PopFunction, PopObject } from './models/types'
import { Scope } from './scope'

class ContinueStatementEvalResult {}

class BreakStatementEvalResult {}

class ReturnStatementEvalResult {
  constructor(readonly returnValue: PopObject) {}
}

export function evalProgram(node: Program, scope: Scope): void {
  for (const stmt of node.body) {
    const res = evalStatement(stmt, scope)
    if (res instanceof ContinueStatementEvalResult) {
      throw new Error('continue outside of loop')
    }
    if (res instanceof BreakStatementEvalResult) {
      throw new Error('break outside of loop')
    }
    if (res instanceof ReturnStatementEvalResult) {
      throw new Error('return outside of function')
    }
  }
}

function evalStatement(
  stmt: Statement,
  scope: Scope
): PopObject | ContinueStatementEvalResult | BreakStatementEvalResult | ReturnStatementEvalResult {
  if (stmt instanceof EmptyStatement) {
    return PopNullImpl.NULL
  }
  if (stmt instanceof BlockStatement) {
    return evalBlockStatement(stmt, scope)
  }
  if (stmt instanceof ExpressionStatement) {
    return evalExpressionStatement(stmt, scope)
  }
  if (stmt instanceof LetStatement) {
    return evalLetStatement(stmt, scope)
  }
  if (stmt instanceof FuncDeclarationStatement) {
    return evalFuncDeclarationStatement(stmt, scope)
  }
  if (stmt instanceof IfStatement) {
    return evalIfStatement(stmt, scope)
  }
  if (stmt instanceof ForStatement) {
    return evalForStatement(stmt, scope)
  }
  if (stmt instanceof WhileStatement) {
    return evalWhileStatement(stmt, scope)
  }
  if (stmt instanceof ContinueStatement) {
    return evalContinueStatement(stmt, scope)
  }
  if (stmt instanceof BreakStatement) {
    return evalBreakStatement(stmt, scope)
  }
  if (stmt instanceof ReturnStatement) {
    return evalReturnStatement(stmt, scope)
  }
  throw new Error('unsupported statement type')
}

function evalBlockStatement(
  stmt: BlockStatement,
  scope: Scope
): PopObject | ContinueStatementEvalResult | BreakStatementEvalResult | ReturnStatementEvalResult {
  const blockScope = new Scope(scope)
  for (const childStmt of stmt.statements) {
    const res = evalStatement(childStmt, blockScope)
    if (
      res instanceof ContinueStatementEvalResult ||
      res instanceof BreakStatementEvalResult ||
      res instanceof ReturnStatementEvalResult
    ) {
      return res
    }
  }
  return PopNullImpl.NULL
}

function evalExpressionStatement(stmt: ExpressionStatement, scope: Scope): PopObject {
  evalExpression(stmt.expression, scope)
  return PopNullImpl.NULL
}

function evalLetStatement(stmt: LetStatement, scope: Scope): PopObject {
  const name = stmt.identifier.literal
  const value = evalExpression(stmt.value, scope)
  scope.setValue(name, value)
  return PopNullImpl.NULL
}

function evalFuncDeclarationStatement(stmt: FuncDeclarationStatement, scope: Scope): PopObject {
  const name = stmt.identifier.literal
  const parameters = stmt.parameters.map((param) => param.literal)
  const func = new PopFunctionImpl(parameters, stmt.body, name)
  scope.setValue(name, func)
  return PopNullImpl.NULL
}

function evalIfStatement(
  stmt: IfStatement,
  scope: Scope
): PopObject | ContinueStatementEvalResult | BreakStatementEvalResult | ReturnStatementEvalResult {
  const condition = evalExpression(stmt.condition, scope)
  if (condition.$toBoolean().$unwrap()) {
    return evalStatement(stmt.consequence, scope)
  } else if (stmt.alternative) {
    return evalStatement(stmt.alternative, scope)
  }
  return PopNullImpl.NULL
}

function evalForStatement(stmt: ForStatement, scope: Scope): PopObject | ReturnStatementEvalResult {
  const {
    initialize: initializeExpr,
    condition: conditionExpr,
    afterEach: afterEachExpr,
    body: bodyStatement,
  } = stmt
  if (initializeExpr) {
    evalExpression(initializeExpr, scope)
  }
  let condition = conditionExpr ? evalExpression(conditionExpr, scope).$toBoolean().$unwrap() : true
  while (condition) {
    const res = evalStatement(bodyStatement, scope)
    if (res instanceof BreakStatementEvalResult) {
      break
    }
    if (res instanceof ReturnStatementEvalResult) {
      return res
    }
    if (afterEachExpr) {
      evalExpression(afterEachExpr, scope)
    }
    condition = conditionExpr ? evalExpression(conditionExpr, scope).$toBoolean().$unwrap() : true
  }
  return PopNullImpl.NULL
}

function evalWhileStatement(
  stmt: WhileStatement,
  scope: Scope
): PopObject | ReturnStatementEvalResult {
  const { condition: conditionExpr, body: bodyStatement } = stmt
  let condition = conditionExpr ? evalExpression(conditionExpr, scope).$toBoolean().$unwrap() : true
  while (condition) {
    const res = evalStatement(bodyStatement, scope)
    if (res instanceof BreakStatementEvalResult) {
      break
    }
    if (res instanceof ReturnStatementEvalResult) {
      return res
    }
    condition = conditionExpr ? evalExpression(conditionExpr, scope).$toBoolean().$unwrap() : true
  }
  return PopNullImpl.NULL
}

function evalContinueStatement(stmt: ContinueStatement, scope: Scope): ContinueStatementEvalResult {
  return new ContinueStatementEvalResult()
}

function evalBreakStatement(stmt: BreakStatement, scope: Scope): BreakStatementEvalResult {
  return new BreakStatementEvalResult()
}

function evalReturnStatement(stmt: ReturnStatement, scope: Scope): ReturnStatementEvalResult {
  return new ReturnStatementEvalResult(
    stmt.returnValue ? evalExpression(stmt.returnValue, scope) : PopNullImpl.NULL
  )
}

function evalExpression(expr: Expression, scope: Scope): PopObject {
  if (expr instanceof PrefixExpression) {
    return evalPrefixExpression(expr, scope)
  }
  if (expr instanceof InfixExpression) {
    return evalInfixExpression(expr, scope)
  }
  if (expr instanceof CallExpression) {
    return evalCallExpression(expr, scope)
  }
  if (expr instanceof LiteralExpression) {
    return evalLiteralExpression(expr, scope)
  }
  if (expr instanceof IdentifierExpression) {
    return evalIdentifierExpression(expr, scope)
  }
  if (expr instanceof FunctionExpression) {
    return evalFunctionExpression(expr, scope)
  }
  throw new Error('unsupported expression type')
}

const prefixOpTokenToSlotNameMap = {
  [Token.PLUS]: '$toPositive',
  [Token.MINUS]: '$toNegative',
  [Token.BIT_NOT]: '$bitNot',
} as Record<Token, string>

function evalPrefixExpression(expr: PrefixExpression, scope: Scope): PopObject {
  const operand = evalExpression(expr.operand, scope)
  switch (expr.operator.token) {
    case Token.NOT:
      return operand.$toBoolean().$not()
    default: {
      const token = expr.operator.token
      const slotName = prefixOpTokenToSlotNameMap[token]
      if (slotName && slotName in operand) {
        const func = (operand as any)[slotName]
        if (typeof func === 'function') {
          return func.call(operand)
        }
      }
      throw new Error(`unsupported infix operation "${getTokenName(token)}"`)
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
} as Record<Token, string>

function evalInfixExpression(expr: InfixExpression, scope: Scope): PopObject {
  const rightOperand = evalExpression(expr.rightOperand, scope)
  if (expr.operator.token === Token.ASSIGN) {
    if (expr.leftOperand instanceof IdentifierExpression) {
      const name = expr.leftOperand.symbol.literal
      const targetScope = scope.getScope(name)
      if (!targetScope) {
        throw new Error(`${name} is not defined`)
      }
      targetScope.setValue(name, rightOperand)
      return PopNullImpl.NULL
    } else {
      throw new Error('cannot assign to lhs')
    }
  }

  const leftOperand = evalExpression(expr.leftOperand, scope)
  switch (expr.operator.token) {
    case Token.EQUAL:
      return leftOperand.$equal(rightOperand)
    case Token.NOT_EQUAL: {
      return leftOperand.$equal(rightOperand).$not()
    }
    case Token.LOGIC_AND: {
      const a = leftOperand.$toBoolean()
      const b = rightOperand.$toBoolean()
      return a.$unwrap() && b.$unwrap() ? PopBooleanImpl.TRUE : PopBooleanImpl.FALSE
    }
    case Token.LOGIC_OR: {
      const a = leftOperand.$toBoolean()
      const b = rightOperand.$toBoolean()
      return a.$unwrap() || b.$unwrap() ? PopBooleanImpl.TRUE : PopBooleanImpl.FALSE
    }
    default: {
      const token = expr.operator.token
      const slotName = infixOpTokenToSlotNameMap[token]
      if (slotName && slotName in leftOperand) {
        const func = (leftOperand as any)[slotName]
        if (typeof func === 'function') {
          return func.call(leftOperand, rightOperand)
        }
      }
      throw new Error(`unsupported infix operation "${getTokenName(token)}"`)
    }
  }
}

function evalCallExpression(expr: CallExpression, scope: Scope): PopObject {
  const func = evalExpression(expr.callable!, scope)
  if (!(func instanceof PopFunctionImpl || func instanceof PopBuiltinFunctionImpl)) {
    throw new Error('object is not callable')
  }

  const args = expr.arguments.map((arg) => evalExpression(arg, scope))
  if (args.length < func.$parameters.length) {
    throw new Error(
      `${func.$name} requires at least ${func.$parameters.length} arguments but ${args.length} is given`
    )
  }

  if (func instanceof PopBuiltinFunctionImpl) {
    return func.$call(args)
  }

  const funcScope = new Scope(scope)
  func.$parameters.forEach((paramName, idx) => {
    funcScope.setValue(paramName, args[idx])
  })
  const res = evalStatement(func.body, funcScope)
  if (res instanceof ContinueStatementEvalResult) {
    throw new Error('continue outside of loop')
  }
  if (res instanceof BreakStatementEvalResult) {
    throw new Error('break outside of loop')
  }
  if (res instanceof ReturnStatementEvalResult) {
    return res.returnValue
  }
  return PopNullImpl.NULL
}

function evalLiteralExpression(expr: LiteralExpression, scope: Scope): PopObject {
  switch (expr.symbol.token) {
    case Token.NUMBER_LITERAL:
      return new PopNumberImpl(expr.value as number)
    case Token.STRING_LITERAL:
      // TODO
      return new PopStringImpl(eval(expr.value as string))
    case Token.TRUE:
      return PopBooleanImpl.TRUE
    case Token.FALSE:
      return PopBooleanImpl.FALSE
    case Token.NULL:
      return PopNullImpl.NULL
    default:
      throw new Error('unknown literal expression')
  }
}

function evalIdentifierExpression(expr: IdentifierExpression, scope: Scope): PopObject {
  const name = expr.symbol.literal
  const obj = scope.getValue(name)
  if (obj) {
    return obj
  }

  if (name in builtinFunctions) {
    return builtinFunctions[name as keyof typeof builtinFunctions]
  }

  throw new Error(`${name} is not defined`)
}

function evalFunctionExpression(expr: FunctionExpression, scope: Scope): PopFunction {
  const parameters = expr.parameters.map((param) => param.literal)
  return new PopFunctionImpl(parameters, expr.body)
}
