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
  INDEX, // [
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
  [Token.L_BRACKET]: Precedence.INDEX,
} as Readonly<Record<Token, Precedence>>

const copySymbol = (symbol: LexicalSymbol): LexicalSymbol => {
  const { token, literal, start, end } = symbol
  return {
    token,
    literal,
    start: { ...start },
    end: { ...end },
  }
}

export class Parser {
  private curSymbol!: LexicalSymbol
  private peekSymbol!: LexicalSymbol
  private prefixParseFuncs = new Map<Token, () => Expression>()
  private infixParseFuncs = new Map<Token, (left: Expression) => Expression>()

  constructor(private lexer: Lexer) {
    // 初始化 curSymbol 和 peekSymbol
    this.readNextSymbol()
    this.readNextSymbol()

    this.registerExpressionParseFunctions()
  }

  private registerExpressionParseFunctions() {
    // prefix
    this.prefixParseFuncs.set(Token.IDENTIFIER, this.parseIdentifierExpression)
    this.prefixParseFuncs.set(Token.LET, this.parseLetExpression)
    this.prefixParseFuncs.set(Token.L_PAREN, this.parseGroupedExpression)
    this.prefixParseFuncs.set(Token.FUNC, this.parseFunctionExpression)
    this.prefixParseFuncs.set(Token.L_BRACKET, this.parseArrayExpression)
    this.prefixParseFuncs.set(Token.L_BRACE, this.parseHashExpression)

    this.prefixParseFuncs.set(Token.NULL, this.parseLiteralExpression)
    this.prefixParseFuncs.set(Token.TRUE, this.parseLiteralExpression)
    this.prefixParseFuncs.set(Token.FALSE, this.parseLiteralExpression)
    this.prefixParseFuncs.set(Token.NUMBER_LITERAL, this.parseLiteralExpression)
    this.prefixParseFuncs.set(Token.STRING_LITERAL, this.parseLiteralExpression)

    this.prefixParseFuncs.set(Token.PLUS, this.parsePrefixExpression)
    this.prefixParseFuncs.set(Token.MINUS, this.parsePrefixExpression)
    this.prefixParseFuncs.set(Token.NOT, this.parsePrefixExpression)
    this.prefixParseFuncs.set(Token.BIT_NOT, this.parsePrefixExpression)

    // infix
    this.infixParseFuncs.set(Token.ASSIGN, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.LOGIC_AND, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.LOGIC_OR, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.BIT_AND, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.BIT_OR, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.BIT_XOR, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.NOT_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.LESS_THAN, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.LESS_THAN_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.GREATER_THAN, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.GREATER_THAN_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.PLUS, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.MINUS, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.ASTERISK, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.SLASH, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.PERCENT, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.MULTIPLY_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.DIVIDE_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.MODULO_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.PLUS_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.MINUS_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.BIT_AND_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.BIT_OR_EQUAL, this.parseInfixExpression)
    this.infixParseFuncs.set(Token.BIT_XOR_EQUAL, this.parseInfixExpression)

    this.infixParseFuncs.set(Token.L_PAREN, this.parseCallExpression)
    this.infixParseFuncs.set(Token.L_BRACKET, this.parseIndexExpression)
  }

  parseProgram = (): Program => {
    const symbol = copySymbol(this.curSymbol)
    const statements: Statement[] = []
    while (!this.curTokenIs(Token.EOF)) {
      const statement = this.parseStatement()
      statements.push(statement)
      this.readNextSymbol()
    }
    return new Program(symbol, statements)
  }

  private parseStatement = (): Statement => {
    switch (this.curSymbol.token) {
      case Token.L_BRACE:
        return this.parseBlockStatement()
      case Token.SEMICOLON:
        return new EmptyStatement(copySymbol(this.curSymbol))
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

  private parseBlockStatement = (): BlockStatement => {
    const symbol = copySymbol(this.curSymbol)
    const statements: Statement[] = []
    while (!this.peekTokenIs(Token.R_BRACE)) {
      this.readNextSymbol()
      const statement = this.parseStatement()
      statements.push(statement)
    }
    if (!this.expectPeek(Token.R_BRACE)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.R_BRACE)
    }
    return new BlockStatement(symbol, statements)
  }

  private parseExpressionStatement = (): ExpressionStatement => {
    const symbol = copySymbol(this.curSymbol)
    const expression = this.parseExpression(Precedence.LOWEST)
    if (!this.expectPeek(Token.SEMICOLON)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.SEMICOLON)
    }
    return new ExpressionStatement(symbol, expression)
  }

  private parseLetStatement = (): LetStatement => {
    const symbol = copySymbol(this.curSymbol)
    const expression = this.parseLetExpression()
    if (!this.expectPeek(Token.SEMICOLON)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.SEMICOLON)
    }
    return new LetStatement(symbol, expression)
  }

  private parseFunctionStatement = (): FunctionStatement => {
    const symbol = copySymbol(this.curSymbol)

    this.readNextSymbol()
    const identifier = this.parseIdentifier()

    if (!this.expectPeek(Token.L_PAREN)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.L_PAREN)
    }

    const parameters: LexicalSymbol[] = []
    if (!this.peekTokenIs(Token.R_PAREN)) {
      this.readNextSymbol()
      parameters.push(this.parseIdentifier())

      while (this.peekTokenIs(Token.COMMA)) {
        this.readNextSymbol()

        this.readNextSymbol()
        parameters.push(this.parseIdentifier())
      }
    }
    if (!this.expectPeek(Token.R_PAREN)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.R_PAREN)
    }

    if (!this.expectPeek(Token.L_BRACE)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.L_BRACE)
    }
    const body = this.parseBlockStatement()
    return new FunctionStatement(symbol, identifier, parameters, body)
  }

  private parseIfStatement = (): IfStatement => {
    const symbol = copySymbol(this.curSymbol)

    if (!this.expectPeek(Token.L_PAREN)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.L_PAREN)
    }

    this.readNextSymbol()
    const condition = this.parseExpression(Precedence.LOWEST)

    if (!this.expectPeek(Token.R_PAREN)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.R_PAREN)
    }

    this.readNextSymbol()
    const consequence = this.parseStatement()

    let alternative: Statement | null = null
    if (this.peekTokenIs(Token.ELSE)) {
      this.readNextSymbol()

      this.readNextSymbol()
      alternative = this.parseStatement()
    }
    return new IfStatement(symbol, condition, consequence, alternative)
  }

  private parseForStatement = (): ForStatement => {
    const symbol = copySymbol(this.curSymbol)

    if (!this.expectPeek(Token.L_PAREN)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.L_PAREN)
    }

    let initialize: Expression | null = null
    let condition: Expression | null = null
    let afterEach: Expression | null = null
    if (!this.peekTokenIs(Token.SEMICOLON)) {
      this.readNextSymbol()
      initialize = this.parseExpression(Precedence.LOWEST)
    }
    if (!this.expectPeek(Token.SEMICOLON)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.SEMICOLON)
    }
    if (!this.peekTokenIs(Token.SEMICOLON)) {
      this.readNextSymbol()
      condition = this.parseExpression(Precedence.LOWEST)
    }
    if (!this.expectPeek(Token.SEMICOLON)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.SEMICOLON)
    }
    if (!this.peekTokenIs(Token.R_PAREN)) {
      this.readNextSymbol()
      afterEach = this.parseExpression(Precedence.LOWEST)
    }
    if (!this.expectPeek(Token.R_PAREN)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.R_PAREN)
    }
    this.readNextSymbol()
    const body = this.parseStatement()
    return new ForStatement(symbol, body, initialize, condition, afterEach)
  }

  private parseWhileStatement = (): WhileStatement => {
    const symbol = copySymbol(this.curSymbol)

    if (!this.expectPeek(Token.L_PAREN)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.L_PAREN)
    }

    this.readNextSymbol()
    const condition = this.parseExpression(Precedence.LOWEST)

    if (!this.expectPeek(Token.R_PAREN)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.R_PAREN)
    }

    this.readNextSymbol()
    const body = this.parseStatement()
    return new WhileStatement(symbol, condition, body)
  }

  private parseContinueStatement = (): ContinueStatement => {
    const symbol = copySymbol(this.curSymbol)
    if (!this.expectPeek(Token.SEMICOLON)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.SEMICOLON)
    }
    return new ContinueStatement(symbol)
  }

  private parseBreakStatement = (): BreakStatement => {
    const symbol = copySymbol(this.curSymbol)
    if (!this.expectPeek(Token.SEMICOLON)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.SEMICOLON)
    }
    return new BreakStatement(symbol)
  }

  private parseReturnStatement = (): ReturnStatement => {
    const symbol = copySymbol(this.curSymbol)
    let returnValue: Expression | null = null
    if (!this.peekTokenIs(Token.SEMICOLON)) {
      returnValue = this.parseExpression(Precedence.LOWEST)
    }
    if (!this.expectPeek(Token.SEMICOLON)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.SEMICOLON)
    }
    return new ReturnStatement(symbol, returnValue)
  }

  private parseExpression = (precedence: Precedence): Expression => {
    // Pratt parsing algorithm
    const prefixParseFunc = this.prefixParseFuncs.get(this.curSymbol.token)
    if (!prefixParseFunc) {
      throw new ParseError(this.curSymbol)
    }
    let leftExpr = prefixParseFunc()

    while (!this.peekTokenIs(Token.SEMICOLON) && precedence < this.peekPrecedence()) {
      const infixParseFunc = this.infixParseFuncs.get(this.peekSymbol.token)
      if (!infixParseFunc) {
        return leftExpr
      }
      this.readNextSymbol()
      leftExpr = infixParseFunc(leftExpr)
    }
    return leftExpr
  }

  private parseIdentifierExpression = (): IdentifierExpression => {
    const symbol = this.parseIdentifier()
    return new IdentifierExpression(symbol)
  }

  private parseFunctionExpression = (): FunctionExpression => {
    const symbol = copySymbol(this.curSymbol)

    if (!this.expectPeek(Token.L_PAREN)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.L_PAREN)
    }

    const parameters: IdentifierExpression[] = []
    if (!this.peekTokenIs(Token.R_PAREN)) {
      this.readNextSymbol()
      parameters.push(this.parseIdentifierExpression())

      while (this.peekTokenIs(Token.COMMA)) {
        this.readNextSymbol()

        this.readNextSymbol()
        parameters.push(this.parseIdentifierExpression())
      }
    }

    if (!this.expectPeek(Token.R_PAREN)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.R_PAREN)
    }

    if (!this.expectPeek(Token.L_BRACE)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.L_BRACE)
    }
    const body = this.parseBlockStatement()
    return new FunctionExpression(symbol, parameters, body)
  }

  private parseLiteralExpression = (): LiteralExpression => {
    const symbol = copySymbol(this.curSymbol)

    let value: unknown
    switch (this.curSymbol.token) {
      case Token.NULL:
        value = null
        break
      case Token.TRUE:
      case Token.FALSE:
        value = this.curTokenIs(Token.TRUE)
        break
      case Token.NUMBER_LITERAL:
        value = +this.curSymbol.literal
        break
      case Token.STRING_LITERAL:
        // TODO escape character
        value = this.curSymbol.literal.slice(1, -1)
        break
      default:
        throw new ParseError(this.curSymbol)
    }

    return new LiteralExpression(symbol, value)
  }

  private parsePrefixExpression = (): PrefixExpression => {
    const symbol = copySymbol(this.curSymbol)
    const operator = copySymbol(this.curSymbol)

    this.readNextSymbol()
    const operand = this.parseExpression(Precedence.PREFIX)

    return new PrefixExpression(symbol, operator, operand)
  }

  private parseInfixExpression = (left: Expression): InfixExpression => {
    const symbol = copySymbol(this.curSymbol)
    const operator = copySymbol(this.curSymbol)
    const precedence = this.curPrecedence()

    this.readNextSymbol()
    const right = this.parseExpression(precedence)

    return new InfixExpression(symbol, operator, left, right)
  }

  private parseVariableDeclaration(): VariableDeclaration {
    const symbol = copySymbol(this.curSymbol)

    const identifier = this.parseIdentifier()

    let value: Expression | null = null
    if (this.peekTokenIs(Token.ASSIGN)) {
      this.readNextSymbol()

      this.readNextSymbol()
      value = this.parseExpression(Precedence.LOWEST)
    } else {
      value = null
    }
    return new VariableDeclaration(symbol, identifier, value)
  }

  private parseLetExpression = (): LetExpression => {
    const symbol = copySymbol(this.curSymbol)
    const arr: VariableDeclaration[] = []

    this.readNextSymbol()
    arr.push(this.parseVariableDeclaration())

    while (this.peekTokenIs(Token.COMMA)) {
      this.readNextSymbol()

      this.readNextSymbol()
      arr.push(this.parseVariableDeclaration())
    }
    return new LetExpression(symbol, arr)
  }

  private parseGroupedExpression = (): Expression => {
    this.readNextSymbol()
    const expr = this.parseExpression(Precedence.LOWEST)

    if (!this.expectPeek(Token.R_PAREN)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.R_PAREN)
    }
    return expr
  }

  private parseCallExpression = (left: Expression): CallExpression => {
    const symbol = copySymbol(this.curSymbol)
    const callable = left
    const args: Expression[] = []
    if (!this.peekTokenIs(Token.R_PAREN)) {
      this.readNextSymbol()
      args.push(this.parseExpression(Precedence.LOWEST))

      while (this.peekTokenIs(Token.COMMA)) {
        this.readNextSymbol()

        this.readNextSymbol()
        args.push(this.parseExpression(Precedence.LOWEST))
      }
    }
    if (!this.expectPeek(Token.R_PAREN)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.R_PAREN)
    }
    return new CallExpression(symbol, callable, args)
  }

  private parseArrayExpression = (): ArrayExpression => {
    const symbol = copySymbol(this.curSymbol)
    const elements: Expression[] = []
    if (!this.peekTokenIs(Token.R_BRACKET)) {
      this.readNextSymbol()
      elements.push(this.parseExpression(Precedence.LOWEST))

      while (this.peekTokenIs(Token.COMMA)) {
        this.readNextSymbol()

        this.readNextSymbol()
        elements.push(this.parseExpression(Precedence.LOWEST))
      }
    }
    if (!this.expectPeek(Token.R_BRACKET)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.R_BRACKET)
    }
    return new ArrayExpression(symbol, elements)
  }

  private parseKeyValue = (): KeyValue => {
    const symbol = copySymbol(this.curSymbol)

    if (!this.curTokenIs(Token.STRING_LITERAL)) {
      throw new UnexpectedTokenError(this.curSymbol, Token.STRING_LITERAL)
    }
    const key = this.parseLiteralExpression()

    if (!this.expectPeek(Token.COLON)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.COLON)
    }

    this.readNextSymbol()
    const value = this.parseExpression(Precedence.LOWEST)
    return new KeyValue(symbol, key, value)
  }

  private parseHashExpression = (): HashExpression => {
    const symbol = copySymbol(this.curSymbol)
    const keyValues: KeyValue[] = []
    if (!this.peekTokenIs(Token.R_BRACE)) {
      this.readNextSymbol()
      keyValues.push(this.parseKeyValue())

      while (this.peekTokenIs(Token.COMMA)) {
        this.readNextSymbol()

        this.readNextSymbol()
        keyValues.push(this.parseKeyValue())
      }
    }
    if (!this.expectPeek(Token.R_BRACE)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.R_BRACE)
    }
    return new HashExpression(symbol, keyValues)
  }

  private parseIndexExpression = (left: Expression): InfixExpression => {
    const indexable = left
    const symbol = copySymbol(this.curSymbol)
    const operator = copySymbol(this.curSymbol)

    this.readNextSymbol()
    const index = this.parseExpression(Precedence.LOWEST)

    if (!this.expectPeek(Token.R_BRACKET)) {
      throw new UnexpectedTokenError(this.peekSymbol, Token.R_BRACKET)
    }
    return new InfixExpression(symbol, operator, indexable, index)
  }

  private readNextSymbol = () => {
    this.curSymbol = this.peekSymbol
    this.peekSymbol = this.lexer.nextSymbol()
  }

  private expectPeek = (token: Token): boolean => {
    if (this.peekTokenIs(token)) {
      this.readNextSymbol()
      return true
    } else {
      return false
    }
  }

  private parseIdentifier = (): LexicalSymbol => {
    if (this.curSymbol.token !== Token.IDENTIFIER) {
      throw new UnexpectedTokenError(this.curSymbol, Token.IDENTIFIER)
    }
    return copySymbol(this.curSymbol)
  }

  private curTokenIs = (token: Token): boolean => {
    return this.curSymbol.token === token
  }

  private peekTokenIs = (token: Token): boolean => {
    return this.peekSymbol.token === token
  }

  private curPrecedence = (): Precedence => {
    return precedences[this.curSymbol.token] ?? Precedence.LOWEST
  }

  private peekPrecedence = (): Precedence => {
    return precedences[this.peekSymbol.token] ?? Precedence.LOWEST
  }
}
