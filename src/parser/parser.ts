import {
  BlockStatement,
  BreakStatement,
  CallExpression,
  ContinueStatement,
  EmptyStatement,
  Expression,
  ExpressionStatement,
  ForStatement,
  FunctionExpression,
  FunctionStatement,
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
  VariableDeclaration,
  WhileStatement,
} from '../ast'
import { getTokenName, Lexer, LexicalSymbol, Token } from '../lexer'

// TODO Better Error Handling
class ParseError extends Error {
  constructor(symbol: LexicalSymbol) {
    super('parse error')
    console.log('current symbol:', symbol)
    this.name = 'ParseError'
  }
}

class UnexpectedTokenError extends ParseError {
  constructor(symbol: LexicalSymbol, expectedToken: Token) {
    super(symbol)
    const { start, token } = symbol
    this.message = `expect token "${getTokenName(expectedToken)}", got "${getTokenName(
      token
    )}" at [${start.line}:${start.column}]`
    this.name = 'UnexpectedTokenError'
  }
}

enum Precedence {
  LOWEST,
  ASSIGNMENT_OP, // *=, /=, %=, +=, -=, &=, |=, ^=
  ASSIGN, // =
  LOGIC_OP, // &&, ||
  BIT_OP, // &, |, ^
  EQUAL, // ==, !=
  COMPARE, // >, >=, <, <=
  SUM, // +, -
  PRODUCT, // *, /
  PREFIX, // +, -, !
  CALL,
}

const precedences = {
  [Token.MULTIPLY_EQUAL]: Precedence.ASSIGNMENT_OP,
  [Token.DIVIDE_EQUAL]: Precedence.ASSIGNMENT_OP,
  [Token.MODULO_EQUAL]: Precedence.ASSIGNMENT_OP,
  [Token.PLUS_EQUAL]: Precedence.ASSIGNMENT_OP,
  [Token.MINUS_EQUAL]: Precedence.ASSIGNMENT_OP,
  [Token.BIT_AND_EQUAL]: Precedence.ASSIGNMENT_OP,
  [Token.BIT_OR_EQUAL]: Precedence.ASSIGNMENT_OP,
  [Token.BIT_XOR_EQUAL]: Precedence.ASSIGNMENT_OP,
  [Token.ASSIGN]: Precedence.ASSIGN,
  [Token.LOGIC_AND]: Precedence.LOGIC_OP,
  [Token.LOGIC_OR]: Precedence.LOGIC_OP,
  [Token.BIT_AND]: Precedence.BIT_OP,
  [Token.BIT_OR]: Precedence.BIT_OP,
  [Token.BIT_XOR]: Precedence.BIT_OP,
  [Token.EQUAL]: Precedence.EQUAL,
  [Token.NOT_EQUAL]: Precedence.EQUAL,
  [Token.LESS_THAN]: Precedence.COMPARE,
  [Token.LESS_THAN_EQUAL]: Precedence.COMPARE,
  [Token.GREATER_THAN]: Precedence.COMPARE,
  [Token.GREATER_THAN_EQUAL]: Precedence.COMPARE,
  [Token.PLUS]: Precedence.SUM,
  [Token.MINUS]: Precedence.SUM,
  [Token.ASTERISK]: Precedence.PRODUCT,
  [Token.SLASH]: Precedence.PRODUCT,
  [Token.PERCENT]: Precedence.PRODUCT,
  [Token.L_PAREN]: Precedence.CALL,
} as Readonly<Record<Token, Precedence>>

export class Parser {
  private currentSymbol!: LexicalSymbol
  private nextSymbol!: LexicalSymbol
  private prefixParseFuncs = new Map<Token, () => Expression>()
  private infixParseFuncs = new Map<Token, (left: Expression) => Expression>()

  constructor(private lexer: Lexer) {
    // 初始化 currentSymbol 和 nextSymbol
    this.readNextSymbol()
    this.readNextSymbol()
    ;[Token.PLUS, Token.MINUS, Token.NOT, Token.BIT_NOT].forEach((token) => {
      this.prefixParseFuncs.set(token, this.parsePrefixExpression.bind(this))
    })
    this.prefixParseFuncs.set(Token.IDENTIFIER, this.parseIdentifierExpression.bind(this))
    ;[Token.NULL, Token.TRUE, Token.FALSE, Token.NUMBER_LITERAL, Token.STRING_LITERAL].forEach(
      (token) => {
        this.prefixParseFuncs.set(token, this.parseLiteralExpression.bind(this))
      }
    )
    this.prefixParseFuncs.set(Token.L_PAREN, this.parseGroupedExpression.bind(this))
    this.prefixParseFuncs.set(Token.LET, this.parseLetExpression.bind(this))
    this.prefixParseFuncs.set(Token.FUNC, this.parseFunctionExpression.bind(this))
    ;[
      Token.ASSIGN,
      Token.LOGIC_AND,
      Token.LOGIC_OR,
      Token.BIT_AND,
      Token.BIT_OR,
      Token.BIT_XOR,
      Token.EQUAL,
      Token.NOT_EQUAL,
      Token.LESS_THAN,
      Token.LESS_THAN_EQUAL,
      Token.GREATER_THAN,
      Token.GREATER_THAN_EQUAL,
      Token.PLUS,
      Token.MINUS,
      Token.ASTERISK,
      Token.SLASH,
      Token.PERCENT,
      Token.MULTIPLY_EQUAL,
      Token.DIVIDE_EQUAL,
      Token.MODULO_EQUAL,
      Token.PLUS_EQUAL,
      Token.MINUS_EQUAL,
      Token.BIT_AND_EQUAL,
      Token.BIT_OR_EQUAL,
      Token.BIT_XOR_EQUAL,
    ].forEach((token) => {
      this.infixParseFuncs.set(token, this.parseInfixExpression.bind(this))
    })
    this.infixParseFuncs.set(Token.L_PAREN, this.parseCallExpression.bind(this))
  }

  parseProgram(): Program {
    const symbol = { ...this.currentSymbol }
    const statements: Statement[] = []
    while (!this.currentTokenIs(Token.EOF)) {
      const statement = this.parseStatement()
      statements.push(statement)
    }
    return new Program(symbol, statements)
  }

  private parseStatement(): Statement {
    switch (this.currentSymbol.token) {
      case Token.L_BRACE:
        return this.parseBlockStatement()
      case Token.SEMICOLON:
        return new EmptyStatement({ ...this.currentSymbol })
      case Token.LET:
        return this.parseLetStatement()
      case Token.FUNC:
        return this.parseFunctionStatement()
      case Token.IF:
        return this.parseIfStatement()
      case Token.FOR:
        return this.parseForStatement()
      case Token.WHILE:
        return this.parseWhileStatement()
      case Token.CONTINUE:
        return this.parseContinueStatement()
      case Token.BREAK:
        return this.parseBreakStatement()
      case Token.RETURN:
        return this.parseReturnStatement()
      default:
        return this.parseExpressionStatement()
    }
  }

  private parseBlockStatement(): BlockStatement {
    const symbol = { ...this.currentSymbol }
    this.parseToken(Token.L_BRACE)
    const statements: Statement[] = []
    while (!this.currentTokenIs(Token.R_BRACE)) {
      const statement = this.parseStatement()
      statements.push(statement)
    }
    this.parseToken(Token.R_BRACE)
    return new BlockStatement(symbol, statements)
  }

  private parseExpressionStatement(): ExpressionStatement {
    const symbol = { ...this.currentSymbol }
    const expression = this.parseExpression(Precedence.LOWEST)
    this.parseToken(Token.SEMICOLON)
    return new ExpressionStatement(symbol, expression)
  }

  private parseLetStatement(): LetStatement {
    const symbol = { ...this.currentSymbol }
    const expression = this.parseLetExpression()
    this.parseToken(Token.SEMICOLON)
    return new LetStatement(symbol, expression)
  }

  private parseFunctionStatement(): FunctionStatement {
    const symbol = { ...this.currentSymbol }
    this.parseToken(Token.FUNC)
    const identifier = this.parseIdentifier()
    this.parseToken(Token.L_PAREN)
    const parameters: LexicalSymbol[] = []
    if (!this.currentTokenIs(Token.R_PAREN)) {
      parameters.push(this.parseIdentifier())
      while (this.currentTokenIs(Token.COMMA)) {
        this.parseToken(Token.COMMA)
        parameters.push(this.parseIdentifier())
      }
    }
    this.parseToken(Token.R_PAREN)
    const body = this.parseBlockStatement()
    return new FunctionStatement(symbol, identifier, parameters, body)
  }

  private parseIfStatement(): IfStatement {
    const symbol = { ...this.currentSymbol }
    this.parseToken(Token.IF)
    this.parseToken(Token.L_PAREN)
    const condition = this.parseExpression(Precedence.LOWEST)
    this.parseToken(Token.R_PAREN)
    const consequence = this.parseStatement()
    let alternative: Statement | null = null
    if (this.currentTokenIs(Token.ELSE)) {
      this.parseToken(Token.ELSE)
      alternative = this.parseStatement()
    }
    return new IfStatement(symbol, condition, consequence, alternative)
  }

  private parseForStatement(): ForStatement {
    const symbol = { ...this.currentSymbol }
    this.parseToken(Token.FOR)
    this.parseToken(Token.L_PAREN)
    let initialize: Expression | null = null
    let condition: Expression | null = null
    let afterEach: Expression | null = null
    if (!this.currentTokenIs(Token.SEMICOLON)) {
      initialize = this.parseExpression(Precedence.LOWEST)
    }
    this.parseToken(Token.SEMICOLON)
    if (!this.currentTokenIs(Token.SEMICOLON)) {
      condition = this.parseExpression(Precedence.LOWEST)
    }
    this.parseToken(Token.SEMICOLON)
    if (!this.currentTokenIs(Token.R_PAREN)) {
      afterEach = this.parseExpression(Precedence.LOWEST)
    }
    this.parseToken(Token.R_PAREN)
    const body = this.parseStatement()
    return new ForStatement(symbol, body, initialize, condition, afterEach)
  }

  private parseWhileStatement(): WhileStatement {
    const symbol = { ...this.currentSymbol }
    this.parseToken(Token.WHILE)
    this.parseToken(Token.L_PAREN)
    const condition = this.parseExpression(Precedence.LOWEST)
    this.parseToken(Token.R_PAREN)
    const body = this.parseStatement()
    return new WhileStatement(symbol, condition, body)
  }

  private parseContinueStatement(): ContinueStatement {
    const symbol = { ...this.currentSymbol }
    this.parseToken(Token.CONTINUE)
    this.parseToken(Token.SEMICOLON)
    return new ContinueStatement(symbol)
  }

  private parseBreakStatement(): BreakStatement {
    const symbol = { ...this.currentSymbol }
    this.parseToken(Token.BREAK)
    this.parseToken(Token.SEMICOLON)
    return new BreakStatement(symbol)
  }

  private parseReturnStatement(): ReturnStatement {
    const symbol = { ...this.currentSymbol }
    this.parseToken(Token.RETURN)
    const returnValue = this.parseExpression(Precedence.LOWEST)
    this.parseToken(Token.SEMICOLON)
    return new ReturnStatement(symbol, returnValue)
  }

  private parseExpression(precedence: Precedence): Expression {
    // Pratt parsing algorithm
    const prefixParseFunc = this.prefixParseFuncs.get(this.currentSymbol.token)
    if (!prefixParseFunc) {
      throw new ParseError(this.currentSymbol)
    }
    let leftExpr = prefixParseFunc()

    while (!this.currentTokenIs(Token.SEMICOLON) && precedence < this.currentPrecedence()) {
      const infixParseFunc = this.infixParseFuncs.get(this.currentSymbol.token)
      if (!infixParseFunc) {
        return leftExpr
      }
      leftExpr = infixParseFunc(leftExpr)
    }
    return leftExpr
  }

  private parseIdentifierExpression(): IdentifierExpression {
    const symbol = this.parseIdentifier()
    return new IdentifierExpression(symbol)
  }

  private parseFunctionExpression(): FunctionExpression {
    const symbol = { ...this.currentSymbol }
    this.parseToken(Token.FUNC)
    this.parseToken(Token.L_PAREN)
    const parameters: IdentifierExpression[] = []
    if (!this.currentTokenIs(Token.R_PAREN)) {
      parameters.push(new IdentifierExpression(this.parseIdentifier()))
      while (this.currentTokenIs(Token.COMMA)) {
        this.parseToken(Token.COMMA)
        parameters.push(new IdentifierExpression(this.parseIdentifier()))
      }
    }
    this.parseToken(Token.R_PAREN)
    const body = this.parseBlockStatement()
    return new FunctionExpression(symbol, parameters, body)
  }

  private parseLiteralExpression(): LiteralExpression {
    const symbol = { ...this.currentSymbol }
    let value: unknown
    switch (this.currentSymbol.token) {
      case Token.NULL:
        value = null
        break
      case Token.TRUE:
      case Token.FALSE:
        value = this.currentTokenIs(Token.TRUE)
        break
      case Token.NUMBER_LITERAL:
        value = +this.currentSymbol.literal
        break
      case Token.STRING_LITERAL:
        value = this.currentSymbol.literal
        break
      default:
        throw new ParseError(this.currentSymbol)
    }
    this.readNextSymbol()
    return new LiteralExpression(symbol, value)
  }

  private parsePrefixExpression(): PrefixExpression {
    const symbol = { ...this.currentSymbol }
    const operator = { ...this.currentSymbol }
    this.readNextSymbol()
    const operand = this.parseExpression(Precedence.PREFIX)
    return new PrefixExpression(symbol, operator, operand)
  }

  private parseInfixExpression(left: Expression): InfixExpression {
    const symbol = { ...this.currentSymbol }
    const operator = { ...this.currentSymbol }
    const precedence = this.currentPrecedence()
    this.readNextSymbol()
    const right = this.parseExpression(precedence)
    return new InfixExpression(symbol, operator, left, right)
  }

  private parseLetExpression(): LetExpression {
    const symbol = { ...this.currentSymbol }
    this.parseToken(Token.LET)
    const arr: VariableDeclaration[] = []
    let identifier: LexicalSymbol
    let value: Expression | null
    identifier = this.parseIdentifier()
    if (this.currentTokenIs(Token.ASSIGN)) {
      this.parseToken(Token.ASSIGN)
      value = this.parseExpression(Precedence.LOWEST)
    } else {
      value = null
    }
    arr.push(new VariableDeclaration(identifier, identifier, value))
    while (this.currentTokenIs(Token.COMMA)) {
      this.parseToken(Token.COMMA)
      identifier = this.parseIdentifier()
      if (this.currentTokenIs(Token.ASSIGN)) {
        this.parseToken(Token.ASSIGN)
        value = this.parseExpression(Precedence.LOWEST)
      } else {
        value = null
      }
      arr.push(new VariableDeclaration(identifier, identifier, value))
    }
    return new LetExpression(symbol, arr)
  }

  private parseGroupedExpression(): Expression {
    this.parseToken(Token.L_PAREN)
    const expr = this.parseExpression(Precedence.LOWEST)
    this.parseToken(Token.R_PAREN)
    return expr
  }

  private parseCallExpression(left: Expression): CallExpression {
    const symbol = { ...this.currentSymbol }
    const callable = left
    this.parseToken(Token.L_PAREN)
    const args: Expression[] = []
    if (!this.currentTokenIs(Token.R_PAREN)) {
      args.push(this.parseExpression(Precedence.LOWEST))
      while (this.currentTokenIs(Token.COMMA)) {
        this.parseToken(Token.COMMA)
        args.push(this.parseExpression(Precedence.LOWEST))
      }
    }
    this.parseToken(Token.R_PAREN)
    return new CallExpression(symbol, callable, args)
  }

  private readNextSymbol() {
    this.currentSymbol = this.nextSymbol
    this.nextSymbol = this.lexer.nextSymbol()
  }

  private parseToken(token: Token) {
    if (this.currentSymbol.token !== token) {
      throw new UnexpectedTokenError(this.currentSymbol, token)
    }
    this.readNextSymbol()
  }

  private parseIdentifier(): LexicalSymbol {
    if (this.currentSymbol.token !== Token.IDENTIFIER) {
      throw new UnexpectedTokenError(this.currentSymbol, Token.IDENTIFIER)
    }
    const ret = { ...this.currentSymbol }
    this.readNextSymbol()
    return ret
  }

  private currentTokenIs(token: Token) {
    return this.currentSymbol.token === token
  }

  private nextTokenIs(token: Token) {
    return this.nextSymbol.token === token
  }

  private currentPrecedence(): Precedence {
    return precedences[this.currentSymbol.token] ?? Precedence.LOWEST
  }

  private nextPrecedence(): Precedence {
    return precedences[this.nextSymbol.token] ?? Precedence.LOWEST
  }
}
