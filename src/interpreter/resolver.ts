import {
  ArrayLiteralExpression,
  AssignmentExpression,
  BlockStatement,
  BreakStatement,
  CallExpression,
  ClassStatement,
  ContinueStatement,
  EmptyStatement,
  Expression,
  ExpressionStatement,
  ForStatement,
  FunctionExpression,
  FunctionStatement,
  GetPropertyExpression,
  HashLiteralExpression,
  IdentifierExpression,
  IfStatement,
  IndexExpression,
  InfixExpression,
  LetExpression,
  LetStatement,
  LiteralExpression,
  MethodStatement,
  NewExpression,
  PrefixExpression,
  Program,
  ReturnStatement,
  ThisExpression,
  TreeNodeVisitor,
  WhileStatement,
} from 'src/ast'
import { Token } from 'src/lexer'

enum LoopType {
  NONE,
  LOOP,
}

enum FunctionType {
  NONE,
  FUNCTION,
  METHOD,
}

enum ClassType {
  NONE,
  CLASS,
}

export class Resolver implements TreeNodeVisitor {
  private scopes: Map<string, boolean>[] = []
  private loopType = LoopType.NONE
  private functionType = FunctionType.NONE
  private classType = ClassType.NONE
  private locals = new Map<Expression, number>()

  run(root: Program): Map<Expression, number> {
    this.visitProgram(root)
    return this.locals
  }

  visitProgram(node: Program) {
    for (const stmt of node.stmts) {
      stmt.accept(this)
    }
  }

  visitBlockStatement(node: BlockStatement) {
    this.beginScope()
    for (const stmt of node.stmts) {
      stmt.accept(this)
    }
    this.endScope()
  }

  visitEmptyStatement(node: EmptyStatement) {
    // noop
  }

  visitExpressionStatement(node: ExpressionStatement) {
    node.expr.accept(this)
  }

  visitLetStatement(node: LetStatement) {
    node.expr.accept(this)
  }

  visitIfStatement(node: IfStatement) {
    node.condition.accept(this)
    node.consequence.accept(this)
    node.alternative?.accept(this)
  }

  visitForStatement(node: ForStatement) {
    this.beginScope()
    const prevLoopType = this.loopType
    this.loopType = LoopType.LOOP
    node.initialize?.accept(this)
    node.condition?.accept(this)
    node.body.accept(this)
    node.afterEach?.accept(this)
    this.loopType = prevLoopType
    this.endScope()
  }

  visitWhileStatement(node: WhileStatement) {
    const prevLoopType = this.loopType
    this.loopType = LoopType.LOOP
    node.condition.accept(this)
    node.body.accept(this)
    this.loopType = prevLoopType
  }

  visitContinueStatement(node: ContinueStatement) {
    if (this.loopType !== LoopType.LOOP) {
      throw new Error('cannot use continue outside of loop')
    }
  }

  visitBreakStatement(node: BreakStatement) {
    if (this.loopType !== LoopType.LOOP) {
      throw new Error('cannot use break outside of loop')
    }
  }

  visitReturnStatement(node: ReturnStatement) {
    if (this.functionType !== FunctionType.FUNCTION && this.functionType !== FunctionType.METHOD) {
      throw new Error('cannot use return outside of function or method')
    }
    node.value?.accept(this)
  }

  visitFunctionStatement(node: FunctionStatement) {
    this.declare(node.name)
    this.define(node.name)
    this.beginScope()
    const prevLoopType = this.loopType
    this.loopType = LoopType.NONE
    const prevFunctionType = this.functionType
    this.functionType = FunctionType.FUNCTION
    for (const param of node.params) {
      this.declare(param)
      this.define(param)
    }
    node.body.accept(this)
    this.loopType = prevLoopType
    this.functionType = prevFunctionType
    this.endScope()
  }

  visitMethodStatement(node: MethodStatement) {
    this.declare(node.name)
    this.define(node.name)
    this.beginScope()
    const prevLoopType = this.loopType
    this.loopType = LoopType.NONE
    const prevFunctionType = this.functionType
    this.functionType = FunctionType.METHOD
    for (const param of node.params) {
      this.declare(param)
      this.define(param)
    }
    node.body.accept(this)
    this.loopType = prevLoopType
    this.functionType = prevFunctionType
    this.endScope()
  }

  visitClassStatement(node: ClassStatement) {
    this.declare(node.name)
    this.define(node.name)
    this.beginScope()
    const prevLoopType = this.loopType
    this.loopType = LoopType.NONE
    const prevClassType = this.classType
    this.classType = ClassType.CLASS
    for (const method of node.methods) {
      method.accept(this)
    }
    this.loopType = prevLoopType
    this.classType = prevClassType
    this.endScope()
  }

  visitPrefixExpression(node: PrefixExpression) {
    node.operand.accept(this)
  }

  visitInfixExpression(node: InfixExpression) {
    node.left.accept(this)
    node.right.accept(this)
  }

  visitAssignmentExpression(node: AssignmentExpression) {
    node.right.accept(this)
    node.left.accept(this)
  }

  visitLetExpression(node: LetExpression) {
    for (const decl of node.varDecls) {
      this.declare(decl.name)
      if (decl.initializer) {
        this.define(decl.name)
        decl.initializer.accept(this)
      }
    }
  }

  visitCallExpression(node: CallExpression) {
    node.callee.accept(this)
    for (const arg of node.args) {
      arg.accept(this)
    }
  }

  visitLiteralExpression(node: LiteralExpression) {
    // noop
  }

  visitIdentifierExpression(node: IdentifierExpression) {
    if (this.scopes.length && this.scopes[this.scopes.length - 1].get(node.name.lexeme) === false) {
      throw new Error(`"${node.name.lexeme}" is not defined`)
    }
    this.resolveLocal(node, node.name)
  }

  visitFunctionExpression(node: FunctionExpression) {
    this.beginScope()
    const prevLoopType = this.loopType
    this.loopType = LoopType.NONE
    const prevFunctionType = this.functionType
    this.functionType = FunctionType.FUNCTION
    for (const param of node.params) {
      this.declare(param)
      this.define(param)
    }
    node.body.accept(this)
    this.loopType = prevLoopType
    this.functionType = prevFunctionType
    this.endScope()
  }

  visitArrayLiteralExpression(node: ArrayLiteralExpression) {
    for (const element of node.elements) {
      element.accept(this)
    }
  }

  visitHashLiteralExpression(node: HashLiteralExpression) {
    for (const entry of node.entries) {
      entry.value.accept(this)
    }
  }

  visitGetPropertyExpression(node: GetPropertyExpression) {
    node.object.accept(this)
  }

  visitNewExpression(node: NewExpression) {
    for (const arg of node.args) {
      arg.accept(this)
    }
  }

  visitThisExpression(node: ThisExpression) {
    if (this.classType !== ClassType.CLASS) {
      throw new Error('cannot use this outside of class')
    }
  }

  visitIndexExpression(node: IndexExpression) {
    node.index.accept(this)
    node.indexable.accept(this)
  }

  private beginScope() {
    this.scopes.push(new Map())
  }

  private endScope() {
    this.scopes.pop()
  }

  private declare(name: Token) {
    if (!this.scopes.length) {
      return
    }

    const curScope = this.scopes[this.scopes.length - 1]
    if (curScope.has(name.lexeme)) {
      throw new Error(`name "${name.lexeme}" is already declared`)
    }
    curScope.set(name.lexeme, false)
  }

  private define(name: Token) {
    if (!this.scopes.length) {
      return
    }

    const curScope = this.scopes[this.scopes.length - 1]
    curScope.set(name.lexeme, true)
  }

  private resolveLocal(expr: Expression, name: Token) {
    const top = this.scopes.length - 1
    for (let i = top; i >= 0; --i) {
      if (this.scopes[i].has(name.lexeme)) {
        const distance = top - i
        this.locals.set(expr, distance)
        return
      }
    }
  }
}
