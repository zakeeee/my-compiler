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
} from '../ast'
import { getTokenName, Lexer, LexerSymbol, Token } from '../lexer'

// TODO Better Error Handling
class ParseError extends Error {
  constructor(symbol: LexerSymbol) {
    super('parse error')
    console.log('current symbol:', symbol)
    this.name = 'ParseError'
  }
}

class UnexpectedTokenError extends ParseError {
  constructor(symbol: LexerSymbol, expectedToken: Token) {
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
  private currentSymbol!: LexerSymbol
  private nextSymbol!: LexerSymbol
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
    ].forEach((token) => {
      this.infixParseFuncs.set(token, this.parseInfixExpression.bind(this))
    })
    this.infixParseFuncs.set(Token.L_PAREN, this.parseCallExpression.bind(this))
  }

  parseProgram(): Program {
    const program = new Program()
    while (!this.currentTokenIs(Token.EOF)) {
      const statement = this.parseStatement()
      program.body.push(statement)
    }
    return program
  }

  private parseStatement(): Statement {
    switch (this.currentSymbol.token) {
      case Token.L_BRACE:
        return this.parseBlockStatement()
      case Token.SEMICOLON:
        return new EmptyStatement()
      case Token.LET:
        return this.parseLetStatement()
      case Token.FUNC:
        return this.parseFuncDeclarationStatement()
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
    const stmt = new BlockStatement()
    this.parseToken(Token.L_BRACE)
    const statements: Statement[] = []
    while (!this.currentTokenIs(Token.R_BRACE)) {
      const statement = this.parseStatement()
      statements.push(statement)
    }
    stmt.statements = statements
    this.parseToken(Token.R_BRACE)
    return stmt
  }

  private parseExpressionStatement(): ExpressionStatement {
    const stmt = new ExpressionStatement()
    stmt.expression = this.parseExpression(Precedence.LOWEST)
    this.parseToken(Token.SEMICOLON)
    return stmt
  }

  private parseLetStatement(): LetStatement {
    const statement = new LetStatement()
    this.parseToken(Token.LET)
    statement.identifier = this.parseIdentifier()
    this.parseToken(Token.ASSIGN)
    statement.value = this.parseExpression(Precedence.LOWEST)
    this.parseToken(Token.SEMICOLON)
    return statement
  }

  private parseFuncDeclarationStatement(): FuncDeclarationStatement {
    const stmt = new FuncDeclarationStatement()
    this.parseToken(Token.FUNC)
    stmt.identifier = this.parseIdentifier()
    this.parseToken(Token.L_PAREN)
    const parameters: LexerSymbol[] = []
    if (!this.currentTokenIs(Token.R_PAREN)) {
      parameters.push(this.parseIdentifier())
      while (this.currentTokenIs(Token.COMMA)) {
        this.parseToken(Token.COMMA)
        parameters.push(this.parseIdentifier())
      }
    }
    stmt.parameters = parameters
    this.parseToken(Token.R_PAREN)
    stmt.body = this.parseBlockStatement()
    return stmt
  }

  private parseIfStatement(): IfStatement {
    const stmt = new IfStatement()
    this.parseToken(Token.IF)
    this.parseToken(Token.L_PAREN)
    stmt.condition = this.parseExpression(Precedence.LOWEST)
    this.parseToken(Token.R_PAREN)
    stmt.consequence = this.parseStatement()
    if (this.currentTokenIs(Token.ELSE)) {
      this.parseToken(Token.ELSE)
      stmt.alternative = this.parseStatement()
    }
    return stmt
  }

  private parseForStatement(): ForStatement {
    const stmt = new ForStatement()
    this.parseToken(Token.FOR)
    this.parseToken(Token.L_PAREN)
    if (!this.currentTokenIs(Token.SEMICOLON)) {
      stmt.initialize = this.parseExpression(Precedence.LOWEST)
    }
    this.parseToken(Token.SEMICOLON)
    if (!this.currentTokenIs(Token.SEMICOLON)) {
      stmt.condition = this.parseExpression(Precedence.LOWEST)
    }
    this.parseToken(Token.SEMICOLON)
    if (!this.currentTokenIs(Token.R_PAREN)) {
      stmt.afterEach = this.parseExpression(Precedence.LOWEST)
    }
    this.parseToken(Token.R_PAREN)
    stmt.body = this.parseStatement()
    return stmt
  }

  private parseWhileStatement(): WhileStatement {
    const stmt = new WhileStatement()
    this.parseToken(Token.WHILE)
    this.parseToken(Token.L_PAREN)
    stmt.condition = this.parseExpression(Precedence.LOWEST)
    this.parseToken(Token.R_PAREN)
    stmt.body = this.parseStatement()
    return stmt
  }

  private parseContinueStatement(): ContinueStatement {
    this.parseToken(Token.CONTINUE)
    this.parseToken(Token.SEMICOLON)
    return new ContinueStatement()
  }

  private parseBreakStatement(): BreakStatement {
    this.parseToken(Token.BREAK)
    this.parseToken(Token.SEMICOLON)
    return new BreakStatement()
  }

  private parseReturnStatement(): ReturnStatement {
    const stmt = new ReturnStatement()
    this.parseToken(Token.RETURN)
    stmt.returnValue = this.parseExpression(Precedence.LOWEST)
    this.parseToken(Token.SEMICOLON)
    return stmt
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
    const expr = new IdentifierExpression()
    expr.symbol = this.parseIdentifier()
    return expr
  }

  private parseFunctionExpression(): FunctionExpression {
    const expr = new FunctionExpression()
    this.parseToken(Token.FUNC)
    this.parseToken(Token.L_PAREN)
    const parameters: LexerSymbol[] = []
    if (!this.currentTokenIs(Token.R_PAREN)) {
      parameters.push(this.parseIdentifier())
      while (this.currentTokenIs(Token.COMMA)) {
        this.parseToken(Token.COMMA)
        parameters.push(this.parseIdentifier())
      }
    }
    expr.parameters = parameters
    this.parseToken(Token.R_PAREN)
    expr.body = this.parseBlockStatement()
    return expr
  }

  private parseLiteralExpression(): LiteralExpression {
    const expr = new LiteralExpression()
    expr.symbol = { ...this.currentSymbol }
    switch (this.currentSymbol.token) {
      case Token.NULL:
        expr.value = null
        break
      case Token.TRUE:
      case Token.FALSE:
        expr.value = this.currentTokenIs(Token.TRUE)
        break
      case Token.NUMBER_LITERAL:
        expr.value = +this.currentSymbol.literal
        break
      case Token.STRING_LITERAL:
        expr.value = this.currentSymbol.literal
        break
      default:
        throw new ParseError(this.currentSymbol)
    }
    this.readNextSymbol()
    return expr
  }

  private parsePrefixExpression(): Expression {
    const expr = new PrefixExpression()
    expr.operator = { ...this.currentSymbol }
    this.readNextSymbol()
    expr.operand = this.parseExpression(Precedence.PREFIX)
    return expr
  }

  private parseInfixExpression(left: Expression): Expression {
    const expr = new InfixExpression()
    expr.leftOperand = left
    expr.operator = { ...this.currentSymbol }
    const precedence = this.currentPrecedence()
    this.readNextSymbol()
    expr.rightOperand = this.parseExpression(precedence)
    return expr
  }

  private parseGroupedExpression(): Expression {
    this.parseToken(Token.L_PAREN)
    const expr = this.parseExpression(Precedence.LOWEST)
    this.parseToken(Token.R_PAREN)
    return expr
  }

  private parseCallExpression(left: Expression): CallExpression {
    const expr = new CallExpression()
    expr.callable = left
    this.parseToken(Token.L_PAREN)
    const args: Expression[] = []
    if (!this.currentTokenIs(Token.R_PAREN)) {
      args.push(this.parseExpression(Precedence.LOWEST))
      while (this.currentTokenIs(Token.COMMA)) {
        this.parseToken(Token.COMMA)
        args.push(this.parseExpression(Precedence.LOWEST))
      }
    }
    expr.arguments = args
    this.parseToken(Token.R_PAREN)
    return expr
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

  private parseIdentifier(): LexerSymbol {
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
