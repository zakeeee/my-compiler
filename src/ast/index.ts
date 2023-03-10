import { Token } from 'src/lexer';

export interface TreeNodeVisitor {
  visitProgram(node: Program): any;

  //#region statements
  visitBlockStatement(node: BlockStatement): any;

  visitEmptyStatement(node: EmptyStatement): any;

  visitExpressionStatement(node: ExpressionStatement): any;

  visitLetStatement(node: LetStatement): any;

  visitIfStatement(node: IfStatement): any;

  visitForStatement(node: ForStatement): any;

  visitWhileStatement(node: WhileStatement): any;

  visitContinueStatement(node: ContinueStatement): any;

  visitBreakStatement(node: BreakStatement): any;

  visitReturnStatement(node: ReturnStatement): any;

  visitFunctionStatement(node: FunctionStatement): any;

  visitMethodStatement(node: MethodStatement): any;

  visitClassStatement(node: ClassStatement): any;
  //#endregion

  //#region expressions
  visitPrefixExpression(node: PrefixExpression): any;

  visitInfixExpression(node: InfixExpression): any;

  visitAssignmentExpression(node: AssignmentExpression): any;

  visitLetExpression(node: LetExpression): any;

  visitCallExpression(node: CallExpression): any;

  visitLiteralExpression(node: LiteralExpression): any;

  visitIdExpression(node: IdExpression): any;

  visitFunctionExpression(node: FunctionExpression): any;

  visitArrayLiteralExpression(node: ArrayLiteralExpression): any;

  visitHashLiteralExpression(node: HashLiteralExpression): any;

  visitDotExpression(node: DotExpression): any;

  visitIndexExpression(node: IndexExpression): any;

  visitNewExpression(node: NewExpression): any;

  visitThisExpression(node: ThisExpression): any;

  visitSuperExpression(node: SuperExpression): any;
  //#endregion
}

export interface TreeNode<V extends keyof TreeNodeVisitor> {
  token: Token;

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T[V]>;
}

export class Program implements TreeNode<'visitProgram'> {
  constructor(public token: Token, public stmts: Statement[]) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitProgram']> {
    return visitor.visitProgram(this);
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
  | ReturnStatement;

export class BlockStatement implements TreeNode<'visitBlockStatement'> {
  constructor(public token: Token, public stmts: Statement[]) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitBlockStatement']> {
    return visitor.visitBlockStatement(this);
  }
}

export class EmptyStatement implements TreeNode<'visitEmptyStatement'> {
  constructor(public token: Token) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitEmptyStatement']> {
    return visitor.visitEmptyStatement(this);
  }
}

export class ExpressionStatement implements TreeNode<'visitExpressionStatement'> {
  constructor(public token: Token, public expr: Expression) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitExpressionStatement']> {
    return visitor.visitExpressionStatement(this);
  }
}

export class LetStatement implements TreeNode<'visitLetStatement'> {
  constructor(public token: Token, public expr: LetExpression) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitLetStatement']> {
    return visitor.visitLetStatement(this);
  }
}

export class IfStatement implements TreeNode<'visitIfStatement'> {
  constructor(
    public token: Token,
    public condition: Expression,
    public consequence: Statement,
    public alternative: Statement | null = null
  ) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitIfStatement']> {
    return visitor.visitIfStatement(this);
  }
}

export class ForStatement implements TreeNode<'visitForStatement'> {
  constructor(
    public token: Token,
    public body: Statement,
    public initialize: Expression | null = null,
    public condition: Expression | null = null,
    public afterEach: Expression | null = null
  ) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitForStatement']> {
    return visitor.visitForStatement(this);
  }
}

export class WhileStatement implements TreeNode<'visitWhileStatement'> {
  constructor(public token: Token, public condition: Expression, public body: Statement) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitWhileStatement']> {
    return visitor.visitWhileStatement(this);
  }
}

export class ContinueStatement implements TreeNode<'visitContinueStatement'> {
  constructor(public token: Token) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitContinueStatement']> {
    return visitor.visitContinueStatement(this);
  }
}

export class BreakStatement implements TreeNode<'visitBreakStatement'> {
  constructor(public token: Token) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitBreakStatement']> {
    return visitor.visitBreakStatement(this);
  }
}

export class ReturnStatement implements TreeNode<'visitReturnStatement'> {
  constructor(public token: Token, public value: Expression | null = null) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitReturnStatement']> {
    return visitor.visitReturnStatement(this);
  }
}

export class FunctionStatement implements TreeNode<'visitFunctionStatement'> {
  constructor(
    public token: Token,
    public name: Token,
    public params: Token[],
    public body: BlockStatement
  ) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitFunctionStatement']> {
    return visitor.visitFunctionStatement(this);
  }
}

export class MethodStatement implements TreeNode<'visitMethodStatement'> {
  constructor(
    public token: Token,
    public name: Token,
    public params: Token[],
    public body: BlockStatement,
    public isStatic: boolean
  ) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitMethodStatement']> {
    return visitor.visitMethodStatement(this);
  }
}

export class ClassStatement implements TreeNode<'visitClassStatement'> {
  constructor(
    public token: Token,
    public name: Token,
    public superClass: Token | null,
    public methods: MethodStatement[]
  ) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitClassStatement']> {
    return visitor.visitClassStatement(this);
  }
}

export type Expression =
  | PrefixExpression
  | InfixExpression
  | LetExpression
  | AssignmentExpression
  | FunctionExpression
  | CallExpression
  | LiteralExpression
  | ArrayLiteralExpression
  | HashLiteralExpression
  | IdExpression
  | DotExpression
  | NewExpression
  | ThisExpression
  | SuperExpression;

export class PrefixExpression implements TreeNode<'visitPrefixExpression'> {
  constructor(public token: Token, public operator: Token, public operand: Expression) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitPrefixExpression']> {
    return visitor.visitPrefixExpression(this);
  }
}

export class InfixExpression implements TreeNode<'visitInfixExpression'> {
  constructor(
    public token: Token,
    public operator: Token,
    public left: Expression,
    public right: Expression
  ) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitInfixExpression']> {
    return visitor.visitInfixExpression(this);
  }
}

export class AssignmentExpression implements TreeNode<'visitAssignmentExpression'> {
  constructor(
    public token: Token,
    public operator: Token,
    public left: IdExpression | DotExpression | IndexExpression,
    public right: Expression
  ) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitAssignmentExpression']> {
    return visitor.visitAssignmentExpression(this);
  }
}

export class LetExpression implements TreeNode<'visitLetExpression'> {
  constructor(
    public token: Token,
    public varDecls: { name: Token; initializer: Expression | null }[]
  ) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitLetExpression']> {
    return visitor.visitLetExpression(this);
  }
}

export class CallExpression implements TreeNode<'visitCallExpression'> {
  constructor(public token: Token, public callee: Expression, public args: Expression[]) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitCallExpression']> {
    return visitor.visitCallExpression(this);
  }
}

export class LiteralExpression implements TreeNode<'visitLiteralExpression'> {
  constructor(public token: Token, public literal: Token, public value: unknown) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitLiteralExpression']> {
    return visitor.visitLiteralExpression(this);
  }
}

export class ArrayLiteralExpression implements TreeNode<'visitArrayLiteralExpression'> {
  constructor(public token: Token, public elements: Expression[]) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitArrayLiteralExpression']> {
    return visitor.visitArrayLiteralExpression(this);
  }
}

export class HashLiteralExpression implements TreeNode<'visitHashLiteralExpression'> {
  constructor(public token: Token, public entries: { key: string; value: Expression }[]) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitHashLiteralExpression']> {
    return visitor.visitHashLiteralExpression(this);
  }
}

export class IdExpression implements TreeNode<'visitIdExpression'> {
  constructor(public token: Token, public name: Token) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitIdExpression']> {
    return visitor.visitIdExpression(this);
  }
}

export class FunctionExpression implements TreeNode<'visitFunctionExpression'> {
  constructor(public token: Token, public params: Token[], public body: BlockStatement) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitFunctionExpression']> {
    return visitor.visitFunctionExpression(this);
  }
}

export class IndexExpression implements TreeNode<'visitIndexExpression'> {
  constructor(public token: Token, public indexable: Expression, public index: Expression) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitIndexExpression']> {
    return visitor.visitIndexExpression(this);
  }
}

export class DotExpression implements TreeNode<'visitDotExpression'> {
  constructor(public token: Token, public object: Expression, public prop: Token) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitDotExpression']> {
    return visitor.visitDotExpression(this);
  }
}

export class NewExpression implements TreeNode<'visitNewExpression'> {
  constructor(public token: Token, public cls: Token, public args: Expression[]) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitNewExpression']> {
    return visitor.visitNewExpression(this);
  }
}

export class ThisExpression implements TreeNode<'visitThisExpression'> {
  constructor(public token: Token) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitThisExpression']> {
    return visitor.visitThisExpression(this);
  }
}

export class SuperExpression implements TreeNode<'visitSuperExpression'> {
  constructor(public token: Token, public prop: Token) {}

  accept<T extends TreeNodeVisitor>(visitor: T): ReturnType<T['visitSuperExpression']> {
    return visitor.visitSuperExpression(this);
  }
}
