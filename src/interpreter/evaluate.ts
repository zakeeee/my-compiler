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
import PopFunctionImpl from './models/impl/function'
import PopNullImpl from './models/impl/null'
import PopNumberImpl from './models/impl/number'
import PopStringImpl from './models/impl/string'
import { PopFunction, PopObject } from './models/types'
import { Scope } from './scope'

export function evalProgram(node: Program, scope: Scope): PopObject {
  let ret: PopObject = PopNullImpl.NULL
  for (const stmt of node.body) {
    ret = evalStatement(stmt, scope)
    if (stmt instanceof ReturnStatement) {
      break
    }
  }
  return ret
}

function evalStatement(stmt: Statement, scope: Scope): PopObject {
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

function evalBlockStatement(stmt: BlockStatement, scope: Scope): PopObject {
  const blockScope = new Scope(scope)
  for (const childStmt of stmt.statements) {
    const res = evalStatement(childStmt, blockScope)
    if (childStmt instanceof ReturnStatement) {
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

function evalIfStatement(stmt: IfStatement, scope: Scope): PopObject {
  const condition = evalExpression(stmt.condition, scope)
  if (condition.$toBoolean().$unwrap()) {
    evalStatement(stmt.consequence, scope)
  } else if (stmt.alternative) {
    evalStatement(stmt.alternative, scope)
  }
  return PopNullImpl.NULL
}

function evalForStatement(stmt: ForStatement, scope: Scope): PopObject {
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
    // TODO break, continue, return
    evalStatement(bodyStatement, scope)
    if (afterEachExpr) {
      evalExpression(afterEachExpr, scope)
    }
    condition = conditionExpr ? evalExpression(conditionExpr, scope).$toBoolean().$unwrap() : true
  }
  return PopNullImpl.NULL
}

function evalWhileStatement(stmt: WhileStatement, scope: Scope): PopObject {
  const { condition: conditionExpr, body: bodyStatement } = stmt
  let condition = conditionExpr ? evalExpression(conditionExpr, scope).$toBoolean().$unwrap() : true
  while (condition) {
    // TODO break, continue, return
    evalStatement(bodyStatement, scope)
    condition = conditionExpr ? evalExpression(conditionExpr, scope).$toBoolean().$unwrap() : true
  }
  return PopNullImpl.NULL
}

function evalContinueStatement(stmt: ContinueStatement, scope: Scope): PopObject {
  return PopNullImpl.NULL
}

function evalBreakStatement(stmt: BreakStatement, scope: Scope): PopObject {
  return PopNullImpl.NULL
}

function evalReturnStatement(stmt: ReturnStatement, scope: Scope): PopObject {
  if (!stmt.returnValue) {
    return PopNullImpl.NULL
  }
  return evalExpression(stmt.returnValue, scope)
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
  if (func instanceof PopFunctionImpl) {
    const args: PopObject[] = []
    for (const argument of expr.arguments) {
      args.push(evalExpression(argument, scope))
    }
    if (args.length !== func.parameters.length) {
      throw new Error(
        `${func.identifier} requires ${func.parameters.length} arguments but ${args.length} is given`
      )
    }
    const funcScope = new Scope(scope)
    func.parameters.forEach((paramName, idx) => {
      funcScope.setValue(paramName, args[idx])
    })
    return evalBlockStatement(func.body, funcScope)
  }
  throw new Error('object is not callable')
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
  if (!obj) {
    throw new Error(`${name} is not defined`)
  }
  return obj
}

function evalFunctionExpression(expr: FunctionExpression, scope: Scope): PopFunction {
  const parameters = expr.parameters.map((param) => param.literal)
  return new PopFunctionImpl(parameters, expr.body)
}
