import {
  ArrayExpression,
  BlockStatement,
  BreakStatement,
  CallExpression,
  ContinueStatement,
  EmptyStatement,
  ExpressionStatement,
  ForStatement,
  FunctionExpression,
  FunctionStatement,
  HashExpression,
  IdentifierExpression,
  IfStatement,
  InfixExpression,
  ITreeNodeVisitor,
  KeyValue,
  LetExpression,
  LetStatement,
  LiteralExpression,
  PrefixExpression,
  Program,
  ReturnStatement,
  VariableDeclaration,
  WhileStatement,
} from 'src/ast'
import { getTokenName, TokenType } from 'src/lexer'
import PopArray from './models/impl/array'
import { C_FALSE, C_TRUE } from './models/impl/boolean'
import { builtinFunctions, PopBuiltinFunction } from './models/impl/builtins'
import PopError from './models/impl/error'
import PopFunction from './models/impl/function'
import PopHash from './models/impl/hash'
import { C_NULL } from './models/impl/null'
import PopNumber from './models/impl/number'
import PopString from './models/impl/string'
import { C_VOID, isVoid, VoidType } from './models/impl/void'
import { IPopArray, IPopFunction, IPopHash, IPopObject, IPopString } from './models/types'
import { Scope, uninitialized } from './scope'

type EvalResult<T> = [PopError, null] | [null, T]

class ContinueStatementEvalResult {}

class BreakStatementEvalResult {}

class ReturnStatementEvalResult {
  constructor(readonly returnValue: IPopObject | VoidType) {}
}

const prefixOperatorSlotNameMap = {
  [TokenType.PLUS]: 'toPositive',
  [TokenType.MINUS]: 'toNegative',
  [TokenType.BIT_NOT]: 'bitNot',
} as Readonly<Record<TokenType, string>>

const infixOperatorSlotNameMap = {
  [TokenType.STAR]: 'multiply',
  [TokenType.SLASH]: 'divide',
  [TokenType.PERCENT]: 'modulo',
  [TokenType.PLUS]: 'add',
  [TokenType.MINUS]: 'minus',
  [TokenType.GREATER_THAN]: 'greaterThan',
  [TokenType.GREATER_THAN_EQUAL]: 'greaterThanEqual',
  [TokenType.LESS_THAN]: 'lessThan',
  [TokenType.LESS_THAN_EQUAL]: 'lessThanEqual',
  [TokenType.BIT_AND]: 'bitAnd',
  [TokenType.BIT_OR]: 'bitOr',
  [TokenType.BIT_XOR]: 'bitXor',
  [TokenType.STAR_EQUAL]: 'multiply',
  [TokenType.SLASH_EQUAL]: 'divide',
  [TokenType.PERCENT_EQUAL]: 'modulo',
  [TokenType.PLUS_EQUAL]: 'add',
  [TokenType.MINUS_EQUAL]: 'minus',
  [TokenType.BIT_AND_EQUAL]: 'bitAnd',
  [TokenType.BIT_OR_EQUAL]: 'bitOr',
  [TokenType.BIT_XOR_EQUAL]: 'bitXor',
  [TokenType.L_BRACKET]: 'index',
} as Readonly<Record<TokenType, string>>

const assignmentOperators = [
  TokenType.STAR_EQUAL,
  TokenType.SLASH_EQUAL,
  TokenType.PERCENT_EQUAL,
  TokenType.PLUS_EQUAL,
  TokenType.MINUS_EQUAL,
  TokenType.BIT_AND_EQUAL,
  TokenType.BIT_OR_EQUAL,
  TokenType.BIT_XOR_EQUAL,
]

export default class Evaluator implements ITreeNodeVisitor {
  private curScope: Scope

  constructor() {
    this.curScope = new Scope()
  }

  setScope(scope: Scope) {
    this.curScope = scope
  }

  visitProgram(node: Program): VoidType {
    for (const stmt of node.body) {
      const [err, val] = stmt.accept(this)
      if (err) {
        console.error(err.printStack())
        break
      }
      if (val instanceof ContinueStatementEvalResult) {
        const err = new PopError('continue outside of loop')
        err.pushStack(stmt.token.start)
        console.error(err.printStack())
        break
      }
      if (val instanceof BreakStatementEvalResult) {
        const err = new PopError('break outside of loop')
        err.pushStack(stmt.token.start)
        console.error(err.printStack())
        break
      }
      if (val instanceof ReturnStatementEvalResult) {
        const err = new PopError('return outside of function')
        err.pushStack(stmt.token.start)
        console.error(err.printStack())
        break
      }
    }
    return C_VOID
  }

  visitBlockStatement(
    node: BlockStatement
  ): EvalResult<
    VoidType | ContinueStatementEvalResult | BreakStatementEvalResult | ReturnStatementEvalResult
  > {
    const { curScope: prevScope } = this
    this.curScope = new Scope(prevScope)
    try {
      for (const stmt of node.statements) {
        const [err, val] = stmt.accept(this)
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
    } finally {
      this.curScope = prevScope
    }
  }

  visitEmptyStatement(node: EmptyStatement): EvalResult<VoidType> {
    return [null, C_VOID]
  }

  visitExpressionStatement(node: ExpressionStatement): EvalResult<VoidType> {
    const [err] = node.expression.accept(this)
    if (err) {
      return [err, null]
    }
    return [null, C_VOID]
  }

  visitLetStatement(node: LetStatement): EvalResult<VoidType> {
    const [err] = node.expression.accept(this)
    if (err) {
      return [err, null]
    }
    return [null, C_VOID]
  }

  visitFunctionStatement(node: FunctionStatement): EvalResult<VoidType> {
    const name = node.identifier.lexeme
    const scope = this.curScope
    if (scope.hasOwnValue(name)) {
      const err = new PopError(`duplicate function "${name}"`)
      err.pushStack(node.token.start)
      return [err, null]
    }
    const params = node.parameters.map((param) => param.lexeme)
    const func = new PopFunction(params, node.body, scope, name)
    scope.setOwnValue(name, func)
    return [null, C_VOID]
  }

  visitIfStatement(
    node: IfStatement
  ): EvalResult<
    VoidType | ContinueStatementEvalResult | BreakStatementEvalResult | ReturnStatementEvalResult
  > {
    const [err, condition] = node.condition.accept(this)
    if (err) {
      return [err, null]
    }
    if (isVoid(condition)) {
      const err = new PopError(`condition is no value`)
      err.pushStack(node.condition.token.start)
      return [err, null]
    }
    if (condition.toBoolean().unwrap()) {
      return node.consequence.accept(this)
    } else if (node.alternative) {
      return node.alternative.accept(this)
    }
    return [null, C_NULL]
  }

  visitForStatement(node: ForStatement): EvalResult<VoidType | ReturnStatementEvalResult> {
    const {
      initialize: initializeExpr,
      condition: conditionExpr,
      afterEach: afterEachExpr,
      body: bodyStatement,
    } = node

    const { curScope: prevScope } = this
    this.curScope = new Scope(prevScope)
    try {
      if (initializeExpr) {
        const [err] = initializeExpr.accept(this)
        if (err) {
          return [err, null]
        }
      }

      let condition = true
      if (conditionExpr) {
        const [err, val] = conditionExpr.accept(this)
        if (err) {
          return [err, null]
        }
        if (isVoid(val)) {
          const err = new PopError(`condition is no value`)
          err.pushStack(conditionExpr.token.start)
          return [err, null]
        }
        condition = val.toBoolean().unwrap()
      }
      while (condition) {
        const [err, val] = bodyStatement.accept(this)
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
          const [err] = afterEachExpr.accept(this)
          if (err) {
            return [err, null]
          }
        }

        if (conditionExpr) {
          const [err, val] = conditionExpr.accept(this)
          if (err) {
            return [err, null]
          }
          if (isVoid(val)) {
            const err = new PopError(`condition is no value`)
            err.pushStack(conditionExpr.token.start)
            return [err, null]
          }
          condition = val.toBoolean().unwrap()
        }
      }
      return [null, C_VOID]
    } finally {
      this.curScope = prevScope
    }
  }

  visitWhileStatement(node: WhileStatement): EvalResult<VoidType | ReturnStatementEvalResult> {
    const [err, val] = node.condition.accept(this)
    if (err) {
      return [err, null]
    }
    if (isVoid(val)) {
      const err = new PopError(`condition is no value`)
      err.pushStack(node.condition.token.start)
      return [err, null]
    }
    let condition = val.toBoolean().unwrap()
    while (condition) {
      const [err1, val1] = node.body.accept(this)
      if (err1) {
        return [err1, null]
      }
      if (val1 instanceof BreakStatementEvalResult) {
        break
      }
      if (val1 instanceof ReturnStatementEvalResult) {
        return [null, val1]
      }

      const [err2, val2] = node.condition.accept(this)
      if (err2) {
        return [err2, null]
      }
      if (isVoid(val2)) {
        const err = new PopError(`condition is no value`)
        err.pushStack(node.condition.token.start)
        return [err, null]
      }
      condition = val2.toBoolean().unwrap()
    }
    return [null, C_VOID]
  }

  visitContinueStatement(node: ContinueStatement): EvalResult<ContinueStatementEvalResult> {
    return [null, new ContinueStatementEvalResult()]
  }

  visitBreakStatement(node: BreakStatement): EvalResult<BreakStatementEvalResult> {
    return [null, new BreakStatementEvalResult()]
  }

  visitReturnStatement(node: ReturnStatement): EvalResult<ReturnStatementEvalResult> {
    let ret: IPopObject | VoidType = C_VOID
    if (node.returnValue) {
      const [err, val] = node.returnValue.accept(this)
      if (err) {
        return [err, null]
      }
      ret = val
    }
    return [null, new ReturnStatementEvalResult(ret)]
  }

  visitPrefixExpression(node: PrefixExpression): EvalResult<IPopObject> {
    const [err, operand] = node.operand.accept(this)
    if (err) {
      return [err, null]
    }
    if (isVoid(operand)) {
      const err = new PopError(`operand is no value`)
      err.pushStack(node.operand.token.start)
      return [err, null]
    }

    switch (node.operator.type) {
      case TokenType.BANG:
        return [null, operand.toBoolean().not()]
      default: {
        const tokenType = node.operator.type
        const slotName = prefixOperatorSlotNameMap[tokenType]
        if (slotName && slotName in operand) {
          const func = (operand as any)[slotName]
          if (typeof func === 'function') {
            try {
              return [null, func.call(operand)]
            } catch (error) {
              const message = error instanceof Error ? error.message : `${error}`
              const err = new PopError(message)
              err.pushStack(node.operator.start)
              return [err, null]
            }
          }
        }
        const err = new PopError(`unsupported infix operation "${getTokenName(tokenType)}"`)
        err.pushStack(node.operator.start)
        return [err, null]
      }
    }
  }

  visitInfixExpression(node: InfixExpression): EvalResult<VoidType | IPopObject> {
    const [err1, rightOperand] = node.right.accept(this)
    if (err1) {
      return [err1, null]
    }
    if (isVoid(rightOperand)) {
      const err = new PopError(`right operand is no value`)
      err.pushStack(node.right.token.start)
      return [err, null]
    }

    if (node.operator.type === TokenType.ASSIGN) {
      // lhs = rhs
      if (!(node.left instanceof IdentifierExpression)) {
        // 不是左值
        const err = new PopError('cannot assign to lhs')
        err.pushStack(node.left.token.start)
        return [err, null]
      }

      const name = node.left.token.lexeme
      const targetScope = this.curScope.getScope(name)
      if (!targetScope) {
        const err = new PopError(`"${name}" is not defined`)
        err.pushStack(node.left.token.start)
        return [err, null]
      }

      targetScope.setOwnValue(name, rightOperand)
      return [null, C_VOID]
    }

    if (assignmentOperators.includes(node.operator.type)) {
      // lhs += rhs, lhs -= rhs, ...
      if (!(node.left instanceof IdentifierExpression)) {
        // 不是左值
        const err = new PopError('cannot assign to lhs')
        err.pushStack(node.left.token.start)
        return [err, null]
      }

      const name = node.left.token.lexeme
      const targetScope = this.curScope.getScope(name)
      if (!targetScope) {
        const err = new PopError(`"${name}" is not defined`)
        err.pushStack(node.left.token.start)
        return [err, null]
      }

      const leftOperand = targetScope.getValue(name)!
      if (leftOperand === uninitialized) {
        const err = new PopError(`"${name}" is not initialized`)
        err.pushStack(node.left.token.start)
        return [err, null]
      }

      let value: IPopObject
      const tokenType = node.operator.type
      const slotName = infixOperatorSlotNameMap[tokenType]
      if (
        slotName &&
        slotName in leftOperand &&
        typeof (leftOperand as any)[slotName] === 'function'
      ) {
        value = (leftOperand as any)[slotName].call(leftOperand, rightOperand)
      } else {
        const err = new PopError(`unsupported infix operation "${getTokenName(tokenType)}"`)
        err.pushStack(node.operator.start)
        return [err, null]
      }

      targetScope.setOwnValue(name, value)
      return [null, C_VOID]
    }

    const [err2, leftOperand] = node.left.accept(this)
    if (err2) {
      return [err2, null]
    }
    if (isVoid(leftOperand)) {
      const err = new PopError(`left operator is no value`)
      err.pushStack(node.left.token.start)
      return [err, null]
    }
    const tokenType = node.operator.type
    switch (tokenType) {
      case TokenType.EQUAL:
        return [null, leftOperand.equal(rightOperand)]
      case TokenType.BANG_EQUAL: {
        return [null, leftOperand.equal(rightOperand).not()]
      }
      case TokenType.LOGIC_AND: {
        const a = leftOperand.toBoolean()
        const b = rightOperand.toBoolean()
        return [null, a.unwrap() && b.unwrap() ? C_TRUE : C_FALSE]
      }
      case TokenType.LOGIC_OR: {
        const a = leftOperand.toBoolean()
        const b = rightOperand.toBoolean()
        return [null, a.unwrap() || b.unwrap() ? C_TRUE : C_FALSE]
      }
      default: {
        const slotName = infixOperatorSlotNameMap[tokenType]
        if (slotName && slotName in leftOperand) {
          const func = (leftOperand as any)[slotName]
          if (typeof func === 'function') {
            try {
              return [null, func.call(leftOperand, rightOperand)]
            } catch (error) {
              const message = error instanceof Error ? error.message : `${error}`
              const err = new PopError(message)
              err.pushStack(node.operator.start)
              return [err, null]
            }
          }
        }
        const err = new PopError(`unsupported infix operation "${getTokenName(tokenType)}"`)
        err.pushStack(node.operator.start)
        return [err, null]
      }
    }
  }

  visitVariableDeclaration(node: VariableDeclaration): EvalResult<VoidType> {
    const name = node.identifier.lexeme

    if (this.curScope.hasOwnValue(name)) {
      // 当前作用域内重复声明
      const err = new PopError(`duplicate variable "${name}"`)
      err.pushStack(node.identifier.start)
      return [err, null]
    }

    if (node.value) {
      const [err, val] = node.value.accept(this)
      if (err) {
        return [err, null]
      }
      if (isVoid(val)) {
        const err = new PopError(`rhs is no value`)
        err.pushStack(node.identifier.start)
        return [err, null]
      }
      this.curScope.setOwnValue(name, val)
    } else {
      this.curScope.setOwnValue(name, uninitialized)
    }
    return [null, C_VOID]
  }

  visitLetExpression(node: LetExpression): EvalResult<VoidType> {
    const arr = node.variableDeclarationSequence
    for (const item of arr) {
      const [err] = item.accept(this)
      if (err) {
        return [err, null]
      }
    }
    return [null, C_VOID]
  }

  visitCallExpression(node: CallExpression): EvalResult<VoidType | IPopObject> {
    const [err1, func] = node.callable.accept(this)
    if (err1) {
      err1.pushStack(node.token.start)
      return [err1, null]
    }

    if (!(func instanceof PopFunction || func instanceof PopBuiltinFunction)) {
      const err = new PopError(`object is not callable`)
      err.pushStack(node.token.start)
      return [err, null]
    }

    const args: IPopObject[] = []
    for (const arg of node.args) {
      const [err, val] = arg.accept(this)
      if (err) {
        return [err, null]
      }
      if (isVoid(val)) {
        const err = new PopError(`no value used as args`)
        err.pushStack(arg.token.start)
        return [err, null]
      }
      args.push(val)
    }
    if (args.length < func.parameters.length) {
      const err = new PopError(
        `${func.name} requires at least ${func.parameters.length} arguments but ${args.length} is given`
      )
      err.pushStack(node.token.start)
      return [err, null]
    }

    if (func instanceof PopBuiltinFunction) {
      try {
        return [null, func.call(args)]
      } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`
        const err = new PopError(message)
        err.pushStack(node.token.start)
        return [err, null]
      }
    }

    const { curScope: preScope } = this
    const funcScope = new Scope(func.scope)
    func.parameters.forEach((paramName, idx) => {
      funcScope.setOwnValue(paramName, args[idx])
    })
    this.curScope = funcScope
    try {
      const [err2, res] = func.body.accept(this)
      if (err2) {
        err2.pushStack(node.token.start)
        return [err2, null]
      }
      if (res instanceof ContinueStatementEvalResult) {
        const err = new PopError('continue outside of loop')
        err.pushStack(node.token.start)
        return [err, null]
      }
      if (res instanceof BreakStatementEvalResult) {
        const err = new PopError('break outside of loop')
        err.pushStack(node.token.start)
        return [err, null]
      }
      if (res instanceof ReturnStatementEvalResult) {
        return [null, res.returnValue]
      }
      return [null, C_VOID]
    } finally {
      this.curScope = preScope
    }
  }

  visitLiteralExpression(node: LiteralExpression): EvalResult<IPopObject> {
    switch (node.token.type) {
      case TokenType.NUMBER_LITERAL:
        return [null, new PopNumber(node.value as number)]
      case TokenType.STRING_LITERAL:
        return [null, new PopString(node.value as string)]
      case TokenType.TRUE:
        return [null, C_TRUE]
      case TokenType.FALSE:
        return [null, C_FALSE]
      case TokenType.NULL:
        return [null, C_NULL]
      default: {
        const err = new PopError('unknown literal expression')
        err.pushStack(node.token.start)
        return [err, null]
      }
    }
  }

  visitIdentifierExpression(node: IdentifierExpression): EvalResult<IPopObject> {
    const name = node.token.lexeme
    const obj = this.curScope.getValue(name)
    if (obj) {
      // 使用了未初始化的变量
      if (obj === uninitialized) {
        const err = new PopError(`${name} is not initialized`)
        err.pushStack(node.token.start)
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
    err.pushStack(node.token.start)
    return [err, null]
  }

  visitFunctionExpression(node: FunctionExpression): EvalResult<IPopFunction> {
    const parameters = node.params.map((param) => param.token.lexeme)
    return [null, new PopFunction(parameters, node.body, this.curScope)]
  }

  visitArrayExpression(node: ArrayExpression): EvalResult<IPopArray> {
    const elements: IPopObject[] = []
    for (const expr of node.elements) {
      const [err, val] = expr.accept(this)
      if (err) {
        return [err, null]
      }
      if (isVoid(val)) {
        const err = new PopError(`array element is no value`)
        err.pushStack(expr.token.start)
        return [err, null]
      }
      elements.push(val)
    }
    return [null, new PopArray(elements)]
  }

  visitKeyValue(node: KeyValue): EvalResult<[IPopString, IPopObject]> {
    const [err1, key] = node.key.accept(this)
    if (err1) {
      return [err1, null]
    }

    const [err2, value] = node.value.accept(this)
    if (err2) {
      return [err2, null]
    }
    if (isVoid(value)) {
      const err = new PopError(`hash item value is no value`)
      err.pushStack(node.value.token.start)
      return [err, null]
    }
    return [null, [key as IPopString, value]]
  }

  visitHashExpression(node: HashExpression): EvalResult<IPopHash> {
    const elements = new Map<string, IPopObject>()
    const { keyValueSequence } = node
    for (const keyValue of keyValueSequence) {
      const [err, val] = keyValue.accept(this)
      if (err) {
        return [err, null]
      }

      const [key, value] = val
      elements.set(key.unwrap(), value)
    }
    return [null, new PopHash(elements)]
  }
}
