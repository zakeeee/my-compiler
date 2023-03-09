import {
  ArrayLiteralExpression,
  AssignmentExpression,
  BlockStatement,
  BreakStatement,
  CallExpression,
  ClassStatement,
  ContinueStatement,
  EmptyStatement,
  Expression,
  ExpressionStatement,
  ForStatement,
  FunctionExpression,
  FunctionStatement,
  GetPropertyExpression,
  HashLiteralExpression,
  IdentifierExpression,
  IfStatement,
  IndexExpression,
  InfixExpression,
  LetExpression,
  LetStatement,
  LiteralExpression,
  MethodStatement,
  NewExpression,
  PrefixExpression,
  Program,
  ReturnStatement,
  Statement,
  ThisExpression,
  WhileStatement,
} from 'src/ast';
import { getTokenName, Lexer, Token, TokenType } from 'src/lexer';
import { getLiteralValue } from 'src/utils';

class SyntaxError extends Error {
  name = 'SyntaxError';

  constructor(message?: string) {
    super(message);
  }
}

function syntaxError(message: string, token: Token) {
  const { start } = token;
  console.log(`syntax error at [${start.line}:${start.column}]: ${message}`);
  return new SyntaxError(message);
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
  MEMBER_ACCESS, // .
  CALL_OR_INDEX, // (, [
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
  [TokenType.DOT]: Precedence.MEMBER_ACCESS,
  [TokenType.L_PAREN]: Precedence.CALL_OR_INDEX,
  [TokenType.L_BRACKET]: Precedence.CALL_OR_INDEX,
} as Readonly<Record<TokenType, Precedence>>;

const copyToken = (token: Token): Token => {
  const { type, lexeme, start, end } = token;
  return new Token(type, lexeme, { ...start }, { ...end });
};

export class Parser {
  private curToken!: Token;
  private peekToken!: Token;
  private prefixParseFuncs = new Map<TokenType, () => Expression>();
  private infixParseFuncs = new Map<TokenType, (left: Expression) => Expression>();
  private _hasError = false;

  constructor(private lexer: Lexer) {
    // 初始化 curToken 和 peekToken
    this.advance();
    this.advance();

    this.registerExpressionParseFunctions();
  }

  get hasError() {
    return this._hasError;
  }

  parse = (): Program | null => {
    this._hasError = false;
    const program = this.parseProgram();
    if (this.hasError) {
      return null;
    }
    return program;
  };

  private synchronize() {
    // Panic mode
    while (!this.curTokenIs(TokenType.EOF)) {
      if (this.curTokenIs(TokenType.SEMICOLON)) {
        return;
      }

      switch (this.peekToken.type) {
        case TokenType.LET:
        case TokenType.FUNC:
        case TokenType.IF:
        case TokenType.FOR:
        case TokenType.WHILE:
        case TokenType.R_BRACE:
          return;
      }

      this.advance();
    }
  }

  private registerExpressionParseFunctions() {
    // prefix
    this.prefixParseFuncs.set(TokenType.IDENTIFIER, this.parseIdentifierExpression);
    this.prefixParseFuncs.set(TokenType.LET, this.parseLetExpression);
    this.prefixParseFuncs.set(TokenType.L_PAREN, this.parseGroupedExpression);
    this.prefixParseFuncs.set(TokenType.FUNC, this.parseFunctionExpression);
    this.prefixParseFuncs.set(TokenType.L_BRACKET, this.parseArrayExpression);
    this.prefixParseFuncs.set(TokenType.L_BRACE, this.parseHashExpression);
    this.prefixParseFuncs.set(TokenType.NEW, this.parseNewExpression);
    this.prefixParseFuncs.set(TokenType.THIS, this.parseThisExpression);

    this.prefixParseFuncs.set(TokenType.NULL, this.parseLiteralExpression);
    this.prefixParseFuncs.set(TokenType.TRUE, this.parseLiteralExpression);
    this.prefixParseFuncs.set(TokenType.FALSE, this.parseLiteralExpression);
    this.prefixParseFuncs.set(TokenType.NUMBER_LITERAL, this.parseLiteralExpression);
    this.prefixParseFuncs.set(TokenType.STRING_LITERAL, this.parseLiteralExpression);

    this.prefixParseFuncs.set(TokenType.PLUS, this.parsePrefixExpression);
    this.prefixParseFuncs.set(TokenType.MINUS, this.parsePrefixExpression);
    this.prefixParseFuncs.set(TokenType.BANG, this.parsePrefixExpression);
    this.prefixParseFuncs.set(TokenType.BIT_NOT, this.parsePrefixExpression);

    // infix
    this.infixParseFuncs.set(TokenType.LOGIC_AND, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.LOGIC_OR, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.BIT_AND, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.BIT_OR, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.BIT_XOR, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.EQUAL, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.BANG_EQUAL, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.LESS_THAN, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.LESS_THAN_EQUAL, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.GREATER_THAN, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.GREATER_THAN_EQUAL, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.PLUS, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.MINUS, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.STAR, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.SLASH, this.parseInfixExpression);
    this.infixParseFuncs.set(TokenType.PERCENT, this.parseInfixExpression);

    this.infixParseFuncs.set(TokenType.ASSIGN, this.parseAssignmentExpression);
    this.infixParseFuncs.set(TokenType.STAR_EQUAL, this.parseAssignmentExpression);
    this.infixParseFuncs.set(TokenType.SLASH_EQUAL, this.parseAssignmentExpression);
    this.infixParseFuncs.set(TokenType.PERCENT_EQUAL, this.parseAssignmentExpression);
    this.infixParseFuncs.set(TokenType.PLUS_EQUAL, this.parseAssignmentExpression);
    this.infixParseFuncs.set(TokenType.MINUS_EQUAL, this.parseAssignmentExpression);
    this.infixParseFuncs.set(TokenType.BIT_AND_EQUAL, this.parseAssignmentExpression);
    this.infixParseFuncs.set(TokenType.BIT_OR_EQUAL, this.parseAssignmentExpression);
    this.infixParseFuncs.set(TokenType.BIT_XOR_EQUAL, this.parseAssignmentExpression);

    this.infixParseFuncs.set(TokenType.DOT, this.parseGetPropertyExpression);
    this.infixParseFuncs.set(TokenType.L_PAREN, this.parseCallExpression);
    this.infixParseFuncs.set(TokenType.L_BRACKET, this.parseIndexExpression);
  }

  private parseProgram = (): Program => {
    const token = copyToken(this.curToken);

    const statements: Statement[] = [];
    while (!this.curTokenIs(TokenType.EOF)) {
      try {
        const statement = this.parseStatement();
        statements.push(statement);
      } catch (error) {
        this._hasError = true;
        this.synchronize();
      }
      this.advance();
    }

    return new Program(token, statements);
  };

  private parseStatement = (): Statement => {
    switch (this.curToken.type) {
      case TokenType.L_BRACE:
        return this.parseBlockStatement();
      case TokenType.SEMICOLON:
        return new EmptyStatement(copyToken(this.curToken));
      case TokenType.LET:
        return this.parseLetStatement();
      case TokenType.FUNC:
        return this.parseFunctionStatement();
      case TokenType.IF:
        return this.parseIfStatement();
      case TokenType.FOR:
        return this.parseForStatement();
      case TokenType.WHILE:
        return this.parseWhileStatement();
      case TokenType.CONTINUE:
        return this.parseContinueStatement();
      case TokenType.BREAK:
        return this.parseBreakStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      case TokenType.CLASS:
        return this.parseClassStatement();
      default:
        return this.parseExpressionStatement();
    }
  };

  private parseBlockStatement = (): BlockStatement => {
    const token = copyToken(this.curToken);
    const statements: Statement[] = [];
    while (!this.peekTokenIs(TokenType.R_BRACE, TokenType.EOF)) {
      this.advance();
      try {
        const statement = this.parseStatement();
        statements.push(statement);
      } catch (error) {
        this._hasError = true;
        this.synchronize();
      }
    }
    this.expectPeek(TokenType.R_BRACE);
    return new BlockStatement(token, statements);
  };

  private parseExpressionStatement = (): ExpressionStatement => {
    const token = copyToken(this.curToken);
    const expression = this.parseExpression(Precedence.LOWEST);
    this.expectPeek(TokenType.SEMICOLON);
    return new ExpressionStatement(token, expression);
  };

  private parseLetStatement = (): LetStatement => {
    const token = copyToken(this.curToken);
    const expression = this.parseLetExpression();
    this.expectPeek(TokenType.SEMICOLON);
    return new LetStatement(token, expression);
  };

  private parseIfStatement = (): IfStatement => {
    const token = copyToken(this.curToken);

    this.expectPeek(TokenType.L_PAREN);

    this.advance();
    const condition = this.parseExpression(Precedence.LOWEST);

    this.expectPeek(TokenType.R_PAREN);

    this.advance();
    const consequence = this.parseStatement();

    let alternative: Statement | null = null;
    if (this.peekTokenIs(TokenType.ELSE)) {
      this.advance();

      this.advance();
      alternative = this.parseStatement();
    }
    return new IfStatement(token, condition, consequence, alternative);
  };

  private parseForStatement = (): ForStatement => {
    const token = copyToken(this.curToken);

    this.expectPeek(TokenType.L_PAREN);

    let initialize: Expression | null = null;
    let condition: Expression | null = null;
    let afterEach: Expression | null = null;
    if (!this.peekTokenIs(TokenType.SEMICOLON)) {
      this.advance();
      initialize = this.parseExpression(Precedence.LOWEST);
    }
    this.expectPeek(TokenType.SEMICOLON);
    if (!this.peekTokenIs(TokenType.SEMICOLON)) {
      this.advance();
      condition = this.parseExpression(Precedence.LOWEST);
    }
    this.expectPeek(TokenType.SEMICOLON);
    if (!this.peekTokenIs(TokenType.R_PAREN)) {
      this.advance();
      afterEach = this.parseExpression(Precedence.LOWEST);
    }
    this.expectPeek(TokenType.R_PAREN);
    this.advance();
    const body = this.parseStatement();
    return new ForStatement(token, body, initialize, condition, afterEach);
  };

  private parseWhileStatement = (): WhileStatement => {
    const token = copyToken(this.curToken);

    this.expectPeek(TokenType.L_PAREN);

    this.advance();
    const condition = this.parseExpression(Precedence.LOWEST);

    this.expectPeek(TokenType.R_PAREN);

    this.advance();
    const body = this.parseStatement();
    return new WhileStatement(token, condition, body);
  };

  private parseContinueStatement = (): ContinueStatement => {
    const token = copyToken(this.curToken);
    this.expectPeek(TokenType.SEMICOLON);
    return new ContinueStatement(token);
  };

  private parseBreakStatement = (): BreakStatement => {
    const token = copyToken(this.curToken);
    this.expectPeek(TokenType.SEMICOLON);
    return new BreakStatement(token);
  };

  private parseReturnStatement = (): ReturnStatement => {
    const token = copyToken(this.curToken);
    let returnValue: Expression | null = null;
    if (!this.peekTokenIs(TokenType.SEMICOLON)) {
      this.advance();
      returnValue = this.parseExpression(Precedence.LOWEST);
    }
    this.expectPeek(TokenType.SEMICOLON);
    return new ReturnStatement(token, returnValue);
  };

  private parseFunctionStatement = (): FunctionStatement => {
    const token = copyToken(this.curToken);

    this.advance();
    const identifier = this.parseIdentifier();

    this.expectPeek(TokenType.L_PAREN);

    const parameters: Token[] = [];
    if (!this.peekTokenIs(TokenType.R_PAREN)) {
      this.advance();
      parameters.push(this.parseIdentifier());

      while (this.peekTokenIs(TokenType.COMMA)) {
        this.advance();

        this.advance();
        parameters.push(this.parseIdentifier());
      }
    }
    this.expectPeek(TokenType.R_PAREN);

    this.expectPeek(TokenType.L_BRACE);
    const body = this.parseBlockStatement();

    return new FunctionStatement(token, identifier, parameters, body);
  };

  private parseMethodStatement = (): MethodStatement => {
    const token = copyToken(this.curToken);
    let isStatic = false;

    if (this.curTokenIs(TokenType.STATIC)) {
      isStatic = true;
      this.advance();
    }

    const identifier = this.parseIdentifier();

    this.expectPeek(TokenType.L_PAREN);

    const parameters: Token[] = [];
    if (!this.peekTokenIs(TokenType.R_PAREN)) {
      this.advance();
      parameters.push(this.parseIdentifier());

      while (this.peekTokenIs(TokenType.COMMA)) {
        this.advance();

        this.advance();
        parameters.push(this.parseIdentifier());
      }
    }
    this.expectPeek(TokenType.R_PAREN);

    this.expectPeek(TokenType.L_BRACE);
    const body = this.parseBlockStatement();

    return new MethodStatement(token, identifier, parameters, body, isStatic);
  };

  private parseClassStatement = (): ClassStatement => {
    const token = copyToken(this.curToken);
    const methodStmts: MethodStatement[] = [];

    this.advance();
    const identifier = this.parseIdentifier();

    let baseClass: Token | null = null;
    if (this.peekTokenIs(TokenType.EXTENDS)) {
      this.advance();
      this.advance();
      baseClass = this.parseIdentifier();
    }

    this.expectPeek(TokenType.L_BRACE);
    while (!this.peekTokenIs(TokenType.R_BRACE)) {
      this.advance();
      methodStmts.push(this.parseMethodStatement());
    }
    this.expectPeek(TokenType.R_BRACE);
    return new ClassStatement(token, identifier, baseClass, methodStmts);
  };

  private parseExpression = (precedence: Precedence): Expression => {
    // Pratt parsing algorithm
    const prefixParseFunc = this.prefixParseFuncs.get(this.curToken.type);
    if (!prefixParseFunc) {
      throw syntaxError(
        `unexpected token of type "${getTokenName(this.curToken.type)}"`,
        this.curToken
      );
    }
    let leftExpr = prefixParseFunc();

    while (
      !this.peekTokenIs(TokenType.SEMICOLON) &&
      (precedence < this.peekPrecedence() ||
        (precedence === this.peekPrecedence() && this.peekTokenIs(TokenType.ASSIGN)))
    ) {
      const infixParseFunc = this.infixParseFuncs.get(this.peekToken.type);
      if (!infixParseFunc) {
        break;
      }
      this.advance();
      leftExpr = infixParseFunc(leftExpr);
    }
    return leftExpr;
  };

  private parseIdentifierExpression = (): IdentifierExpression => {
    const token = copyToken(this.curToken);
    const name = this.parseIdentifier();
    return new IdentifierExpression(token, name);
  };

  private parseFunctionExpression = (): FunctionExpression => {
    const token = copyToken(this.curToken);

    this.expectPeek(TokenType.L_PAREN);
    const parameters: Token[] = [];
    if (!this.peekTokenIs(TokenType.R_PAREN)) {
      this.advance();
      parameters.push(this.parseIdentifier());

      while (this.peekTokenIs(TokenType.COMMA)) {
        this.advance();

        this.advance();
        parameters.push(this.parseIdentifier());
      }
    }
    this.expectPeek(TokenType.R_PAREN);

    this.expectPeek(TokenType.L_BRACE);
    const body = this.parseBlockStatement();

    return new FunctionExpression(token, parameters, body);
  };

  private parseLiteralExpression = (): LiteralExpression => {
    const token = copyToken(this.curToken);
    const literal = copyToken(this.curToken);

    let value: unknown;
    switch (this.curToken.type) {
      case TokenType.NULL:
      case TokenType.TRUE:
      case TokenType.FALSE:
      case TokenType.NUMBER_LITERAL:
      case TokenType.STRING_LITERAL:
        value = getLiteralValue(this.curToken);
        break;
      default:
        throw syntaxError(
          `unexpected token of type "${getTokenName(this.curToken.type)}"`,
          this.curToken
        );
    }

    return new LiteralExpression(token, literal, value);
  };

  private parsePrefixExpression = (): PrefixExpression => {
    const token = copyToken(this.curToken);
    const operator = copyToken(this.curToken);

    this.advance();
    const operand = this.parseExpression(Precedence.PREFIX);

    return new PrefixExpression(token, operator, operand);
  };

  private parseInfixExpression = (left: Expression): InfixExpression => {
    const token = copyToken(this.curToken);
    const operator = copyToken(this.curToken);
    const precedence = this.curPrecedence();

    this.advance();
    const right = this.parseExpression(precedence);

    return new InfixExpression(token, operator, left, right);
  };

  private parseAssignmentExpression = (left: Expression): AssignmentExpression => {
    const token = copyToken(this.curToken);
    if (
      !(
        left instanceof IdentifierExpression ||
        left instanceof GetPropertyExpression ||
        left instanceof IndexExpression
      )
    ) {
      throw syntaxError(`lhs is not a valid l-value`, this.curToken);
    }
    const operator = copyToken(this.curToken);
    const precedence = this.curPrecedence();

    this.advance();
    const right = this.parseExpression(precedence);
    return new AssignmentExpression(token, operator, left, right);
  };

  private parseVarDeclaration(): { name: Token; initializer: Expression | null } {
    const name = this.parseIdentifier();

    let initializer: Expression | null = null;
    if (this.peekTokenIs(TokenType.ASSIGN)) {
      this.advance();

      this.advance();
      initializer = this.parseExpression(Precedence.LOWEST);
    } else {
      initializer = null;
    }
    return { name, initializer };
  }

  private parseLetExpression = (): LetExpression => {
    const token = copyToken(this.curToken);
    const arr: { name: Token; initializer: Expression | null }[] = [];

    this.advance();
    arr.push(this.parseVarDeclaration());

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.advance();

      this.advance();
      arr.push(this.parseVarDeclaration());
    }
    return new LetExpression(token, arr);
  };

  private parseGroupedExpression = (): Expression => {
    this.advance();
    const expr = this.parseExpression(Precedence.LOWEST);

    this.expectPeek(TokenType.R_PAREN);
    return expr;
  };

  private parseCallExpression = (left: Expression): CallExpression => {
    const token = copyToken(this.curToken);
    const callable = left;
    const args: Expression[] = [];
    if (!this.peekTokenIs(TokenType.R_PAREN)) {
      this.advance();
      args.push(this.parseExpression(Precedence.LOWEST));

      while (this.peekTokenIs(TokenType.COMMA)) {
        this.advance();

        this.advance();
        args.push(this.parseExpression(Precedence.LOWEST));
      }
    }
    this.expectPeek(TokenType.R_PAREN);
    return new CallExpression(token, callable, args);
  };

  private parseArrayExpression = (): ArrayLiteralExpression => {
    const token = copyToken(this.curToken);
    const elements: Expression[] = [];
    if (!this.peekTokenIs(TokenType.R_BRACKET)) {
      this.advance();
      elements.push(this.parseExpression(Precedence.LOWEST));

      while (this.peekTokenIs(TokenType.COMMA)) {
        this.advance();

        this.advance();
        elements.push(this.parseExpression(Precedence.LOWEST));
      }
    }
    this.expectPeek(TokenType.R_BRACKET);
    return new ArrayLiteralExpression(token, elements);
  };

  private parseKeyValue = (): { key: string; value: Expression } => {
    if (!this.curTokenIs(TokenType.STRING_LITERAL)) {
      throw syntaxError(
        `expect token "${getTokenName(TokenType.STRING_LITERAL)}", got "${getTokenName(
          this.curToken.type
        )}"`,
        this.peekToken
      );
    }
    const key = getLiteralValue(this.curToken) as string;

    this.expectPeek(TokenType.COLON);

    this.advance();
    const value = this.parseExpression(Precedence.LOWEST);
    return { key, value };
  };

  private parseHashExpression = (): HashLiteralExpression => {
    const token = copyToken(this.curToken);
    const entries: { key: string; value: Expression }[] = [];
    if (!this.peekTokenIs(TokenType.R_BRACE)) {
      this.advance();
      entries.push(this.parseKeyValue());

      while (this.peekTokenIs(TokenType.COMMA)) {
        this.advance();

        this.advance();
        entries.push(this.parseKeyValue());
      }
    }
    this.expectPeek(TokenType.R_BRACE);
    return new HashLiteralExpression(token, entries);
  };

  private parseIndexExpression = (left: Expression): IndexExpression => {
    const indexable = left;
    const token = copyToken(this.curToken);

    this.advance();
    const index = this.parseExpression(Precedence.LOWEST);

    this.expectPeek(TokenType.R_BRACKET);
    return new IndexExpression(token, indexable, index);
  };

  private parseGetPropertyExpression = (left: Expression): GetPropertyExpression => {
    const token = copyToken(this.curToken);

    this.advance();
    const right = this.parseIdentifier();

    return new GetPropertyExpression(token, left, right);
  };

  private parseNewExpression = (): NewExpression => {
    const token = copyToken(this.curToken);

    this.advance();
    const identifier = this.parseIdentifier();

    this.expectPeek(TokenType.L_PAREN);
    const args: Expression[] = [];
    if (!this.peekTokenIs(TokenType.R_PAREN)) {
      this.advance();
      args.push(this.parseExpression(Precedence.LOWEST));

      while (this.peekTokenIs(TokenType.COMMA)) {
        this.advance();

        this.advance();
        args.push(this.parseExpression(Precedence.LOWEST));
      }
    }
    this.expectPeek(TokenType.R_PAREN);
    return new NewExpression(token, identifier, args);
  };

  private parseThisExpression = (): ThisExpression => {
    if (this.curToken.type !== TokenType.THIS) {
      throw syntaxError(
        `expect token "${getTokenName(TokenType.THIS)}", got "${getTokenName(this.curToken.type)}"`,
        this.peekToken
      );
    }
    const token = copyToken(this.curToken);
    return new ThisExpression(token);
  };

  private advance = () => {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  };

  private expectPeek = (tokenType: TokenType) => {
    if (this.peekTokenIs(tokenType)) {
      this.advance();
    } else {
      throw syntaxError(
        `expect token "${getTokenName(tokenType)}", got "${getTokenName(this.peekToken.type)}"`,
        this.peekToken
      );
    }
  };

  private parseIdentifier = (): Token => {
    if (this.curToken.type !== TokenType.IDENTIFIER) {
      throw syntaxError(
        `expect token "${getTokenName(TokenType.IDENTIFIER)}", got "${getTokenName(
          this.curToken.type
        )}"`,
        this.peekToken
      );
    }
    return copyToken(this.curToken);
  };

  private curTokenIs = (...tokenTypes: TokenType[]): boolean => {
    return tokenTypes.includes(this.curToken.type);
  };

  private peekTokenIs = (...tokenTypes: TokenType[]): boolean => {
    return tokenTypes.includes(this.peekToken.type);
  };

  private curPrecedence = (): Precedence => {
    return precedences[this.curToken.type] ?? Precedence.LOWEST;
  };

  private peekPrecedence = (): Precedence => {
    return precedences[this.peekToken.type] ?? Precedence.LOWEST;
  };
}
