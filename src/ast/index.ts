import { LexicalSymbol } from '../lexer'

export enum TreeNodeType {
  PROGRAM = 'program',
  VARIABLE_DECLARATION = 'variableDeclaration',
  KEY_VALUE = 'keyValue',

  BLOCK_STATEMENT = 'blockStatement',
  EMPTY_STATEMENT = 'emptyStatement',
  EXPRESSION_STATEMENT = 'expressionStatement',
  LET_STATEMENT = 'letStatement',
  FUNCTION_STATEMENT = 'functionStatement',
  IF_STATEMENT = 'ifStatement',
  FOR_STATEMENT = 'forStatement',
  WHILE_STATEMENT = 'whileStatement',
  CONTINUE_STATEMENT = 'continueStatement',
  BREAK_STATEMENT = 'breakStatement',
  RETURN_STATEMENT = 'returnStatement',

  PREFIX_EXPRESSION = 'prefixExpression',
  INFIX_EXPRESSION = 'infixExpression',
  LET_EXPRESSION = 'letExpression',
  FUNCTION_EXPRESSION = 'functionExpression',
  CALL_EXPRESSION = 'callExpression',
  LITERAL_EXPRESSION = 'literalExpression',
  IDENTIFIER_EXPRESSION = 'identifierExpression',
  ARRAY_EXPRESSION = 'arrayExpression',
  HASH_EXPRESSION = 'hashExpression',
}

export interface TreeNode {
  nodeType: TreeNodeType
  symbol: LexicalSymbol
}

export class Program implements TreeNode {
  nodeType = TreeNodeType.PROGRAM

  constructor(public symbol: LexicalSymbol, public body: Statement[]) {}
}

export interface Statement extends TreeNode {}

export class BlockStatement implements Statement {
  nodeType = TreeNodeType.BLOCK_STATEMENT

  constructor(public symbol: LexicalSymbol, public statements: Statement[]) {}
}

export class EmptyStatement implements Statement {
  nodeType = TreeNodeType.EMPTY_STATEMENT

  constructor(public symbol: LexicalSymbol) {}
}

export class ExpressionStatement implements Statement {
  nodeType = TreeNodeType.EXPRESSION_STATEMENT

  constructor(public symbol: LexicalSymbol, public expression: Expression) {}
}

export class LetStatement implements Statement {
  nodeType = TreeNodeType.LET_STATEMENT

  constructor(public symbol: LexicalSymbol, public expression: LetExpression) {}
}

export class FunctionStatement implements Statement {
  nodeType = TreeNodeType.FUNCTION_STATEMENT

  constructor(
    public symbol: LexicalSymbol,
    public identifier: LexicalSymbol,
    public parameters: LexicalSymbol[],
    public body: BlockStatement
  ) {}
}

export class IfStatement implements Statement {
  nodeType = TreeNodeType.IF_STATEMENT

  constructor(
    public symbol: LexicalSymbol,
    public condition: Expression,
    public consequence: Statement,
    public alternative: Statement | null = null
  ) {}
}

export class ForStatement implements Statement {
  nodeType = TreeNodeType.FOR_STATEMENT

  constructor(
    public symbol: LexicalSymbol,
    public body: Statement,
    public initialize: Expression | null = null,
    public condition: Expression | null = null,
    public afterEach: Expression | null = null
  ) {}
}

export class WhileStatement implements Statement {
  nodeType = TreeNodeType.WHILE_STATEMENT

  constructor(public symbol: LexicalSymbol, public condition: Expression, public body: Statement) {}
}

export class ContinueStatement implements Statement {
  nodeType = TreeNodeType.CONTINUE_STATEMENT

  constructor(public symbol: LexicalSymbol) {}
}

export class BreakStatement implements Statement {
  nodeType = TreeNodeType.BREAK_STATEMENT

  constructor(public symbol: LexicalSymbol) {}
}

export class ReturnStatement implements Statement {
  nodeType = TreeNodeType.RETURN_STATEMENT

  constructor(public symbol: LexicalSymbol, public returnValue: Expression | null = null) {}
}

export interface Expression extends TreeNode {}

export class PrefixExpression implements Expression {
  nodeType = TreeNodeType.PREFIX_EXPRESSION

  constructor(
    public symbol: LexicalSymbol,
    public operator: LexicalSymbol,
    public operand: Expression
  ) {}
}

export class InfixExpression implements Expression {
  nodeType = TreeNodeType.INFIX_EXPRESSION

  constructor(
    public symbol: LexicalSymbol,
    public operator: LexicalSymbol,
    public left: Expression,
    public right: Expression
  ) {}
}

export class VariableDeclaration implements TreeNode {
  nodeType = TreeNodeType.VARIABLE_DECLARATION

  constructor(
    public symbol: LexicalSymbol,
    public identifier: LexicalSymbol,
    public value: Expression | null
  ) {}
}

export class LetExpression implements Expression {
  nodeType = TreeNodeType.LET_EXPRESSION

  constructor(
    public symbol: LexicalSymbol,
    public variableDeclarationSequence: VariableDeclaration[]
  ) {}
}

export class CallExpression implements Expression {
  nodeType = TreeNodeType.CALL_EXPRESSION

  constructor(
    public symbol: LexicalSymbol,
    public callable: Expression,
    public args: Expression[]
  ) {}
}

export class LiteralExpression implements Expression {
  nodeType = TreeNodeType.LITERAL_EXPRESSION

  constructor(public symbol: LexicalSymbol, public value: unknown) {}
}

export class StringLiteralExpression implements Expression {
  nodeType = TreeNodeType.LITERAL_EXPRESSION

  constructor(public symbol: LexicalSymbol, public value: string) {}
}

export class IdentifierExpression implements Expression {
  nodeType = TreeNodeType.IDENTIFIER_EXPRESSION

  constructor(public symbol: LexicalSymbol) {}
}

export class FunctionExpression implements Expression {
  nodeType = TreeNodeType.FUNCTION_EXPRESSION

  constructor(
    public symbol: LexicalSymbol,
    public params: IdentifierExpression[],
    public body: BlockStatement
  ) {}
}

export class ArrayExpression implements Expression {
  nodeType = TreeNodeType.ARRAY_EXPRESSION

  constructor(public symbol: LexicalSymbol, public elements: Expression[]) {}
}

export class KeyValue implements TreeNode {
  nodeType = TreeNodeType.KEY_VALUE

  constructor(
    public symbol: LexicalSymbol,
    public key: StringLiteralExpression,
    public value: Expression
  ) {}
}

export class HashExpression implements Expression {
  nodeType = TreeNodeType.HASH_EXPRESSION

  constructor(public symbol: LexicalSymbol, public keyValueSequence: KeyValue[]) {}
}
