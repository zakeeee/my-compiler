import { LexerSymbol } from 'src/lexer';

export class Program {
  body: Statement[] = [];
}

export abstract class Statement {}

export class BlockStatement extends Statement {
  statements: Statement[] = [];
}

export class EmptyStatement extends Statement {}

export class ExpressionStatement extends Statement {
  expressions: Expression[] = [];
}

export class LetStatement extends Statement {
  identifier: LexerSymbol | null = null;
  value: Expression | null = null;
}

export class FuncDeclarationStatement extends Statement {
  identifier: LexerSymbol | null = null;
  parameters: LexerSymbol[] = [];
  body: BlockStatement | null = null;
}

export class IfStatement extends Statement {
  condition: Expression | null = null;
  trueBranch: Statement | null = null;
  falseBranch: Statement | null = null;
}

export class ForStatement extends Statement {
  initialize: Expression | null = null;
  condition: Expression | null = null;
  afterEach: Expression | null = null;
  body: Statement | null = null;
}

export class WhileStatement extends Statement {
  condition: Expression | null = null;
  body: Statement | null = null;
}

export class ContinueStatement extends Statement {}

export class BreakStatement extends Statement {}

export class ReturnStatement extends Statement {
  returnValue: Expression | null = null;
}

export abstract class Expression {}

export class PrefixExpression extends Expression {
  operator: LexerSymbol | null = null;
  operand: Expression | null = null;
}

export class InfixExpression extends Expression {
  operator: LexerSymbol | null = null;
  leftOperand: Expression | null = null;
  rightOperand: Expression | null = null;
}

export class CallExpression extends Expression {
  callable: Expression | null = null;
  arguments: Expression[] = [];
}

export class LiteralExpression extends Expression {
  symbol: LexerSymbol | null = null;
  value: unknown;
}

export class IdentifierExpression extends Expression {
  symbol: LexerSymbol | null = null;
}

export class FunctionExpression extends Expression {
  parameters: LexerSymbol[] = [];
  body: BlockStatement | null = null;
}
