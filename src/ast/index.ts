import { Token } from 'src/lexer'

export interface ITreeNodeVisitor {
  visitProgram(node: Program): any

  visitBlockStatement(node: BlockStatement): any
  visitEmptyStatement(node: EmptyStatement): any
  visitExpressionStatement(node: ExpressionStatement): any
  visitLetStatement(node: LetStatement): any
  visitFunctionStatement(node: FunctionStatement): any
  visitIfStatement(node: IfStatement): any
  visitForStatement(node: ForStatement): any
  visitWhileStatement(node: WhileStatement): any
  visitContinueStatement(node: ContinueStatement): any
  visitBreakStatement(node: BreakStatement): any
  visitReturnStatement(node: ReturnStatement): any

  visitPrefixExpression(node: PrefixExpression): any
  visitInfixExpression(node: InfixExpression): any
  visitVariableDeclaration(node: VariableDeclaration): any
  visitLetExpression(node: LetExpression): any
  visitCallExpression(node: CallExpression): any
  visitLiteralExpression(node: LiteralExpression): any
  visitIdentifierExpression(node: IdentifierExpression): any
  visitFunctionExpression(node: FunctionExpression): any
  visitArrayExpression(node: ArrayExpression): any
  visitKeyValue(node: KeyValue): any
  visitHashExpression(node: HashExpression): any
}

export interface ITreeNode<V extends keyof ITreeNodeVisitor> {
  token: Token

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T[V]>
}

export class Program implements ITreeNode<'visitProgram'> {
  constructor(public token: Token, public body: Statement[]) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitProgram']> {
    return visitor.visitProgram(this)
  }
}

export type Statement =
  | BlockStatement
  | EmptyStatement
  | ExpressionStatement
  | LetStatement
  | FunctionStatement
  | IfStatement
  | ForStatement
  | WhileStatement
  | ContinueStatement
  | BreakStatement
  | ReturnStatement

export class BlockStatement implements ITreeNode<'visitBlockStatement'> {
  constructor(public token: Token, public statements: Statement[]) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitBlockStatement']> {
    return visitor.visitBlockStatement(this)
  }
}

export class EmptyStatement implements ITreeNode<'visitEmptyStatement'> {
  constructor(public token: Token) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitEmptyStatement']> {
    return visitor.visitEmptyStatement(this)
  }
}

export class ExpressionStatement implements ITreeNode<'visitExpressionStatement'> {
  constructor(public token: Token, public expression: Expression) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitExpressionStatement']> {
    return visitor.visitExpressionStatement(this)
  }
}

export class LetStatement implements ITreeNode<'visitLetStatement'> {
  constructor(public token: Token, public expression: LetExpression) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitLetStatement']> {
    return visitor.visitLetStatement(this)
  }
}

export class FunctionStatement implements ITreeNode<'visitFunctionStatement'> {
  constructor(
    public token: Token,
    public identifier: Token,
    public parameters: Token[],
    public body: BlockStatement
  ) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitFunctionStatement']> {
    return visitor.visitFunctionStatement(this)
  }
}

export class IfStatement implements ITreeNode<'visitIfStatement'> {
  constructor(
    public token: Token,
    public condition: Expression,
    public consequence: Statement,
    public alternative: Statement | null = null
  ) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitIfStatement']> {
    return visitor.visitIfStatement(this)
  }
}

export class ForStatement implements ITreeNode<'visitForStatement'> {
  constructor(
    public token: Token,
    public body: Statement,
    public initialize: Expression | null = null,
    public condition: Expression | null = null,
    public afterEach: Expression | null = null
  ) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitForStatement']> {
    return visitor.visitForStatement(this)
  }
}

export class WhileStatement implements ITreeNode<'visitWhileStatement'> {
  constructor(public token: Token, public condition: Expression, public body: Statement) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitWhileStatement']> {
    return visitor.visitWhileStatement(this)
  }
}

export class ContinueStatement implements ITreeNode<'visitContinueStatement'> {
  constructor(public token: Token) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitContinueStatement']> {
    return visitor.visitContinueStatement(this)
  }
}

export class BreakStatement implements ITreeNode<'visitBreakStatement'> {
  constructor(public token: Token) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitBreakStatement']> {
    return visitor.visitBreakStatement(this)
  }
}

export class ReturnStatement implements ITreeNode<'visitReturnStatement'> {
  constructor(public token: Token, public returnValue: Expression | null = null) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitReturnStatement']> {
    return visitor.visitReturnStatement(this)
  }
}

export type Expression =
  | PrefixExpression
  | InfixExpression
  | LetExpression
  | CallExpression
  | LiteralExpression
  | IdentifierExpression
  | FunctionExpression
  | ArrayExpression
  | HashExpression

export class PrefixExpression implements ITreeNode<'visitPrefixExpression'> {
  constructor(public token: Token, public operator: Token, public operand: Expression) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitPrefixExpression']> {
    return visitor.visitPrefixExpression(this)
  }
}

export class InfixExpression implements ITreeNode<'visitInfixExpression'> {
  constructor(
    public token: Token,
    public operator: Token,
    public left: Expression,
    public right: Expression
  ) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitInfixExpression']> {
    return visitor.visitInfixExpression(this)
  }
}

export class VariableDeclaration implements ITreeNode<'visitVariableDeclaration'> {
  constructor(public token: Token, public identifier: Token, public value: Expression | null) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitVariableDeclaration']> {
    return visitor.visitVariableDeclaration(this)
  }
}

export class LetExpression implements ITreeNode<'visitLetExpression'> {
  constructor(public token: Token, public variableDeclarationSequence: VariableDeclaration[]) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitLetExpression']> {
    return visitor.visitLetExpression(this)
  }
}

export class CallExpression implements ITreeNode<'visitCallExpression'> {
  constructor(public token: Token, public callable: Expression, public args: Expression[]) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitCallExpression']> {
    return visitor.visitCallExpression(this)
  }
}

export class LiteralExpression implements ITreeNode<'visitLiteralExpression'> {
  constructor(public token: Token, public value: unknown) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitLiteralExpression']> {
    return visitor.visitLiteralExpression(this)
  }
}

export class IdentifierExpression implements ITreeNode<'visitIdentifierExpression'> {
  constructor(public token: Token) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitIdentifierExpression']> {
    return visitor.visitIdentifierExpression(this)
  }
}

export class FunctionExpression implements ITreeNode<'visitFunctionExpression'> {
  constructor(
    public token: Token,
    public params: IdentifierExpression[],
    public body: BlockStatement
  ) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitFunctionExpression']> {
    return visitor.visitFunctionExpression(this)
  }
}

export class ArrayExpression implements ITreeNode<'visitArrayExpression'> {
  constructor(public token: Token, public elements: Expression[]) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitArrayExpression']> {
    return visitor.visitArrayExpression(this)
  }
}

export class KeyValue implements ITreeNode<'visitKeyValue'> {
  constructor(public token: Token, public key: LiteralExpression, public value: Expression) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitKeyValue']> {
    return visitor.visitKeyValue(this)
  }
}

export class HashExpression implements ITreeNode<'visitHashExpression'> {
  constructor(public token: Token, public keyValueSequence: KeyValue[]) {}

  accept<T extends ITreeNodeVisitor>(visitor: T): ReturnType<T['visitHashExpression']> {
    return visitor.visitHashExpression(this)
  }
}
