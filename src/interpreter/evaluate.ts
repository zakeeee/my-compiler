import {
  ASTNodeType,
  BlockStatement,
  BreakStatement,
  CallExpression,
  ContinueStatement,
  Expression,
  ExpressionStatement,
  ForStatement,
  FuncDeclarationStatement,
  FunctionExpression,
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
  WhileStatement,
} from 'src/ast'
import { getTokenName, Token } from '../lexer'
import { C_FALSE, C_TRUE } from './models/impl/boolean'
import { builtinFunctions, PopBuiltinFunctionImpl } from './models/impl/builtins'
import PopFunctionImpl from './models/impl/function'
import { C_NULL } from './models/impl/null'
import PopNumberImpl from './models/impl/number'
import PopStringImpl from './models/impl/string'
import { PopFunction, PopObject } from './models/types'
import { Scope } from './scope'

class ContinueStatementEvalResult {}

class BreakStatementEvalResult {}

class ReturnStatementEvalResult {
  constructor(readonly returnValue: PopObject) {}
}

export function evalProgram(node: Program, scope: Scope): PopObject {
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
  return C_NULL
}

function evalStatement(
  stmt: Statement,
  scope: Scope
): PopObject | ContinueStatementEvalResult | BreakStatementEvalResult | ReturnStatementEvalResult {
  switch (stmt.nodeType) {
    case ASTNodeType.EMPTY_STATEMENT:
      return C_NULL
    case ASTNodeType.BLOCK_STATEMENT:
      return evalBlockStatement(stmt as BlockStatement, scope)
    case ASTNodeType.EXPRESSION_STATEMENT:
      return evalExpressionStatement(stmt as ExpressionStatement, scope)
    case ASTNodeType.LET_STATEMENT:
      return evalLetStatement(stmt as LetStatement, scope)
    case ASTNodeType.FUNC_DECLARATION_STATEMENT:
      return evalFuncDeclarationStatement(stmt as FuncDeclarationStatement, scope)
    case ASTNodeType.IF_STATEMENT:
      return evalIfStatement(stmt as IfStatement, scope)
    case ASTNodeType.FOR_STATEMENT:
      return evalForStatement(stmt as ForStatement, scope)
    case ASTNodeType.WHILE_STATEMENT:
      return evalWhileStatement(stmt as WhileStatement, scope)
    case ASTNodeType.CONTINUE_STATEMENT:
      return evalContinueStatement(stmt as ContinueStatement, scope)
    case ASTNodeType.BREAK_STATEMENT:
      return evalBreakStatement(stmt as BreakStatement, scope)
    case ASTNodeType.RETURN_STATEMENT:
      return evalReturnStatement(stmt as ReturnStatement, scope)
    default:
      throw new Error(`invalid statement type "${stmt.nodeType}"`)
  }
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
  return C_NULL
}

function evalExpressionStatement(stmt: ExpressionStatement, scope: Scope): PopObject {
  evalExpression(stmt.expression, scope)
  return C_NULL
}

function evalLetStatement(stmt: LetStatement, scope: Scope): PopObject {
  evalLetExpression(stmt.expression, scope)
  return C_NULL
}

function evalFuncDeclarationStatement(stmt: FuncDeclarationStatement, scope: Scope): PopObject {
  const name = stmt.identifier.literal
  if (scope.hasOwnValue(name)) {
    throw new Error(`duplicate function "${name}"`)
  }
  const parameters = stmt.parameters.map((param) => param.literal)
  const func = new PopFunctionImpl(parameters, stmt.body, scope, name)
  scope.setOwnValue(name, func)
  return C_NULL
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
  return C_NULL
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
  return C_NULL
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
  return C_NULL
}

function evalContinueStatement(stmt: ContinueStatement, scope: Scope): ContinueStatementEvalResult {
  return new ContinueStatementEvalResult()
}

function evalBreakStatement(stmt: BreakStatement, scope: Scope): BreakStatementEvalResult {
  return new BreakStatementEvalResult()
}

function evalReturnStatement(stmt: ReturnStatement, scope: Scope): ReturnStatementEvalResult {
  return new ReturnStatementEvalResult(
    stmt.returnValue ? evalExpression(stmt.returnValue, scope) : C_NULL
  )
}

function evalExpression(expr: Expression, scope: Scope): PopObject {
  switch (expr.nodeType) {
    case ASTNodeType.PREFIX_EXPRESSION:
      return evalPrefixExpression(expr as PrefixExpression, scope)
    case ASTNodeType.INFIX_EXPRESSION:
      return evalInfixExpression(expr as InfixExpression, scope)
    case ASTNodeType.LET_EXPRESSION:
      return evalLetExpression(expr as LetExpression, scope)
    case ASTNodeType.CALL_EXPRESSION:
      return evalCallExpression(expr as CallExpression, scope)
    case ASTNodeType.LITERAL_EXPRESSION:
      return evalLiteralExpression(expr as LiteralExpression, scope)
    case ASTNodeType.IDENTIFIER_EXPRESSION:
      return evalIdentifierExpression(expr as IdentifierExpression, scope)
    case ASTNodeType.FUNCTION_EXPRESSION:
      return evalFunctionExpression(expr as FunctionExpression, scope)
    default:
      throw new Error(`invalid expression type "${expr.nodeType}"`)
  }
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

function evalInfixExpression(expr: InfixExpression, scope: Scope): PopObject {
  const rightOperand = evalExpression(expr.rightOperand, scope)
  const { token } = expr.operator
  if (token === Token.ASSIGN) {
    if (expr.leftOperand instanceof IdentifierExpression) {
      const name = expr.leftOperand.symbol.literal
      const targetScope = scope.getScope(name)
      if (!targetScope) {
        throw new Error(`${name} is not defined`)
      }
      targetScope.setOwnValue(name, rightOperand)
      return C_NULL
    } else {
      throw new Error('cannot assign to lhs')
    }
  }

  if (assignmentOperators.includes(token)) {
    if (expr.leftOperand instanceof IdentifierExpression) {
      const name = expr.leftOperand.symbol.literal
      const targetScope = scope.getScope(name)
      if (!targetScope) {
        throw new Error(`${name} is not defined`)
      }
      const leftOperand = targetScope.getValue(name)!
      let value: PopObject
      const slotName = infixOpTokenToSlotNameMap[token]
      if (
        slotName &&
        slotName in leftOperand &&
        typeof (leftOperand as any)[slotName] === 'function'
      ) {
        value = (leftOperand as any)[slotName].call(leftOperand, rightOperand)
      } else {
        throw new Error(`unsupported infix operation "${getTokenName(token)}"`)
      }
      targetScope.setOwnValue(name, value)
      return C_NULL
    } else {
      throw new Error('cannot assign to lhs')
    }
  }

  const leftOperand = evalExpression(expr.leftOperand, scope)
  switch (token) {
    case Token.EQUAL:
      return leftOperand.$equal(rightOperand)
    case Token.NOT_EQUAL: {
      return leftOperand.$equal(rightOperand).$not()
    }
    case Token.LOGIC_AND: {
      const a = leftOperand.$toBoolean()
      const b = rightOperand.$toBoolean()
      return a.$unwrap() && b.$unwrap() ? C_TRUE : C_FALSE
    }
    case Token.LOGIC_OR: {
      const a = leftOperand.$toBoolean()
      const b = rightOperand.$toBoolean()
      return a.$unwrap() || b.$unwrap() ? C_TRUE : C_FALSE
    }
    default: {
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

function evalLetExpression(expr: LetExpression, scope: Scope): PopObject {
  const arr = expr.variableDeclarationSequence
  arr.forEach((item) => {
    const name = item.identifier.literal
    if (scope.hasOwnValue(name)) {
      throw new Error(`duplicate variable "${name}"`)
    }
    if (item.value) {
      const value = evalExpression(item.value, scope)
      scope.setOwnValue(name, value)
    }
  })
  return C_NULL
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

  const funcScope = new Scope(func.scope)
  func.$parameters.forEach((paramName, idx) => {
    funcScope.setOwnValue(paramName, args[idx])
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
  return C_NULL
}

function evalLiteralExpression(expr: LiteralExpression, scope: Scope): PopObject {
  switch (expr.symbol.token) {
    case Token.NUMBER_LITERAL:
      return new PopNumberImpl(expr.value as number)
    case Token.STRING_LITERAL:
      // TODO
      return new PopStringImpl(eval(expr.value as string))
    case Token.TRUE:
      return C_TRUE
    case Token.FALSE:
      return C_FALSE
    case Token.NULL:
      return C_NULL
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
  return new PopFunctionImpl(parameters, expr.body, scope)
}
