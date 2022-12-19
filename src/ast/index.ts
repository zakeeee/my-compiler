import { LexerSymbol } from 'src/lexer'

export interface ASTNode {}

export class Program implements ASTNode {
  body: Statement[] = []
}

export abstract class Statement implements ASTNode {}

export class BlockStatement extends Statement {
  statements: Statement[] = []
}

export class EmptyStatement extends Statement {}

export class ExpressionStatement extends Statement {
  expression!: Expression
}

export class LetStatement extends Statement {
  identifier!: LexerSymbol
  value!: Expression
}

export class FuncDeclarationStatement extends Statement {
  identifier!: LexerSymbol
  parameters: LexerSymbol[] = []
  body!: BlockStatement
}

export class IfStatement extends Statement {
  condition!: Expression
  consequence!: Statement
  alternative: Statement | null = null
}

export class ForStatement extends Statement {
  initialize: Expression | null = null
  condition: Expression | null = null
  afterEach: Expression | null = null
  body!: Statement
}

export class WhileStatement extends Statement {
  condition!: Expression
  body!: Statement
}

export class ContinueStatement extends Statement {}

export class BreakStatement extends Statement {}

export class ReturnStatement extends Statement {
  returnValue: Expression | null = null
}

export abstract class Expression implements ASTNode {}

export class PrefixExpression extends Expression {
  operator!: LexerSymbol
  operand!: Expression
}

export class InfixExpression extends Expression {
  operator!: LexerSymbol
  leftOperand!: Expression
  rightOperand!: Expression
}

export class CallExpression extends Expression {
  callable!: Expression
  arguments: Expression[] = []
}

export class LiteralExpression extends Expression {
  symbol!: LexerSymbol
  value: unknown
}

export class IdentifierExpression extends Expression {
  symbol!: LexerSymbol
}

export class FunctionExpression extends Expression {
  parameters: LexerSymbol[] = []
  body!: BlockStatement
}
