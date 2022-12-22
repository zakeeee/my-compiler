import { LexerSymbol } from '../lexer'

export enum ASTNodeType {
  PROGRAM = 'Program',

  BLOCK_STATEMENT = 'BlockStatement',
  EMPTY_STATEMENT = 'EmptyStatement',
  EXPRESSION_STATEMENT = 'ExpressionStatement',
  LET_STATEMENT = 'LetStatement',
  FUNC_DECLARATION_STATEMENT = 'FuncDeclarationStatement',
  IF_STATEMENT = 'IfStatement',
  FOR_STATEMENT = 'ForStatement',
  WHILE_STATEMENT = 'WhileStatement',
  CONTINUE_STATEMENT = 'ContinueStatement',
  BREAK_STATEMENT = 'BreakStatement',
  RETURN_STATEMENT = 'ReturnStatement',

  PREFIX_EXPRESSION = 'PrefixExpression',
  INFIX_EXPRESSION = 'InfixExpression',
  CALL_EXPRESSION = 'CallExpression',
  LITERAL_EXPRESSION = 'LiteralExpression',
  IDENTIFIER_EXPRESSION = 'IdentifierExpression',
  FUNCTION_EXPRESSION = 'FunctionExpression',
}

export interface ASTNode {
  readonly nodeType: ASTNodeType
}

export class Program implements ASTNode {
  readonly nodeType = ASTNodeType.PROGRAM
  body: Statement[] = []
}

export abstract class Statement implements ASTNode {
  abstract readonly nodeType: ASTNodeType
}

export class BlockStatement extends Statement {
  readonly nodeType = ASTNodeType.BLOCK_STATEMENT
  statements: Statement[] = []
}

export class EmptyStatement extends Statement {
  readonly nodeType = ASTNodeType.EMPTY_STATEMENT
}

export class ExpressionStatement extends Statement {
  readonly nodeType = ASTNodeType.EXPRESSION_STATEMENT
  expression!: Expression
}

export class LetStatement extends Statement {
  readonly nodeType = ASTNodeType.LET_STATEMENT
  identifier!: LexerSymbol
  value!: Expression
}

export class FuncDeclarationStatement extends Statement {
  readonly nodeType = ASTNodeType.FUNC_DECLARATION_STATEMENT
  identifier!: LexerSymbol
  parameters: LexerSymbol[] = []
  body!: BlockStatement
}

export class IfStatement extends Statement {
  readonly nodeType = ASTNodeType.IF_STATEMENT
  condition!: Expression
  consequence!: Statement
  alternative: Statement | null = null
}

export class ForStatement extends Statement {
  readonly nodeType = ASTNodeType.FOR_STATEMENT
  initialize: Expression | null = null
  condition: Expression | null = null
  afterEach: Expression | null = null
  body!: Statement
}

export class WhileStatement extends Statement {
  readonly nodeType = ASTNodeType.WHILE_STATEMENT
  condition!: Expression
  body!: Statement
}

export class ContinueStatement extends Statement {
  readonly nodeType = ASTNodeType.CONTINUE_STATEMENT
}

export class BreakStatement extends Statement {
  readonly nodeType = ASTNodeType.BREAK_STATEMENT
}

export class ReturnStatement extends Statement {
  readonly nodeType = ASTNodeType.RETURN_STATEMENT
  returnValue: Expression | null = null
}

export abstract class Expression implements ASTNode {
  abstract readonly nodeType: ASTNodeType
}

export class PrefixExpression extends Expression {
  readonly nodeType = ASTNodeType.PREFIX_EXPRESSION
  operator!: LexerSymbol
  operand!: Expression
}

export class InfixExpression extends Expression {
  readonly nodeType = ASTNodeType.INFIX_EXPRESSION
  operator!: LexerSymbol
  leftOperand!: Expression
  rightOperand!: Expression
}

export class CallExpression extends Expression {
  readonly nodeType = ASTNodeType.CALL_EXPRESSION
  callable!: Expression
  arguments: Expression[] = []
}

export class LiteralExpression extends Expression {
  readonly nodeType = ASTNodeType.LITERAL_EXPRESSION
  symbol!: LexerSymbol
  value: unknown
}

export class IdentifierExpression extends Expression {
  readonly nodeType = ASTNodeType.IDENTIFIER_EXPRESSION
  symbol!: LexerSymbol
}

export class FunctionExpression extends Expression {
  readonly nodeType = ASTNodeType.FUNCTION_EXPRESSION
  parameters: LexerSymbol[] = []
  body!: BlockStatement
}
