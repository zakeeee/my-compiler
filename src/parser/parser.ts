import {
  ArrayExpression,
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
  HashExpression,
  IdentifierExpression,
  IfStatement,
  InfixExpression,
  KeyValue,
  LetExpression,
  LetStatement,
  LiteralExpression,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  VariableDeclaration,
  WhileStatement,
} from 'src/ast'
import { getTokenName, Lexer, Token, TokenType } from 'src/lexer'

class ParseError extends Error {
  name = 'ParseError'
  constructor(message?: string) {
    super(message)
  }
}

function parseError(message: string, token: Token) {
  const { start } = token
  console.log(`parse error at [${start.line}:${start.column}]: ${message}`)
  return new ParseError(message)
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
  INDEX, // [
}

const precedences = {
  [TokenType.STAR_EQUAL]: Precedence.ASSIGNMENT_OP,
  [TokenType.SLASH_EQUAL]: Precedence.ASSIGNMENT_OP,
  [TokenType.PERCENT_EQUAL]: Precedence.ASSIGNMENT_OP,
  [TokenType.PLUS_EQUAL]: Precedence.ASSIGNMENT_OP,
  [TokenType.MINUS_EQUAL]: Precedence.ASSIGNMENT_OP,
  [TokenType.BIT_AND_EQUAL]: Precedence.ASSIGNMENT_OP,
  [TokenType.BIT_OR_EQUAL]: Precedence.ASSIGNMENT_OP,
  [TokenType.BIT_XOR_EQUAL]: Precedence.ASSIGNMENT_OP,
  [TokenType.ASSIGN]: Precedence.ASSIGN,
  [TokenType.LOGIC_AND]: Precedence.LOGIC_OP,
  [TokenType.LOGIC_OR]: Precedence.LOGIC_OP,
  [TokenType.BIT_AND]: Precedence.BIT_OP,
  [TokenType.BIT_OR]: Precedence.BIT_OP,
  [TokenType.BIT_XOR]: Precedence.BIT_OP,
  [TokenType.EQUAL]: Precedence.EQUAL,
  [TokenType.BANG_EQUAL]: Precedence.EQUAL,
  [TokenType.LESS_THAN]: Precedence.COMPARE,
  [TokenType.LESS_THAN_EQUAL]: Precedence.COMPARE,
  [TokenType.GREATER_THAN]: Precedence.COMPARE,
  [TokenType.GREATER_THAN_EQUAL]: Precedence.COMPARE,
  [TokenType.PLUS]: Precedence.SUM,
  [TokenType.MINUS]: Precedence.SUM,
  [TokenType.STAR]: Precedence.PRODUCT,
  [TokenType.SLASH]: Precedence.PRODUCT,
  [TokenType.PERCENT]: Precedence.PRODUCT,
  [TokenType.L_PAREN]: Precedence.CALL,
  [TokenType.L_BRACKET]: Precedence.INDEX,
} as Readonly<Record<TokenType, Precedence>>

const copyToken = (token: Token): Token => {
  const { type, lexeme, start, end } = token
  return new Token(type, lexeme, { ...start }, { ...end })
}

export class Parser {
  private curToken!: Token
  private peekToken!: Token
  private prefixParseFuncs = new Map<TokenType, () => Expression>()
  private infixParseFuncs = new Map<TokenType, (left: Expression) => Expression>()
  private _hasError = false

  get hasError() {
    return this._hasError
  }

  constructor(private lexer: Lexer) {
    // 初始化 curToken 和 peekToken
    this.readNextToken()
    this.readNextToken()

    this.registerExpressionParseFunctions()
  }

  private synchronize() {
    // Panic mode
    while (!this.curTokenIs(TokenType.EOF)) {
      if (this.curTokenIs(TokenType.SEMICOLON)) {
        return
      }

      switch (this.peekToken.type) {
        case TokenType.LET:
        case TokenType.FUNC:
        case TokenType.IF:
        case TokenType.FOR:
        case TokenType.WHILE:
          return
      }

      this.readNextToken()
    }
  }

  private registerExpressionParseFunctions() {
    // prefix
    this.prefixParseFuncs.set(TokenType.IDENTIFIER, this.parseIdentifierExpression)
    this.prefixParseFuncs.set(TokenType.LET, this.parseLetExpression)
    this.prefixParseFuncs.set(TokenType.L_PAREN, this.parseGroupedExpression)
    this.prefixParseFuncs.set(TokenType.FUNC, this.parseFunctionExpression)
    this.prefixParseFuncs.set(TokenType.L_BRACKET, this.parseArrayExpression)
    this.prefixParseFuncs.set(TokenType.L_BRACE, this.parseHashExpression)

    this.prefixParseFuncs.set(TokenType.NULL, this.parseLiteralExpression)
    this.prefixParseFuncs.set(TokenType.TRUE, this.parseLiteralExpression)
    this.prefixParseFuncs.set(TokenType.FALSE, this.parseLiteralExpression)
    this.prefixParseFuncs.set(TokenType.NUMBER_LITERAL, this.parseLiteralExpression)
    this.prefixParseFuncs.set(TokenType.STRING_LITERAL, this.parseLiteralExpression)

    this.prefixParseFuncs.set(TokenType.PLUS, this.parsePrefixExpression)
    this.prefixParseFuncs.set(TokenType.MINUS, this.parsePrefixExpression)
    this.prefixParseFuncs.set(TokenType.BANG, this.parsePrefixExpression)
    this.prefixParseFuncs.set(TokenType.BIT_NOT, this.parsePrefixExpression)

    // infix
    this.infixParseFuncs.set(TokenType.ASSIGN, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.LOGIC_AND, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.LOGIC_OR, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.BIT_AND, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.BIT_OR, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.BIT_XOR, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.BANG_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.LESS_THAN, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.LESS_THAN_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.GREATER_THAN, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.GREATER_THAN_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.PLUS, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.MINUS, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.STAR, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.SLASH, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.PERCENT, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.STAR_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.SLASH_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.PERCENT_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.PLUS_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.MINUS_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.BIT_AND_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.BIT_OR_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(TokenType.BIT_XOR_EQUAL, this.parseInfixExpression)

    this.infixParseFuncs.set(TokenType.L_PAREN, this.parseCallExpression)
    this.infixParseFuncs.set(TokenType.L_BRACKET, this.parseIndexExpression)
  }

  parse = (): Program | null => {
    const program = this.parseProgram()
    if (this.hasError) {
      return null
    }
    return program
  }

  private parseProgram = (): Program => {
    this._hasError = false
    const token = copyToken(this.curToken)
    const statements: Statement[] = []
    while (!this.curTokenIs(TokenType.EOF)) {
      try {
        const statement = this.parseStatement()
        statements.push(statement)
      } catch (error) {
        this._hasError = true
        this.synchronize()
      }
      this.readNextToken()
    }
    return new Program(token, statements)
  }

  private parseStatement = (): Statement => {
    switch (this.curToken.type) {
      case TokenType.L_BRACE:
        return this.parseBlockStatement()
      case TokenType.SEMICOLON:
        return new EmptyStatement(copyToken(this.curToken))
      case TokenType.LET:
        return this.parseLetStatement()
      case TokenType.FUNC:
        return this.parseFunctionStatement()
      case TokenType.IF:
        return this.parseIfStatement()
      case TokenType.FOR:
        return this.parseForStatement()
      case TokenType.WHILE:
        return this.parseWhileStatement()
      case TokenType.CONTINUE:
        return this.parseContinueStatement()
      case TokenType.BREAK:
        return this.parseBreakStatement()
      case TokenType.RETURN:
        return this.parseReturnStatement()
      default:
        return this.parseExpressionStatement()
    }
  }

  private parseBlockStatement = (): BlockStatement => {
    const token = copyToken(this.curToken)
    const statements: Statement[] = []
    while (!this.peekTokenIs(TokenType.R_BRACE)) {
      this.readNextToken()
      try {
        const statement = this.parseStatement()
        statements.push(statement)
      } catch (error) {
        this._hasError = true
        this.synchronize()
      }
    }
    this.expectPeek(TokenType.R_BRACE)
    return new BlockStatement(token, statements)
  }

  private parseExpressionStatement = (): ExpressionStatement => {
    const token = copyToken(this.curToken)
    const expression = this.parseExpression(Precedence.LOWEST)
    this.expectPeek(TokenType.SEMICOLON)
    return new ExpressionStatement(token, expression)
  }

  private parseLetStatement = (): LetStatement => {
    const token = copyToken(this.curToken)
    const expression = this.parseLetExpression()
    this.expectPeek(TokenType.SEMICOLON)
    return new LetStatement(token, expression)
  }

  private parseFunctionStatement = (): FunctionStatement => {
    const token = copyToken(this.curToken)

    this.readNextToken()
    const identifier = this.parseIdentifier()

    this.expectPeek(TokenType.L_PAREN)

    const parameters: Token[] = []
    if (!this.peekTokenIs(TokenType.R_PAREN)) {
      this.readNextToken()
      parameters.push(this.parseIdentifier())

      while (this.peekTokenIs(TokenType.COMMA)) {
        this.readNextToken()

        this.readNextToken()
        parameters.push(this.parseIdentifier())
      }
    }
    this.expectPeek(TokenType.R_PAREN)

    this.expectPeek(TokenType.L_BRACE)
    const body = this.parseBlockStatement()
    return new FunctionStatement(token, identifier, parameters, body)
  }

  private parseIfStatement = (): IfStatement => {
    const token = copyToken(this.curToken)

    this.expectPeek(TokenType.L_PAREN)

    this.readNextToken()
    const condition = this.parseExpression(Precedence.LOWEST)

    this.expectPeek(TokenType.R_PAREN)

    this.readNextToken()
    const consequence = this.parseStatement()

    let alternative: Statement | null = null
    if (this.peekTokenIs(TokenType.ELSE)) {
      this.readNextToken()

      this.readNextToken()
      alternative = this.parseStatement()
    }
    return new IfStatement(token, condition, consequence, alternative)
  }

  private parseForStatement = (): ForStatement => {
    const token = copyToken(this.curToken)

    this.expectPeek(TokenType.L_PAREN)

    let initialize: Expression | null = null
    let condition: Expression | null = null
    let afterEach: Expression | null = null
    if (!this.peekTokenIs(TokenType.SEMICOLON)) {
      this.readNextToken()
      initialize = this.parseExpression(Precedence.LOWEST)
    }
    this.expectPeek(TokenType.SEMICOLON)
    if (!this.peekTokenIs(TokenType.SEMICOLON)) {
      this.readNextToken()
      condition = this.parseExpression(Precedence.LOWEST)
    }
    this.expectPeek(TokenType.SEMICOLON)
    if (!this.peekTokenIs(TokenType.R_PAREN)) {
      this.readNextToken()
      afterEach = this.parseExpression(Precedence.LOWEST)
    }
    this.expectPeek(TokenType.R_PAREN)
    this.readNextToken()
    const body = this.parseStatement()
    return new ForStatement(token, body, initialize, condition, afterEach)
  }

  private parseWhileStatement = (): WhileStatement => {
    const token = copyToken(this.curToken)

    this.expectPeek(TokenType.L_PAREN)

    this.readNextToken()
    const condition = this.parseExpression(Precedence.LOWEST)

    this.expectPeek(TokenType.R_PAREN)

    this.readNextToken()
    const body = this.parseStatement()
    return new WhileStatement(token, condition, body)
  }

  private parseContinueStatement = (): ContinueStatement => {
    const token = copyToken(this.curToken)
    this.expectPeek(TokenType.SEMICOLON)
    return new ContinueStatement(token)
  }

  private parseBreakStatement = (): BreakStatement => {
    const token = copyToken(this.curToken)
    this.expectPeek(TokenType.SEMICOLON)
    return new BreakStatement(token)
  }

  private parseReturnStatement = (): ReturnStatement => {
    const token = copyToken(this.curToken)
    let returnValue: Expression | null = null
    if (!this.peekTokenIs(TokenType.SEMICOLON)) {
      this.readNextToken()
      returnValue = this.parseExpression(Precedence.LOWEST)
    }
    this.expectPeek(TokenType.SEMICOLON)
    return new ReturnStatement(token, returnValue)
  }

  private parseExpression = (precedence: Precedence): Expression => {
    // Pratt parsing algorithm
    const prefixParseFunc = this.prefixParseFuncs.get(this.curToken.type)
    if (!prefixParseFunc) {
      throw parseError(
        `cannot parse token of type "${getTokenName(this.curToken.type)}"`,
        this.curToken
      )
    }
    let leftExpr = prefixParseFunc()

    while (!this.peekTokenIs(TokenType.SEMICOLON) && precedence < this.peekPrecedence()) {
      const infixParseFunc = this.infixParseFuncs.get(this.peekToken.type)
      if (!infixParseFunc) {
        return leftExpr
      }
      this.readNextToken()
      leftExpr = infixParseFunc(leftExpr)
    }
    return leftExpr
  }

  private parseIdentifierExpression = (): IdentifierExpression => {
    const token = this.parseIdentifier()
    return new IdentifierExpression(token)
  }

  private parseFunctionExpression = (): FunctionExpression => {
    const token = copyToken(this.curToken)

    this.expectPeek(TokenType.L_PAREN)
    const parameters: IdentifierExpression[] = []
    if (!this.peekTokenIs(TokenType.R_PAREN)) {
      this.readNextToken()
      parameters.push(this.parseIdentifierExpression())

      while (this.peekTokenIs(TokenType.COMMA)) {
        this.readNextToken()

        this.readNextToken()
        parameters.push(this.parseIdentifierExpression())
      }
    }
    this.expectPeek(TokenType.R_PAREN)

    this.expectPeek(TokenType.L_BRACE)
    const body = this.parseBlockStatement()
    return new FunctionExpression(token, parameters, body)
  }

  private parseLiteralExpression = (): LiteralExpression => {
    const token = copyToken(this.curToken)

    let value: unknown
    switch (this.curToken.type) {
      case TokenType.NULL:
        value = null
        break
      case TokenType.TRUE:
      case TokenType.FALSE:
        value = this.curTokenIs(TokenType.TRUE)
        break
      case TokenType.NUMBER_LITERAL:
        value = +this.curToken.lexeme
        break
      case TokenType.STRING_LITERAL:
        // TODO escape character
        value = this.curToken.lexeme.slice(1, -1)
        break
      default:
        throw parseError(
          `cannot parse literal of type "${getTokenName(this.curToken.type)}"`,
          this.curToken
        )
    }

    return new LiteralExpression(token, value)
  }

  private parsePrefixExpression = (): PrefixExpression => {
    const token = copyToken(this.curToken)
    const operator = copyToken(this.curToken)

    this.readNextToken()
    const operand = this.parseExpression(Precedence.PREFIX)

    return new PrefixExpression(token, operator, operand)
  }

  private parseInfixExpression = (left: Expression): InfixExpression => {
    const token = copyToken(this.curToken)
    const operator = copyToken(this.curToken)
    const precedence = this.curPrecedence()

    this.readNextToken()
    const right = this.parseExpression(precedence)

    return new InfixExpression(token, operator, left, right)
  }

  private parseVariableDeclaration(): VariableDeclaration {
    const token = copyToken(this.curToken)

    const identifier = this.parseIdentifier()

    let value: Expression | null = null
    if (this.peekTokenIs(TokenType.ASSIGN)) {
      this.readNextToken()

      this.readNextToken()
      value = this.parseExpression(Precedence.LOWEST)
    } else {
      value = null
    }
    return new VariableDeclaration(token, identifier, value)
  }

  private parseLetExpression = (): LetExpression => {
    const token = copyToken(this.curToken)
    const arr: VariableDeclaration[] = []

    this.readNextToken()
    arr.push(this.parseVariableDeclaration())

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.readNextToken()

      this.readNextToken()
      arr.push(this.parseVariableDeclaration())
    }
    return new LetExpression(token, arr)
  }

  private parseGroupedExpression = (): Expression => {
    this.readNextToken()
    const expr = this.parseExpression(Precedence.LOWEST)

    this.expectPeek(TokenType.R_PAREN)
    return expr
  }

  private parseCallExpression = (left: Expression): CallExpression => {
    const token = copyToken(this.curToken)
    const callable = left
    const args: Expression[] = []
    if (!this.peekTokenIs(TokenType.R_PAREN)) {
      this.readNextToken()
      args.push(this.parseExpression(Precedence.LOWEST))

      while (this.peekTokenIs(TokenType.COMMA)) {
        this.readNextToken()

        this.readNextToken()
        args.push(this.parseExpression(Precedence.LOWEST))
      }
    }
    this.expectPeek(TokenType.R_PAREN)
    return new CallExpression(token, callable, args)
  }

  private parseArrayExpression = (): ArrayExpression => {
    const token = copyToken(this.curToken)
    const elements: Expression[] = []
    if (!this.peekTokenIs(TokenType.R_BRACKET)) {
      this.readNextToken()
      elements.push(this.parseExpression(Precedence.LOWEST))

      while (this.peekTokenIs(TokenType.COMMA)) {
        this.readNextToken()

        this.readNextToken()
        elements.push(this.parseExpression(Precedence.LOWEST))
      }
    }
    this.expectPeek(TokenType.R_BRACKET)
    return new ArrayExpression(token, elements)
  }

  private parseKeyValue = (): KeyValue => {
    const token = copyToken(this.curToken)

    if (!this.curTokenIs(TokenType.STRING_LITERAL)) {
      throw parseError(
        `expect token "${getTokenName(TokenType.STRING_LITERAL)}", got "${getTokenName(
          this.curToken.type
        )}"`,
        this.peekToken
      )
    }
    const key = this.parseLiteralExpression()

    this.expectPeek(TokenType.COLON)

    this.readNextToken()
    const value = this.parseExpression(Precedence.LOWEST)
    return new KeyValue(token, key, value)
  }

  private parseHashExpression = (): HashExpression => {
    const token = copyToken(this.curToken)
    const keyValues: KeyValue[] = []
    if (!this.peekTokenIs(TokenType.R_BRACE)) {
      this.readNextToken()
      keyValues.push(this.parseKeyValue())

      while (this.peekTokenIs(TokenType.COMMA)) {
        this.readNextToken()

        this.readNextToken()
        keyValues.push(this.parseKeyValue())
      }
    }
    this.expectPeek(TokenType.R_BRACE)
    return new HashExpression(token, keyValues)
  }

  private parseIndexExpression = (left: Expression): InfixExpression => {
    const indexable = left
    const token = copyToken(this.curToken)
    const operator = copyToken(this.curToken)

    this.readNextToken()
    const index = this.parseExpression(Precedence.LOWEST)

    this.expectPeek(TokenType.R_BRACKET)
    return new InfixExpression(token, operator, indexable, index)
  }

  private readNextToken = () => {
    this.curToken = this.peekToken
    this.peekToken = this.lexer.nextToken()
  }

  private expectPeek = (tokenType: TokenType) => {
    if (this.peekTokenIs(tokenType)) {
      this.readNextToken()
    } else {
      throw parseError(
        `expect token "${getTokenName(tokenType)}", got "${getTokenName(this.peekToken.type)}"`,
        this.peekToken
      )
    }
  }

  private parseIdentifier = (): Token => {
    if (this.curToken.type !== TokenType.IDENTIFIER) {
      throw parseError(
        `expect token "${getTokenName(TokenType.IDENTIFIER)}", got "${getTokenName(
          this.curToken.type
        )}"`,
        this.peekToken
      )
    }
    return copyToken(this.curToken)
  }

  private curTokenIs = (tokenType: TokenType): boolean => {
    return this.curToken.type === tokenType
  }

  private peekTokenIs = (tokenType: TokenType): boolean => {
    return this.peekToken.type === tokenType
  }

  private curPrecedence = (): Precedence => {
    return precedences[this.curToken.type] ?? Precedence.LOWEST
  }

  private peekPrecedence = (): Precedence => {
    return precedences[this.peekToken.type] ?? Precedence.LOWEST
  }
}
