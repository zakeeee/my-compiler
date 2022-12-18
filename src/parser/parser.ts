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
  IdentifierExpression,
  IfStatement,
  LetStatement,
  LiteralExpression,
  Program,
  ReturnStatement,
  Statement,
  WhileStatement,
} from '../ast';
import { getTokenName, Lexer, LexerSymbol, Token } from '../lexer';

// TODO Better Error Handling
class ParseError extends Error {
  constructor(symbol: LexerSymbol) {
    super('parse error');
    console.log(symbol);
    this.name = 'ParseError';
  }
}

class UnexpectedTokenError extends ParseError {
  constructor(symbol: LexerSymbol, expectedToken: Token) {
    super(symbol);
    console.log('expectedToken: ', getTokenName(expectedToken));
    this.name = 'UnexpectedTokenError';
  }
}

export class Parser {
  private currentSymbol!: LexerSymbol;
  private nextSymbol!: LexerSymbol;

  constructor(private lexer: Lexer) {
    // 初始化 currentSymbol 和 nextSymbol
    this.readNextSymbol();
    this.readNextSymbol();
  }

  parseProgram(): Program {
    const program = new Program();
    while (!this.currentTokenIs(Token.EOF)) {
      const statement = this.parseStatement();
      if (statement instanceof EmptyStatement) {
        continue;
      }
      program.body.push(statement);
    }
    return program;
  }

  parseStatement(): Statement {
    switch (this.currentSymbol.token) {
      case Token.L_BRACE:
        return this.parseBlockStatement();
      case Token.SEMICOLON:
        return new EmptyStatement();
      case Token.LET:
        return this.parseLetStatement();
      case Token.FUNC:
        return this.parseFuncDeclarationStatement();
      case Token.IF:
        return this.parseIfStatement();
      case Token.FOR:
        return this.parseForStatement();
      case Token.WHILE:
        return this.parseWhileStatement();
      case Token.CONTINUE:
        return this.parseContinueStatement();
      case Token.BREAK:
        return this.parseBreakStatement();
      case Token.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  parseBlockStatement(): BlockStatement {
    const stmt = new BlockStatement();
    this.parseToken(Token.L_BRACE);
    const statements: Statement[] = [];
    while (!this.currentTokenIs(Token.R_BRACE)) {
      const statement = this.parseStatement();
      if (statement instanceof EmptyStatement) {
        continue;
      }
      statements.push(statement);
    }
    stmt.statements = statements;
    this.parseToken(Token.R_BRACE);
    return stmt;
  }

  parseExpressionStatement(): ExpressionStatement {
    const stmt = new ExpressionStatement();
    const expressions: Expression[] = [];
    if (!this.nextTokenIs(Token.SEMICOLON)) {
      expressions.push(this.parseExpression());
      while (this.currentTokenIs(Token.COMMA)) {
        this.parseToken(Token.COMMA);
        expressions.push(this.parseExpression());
      }
    }
    stmt.expressions = expressions;
    this.parseToken(Token.SEMICOLON);
    return stmt;
  }

  parseLetStatement(): LetStatement {
    const statement = new LetStatement();
    this.parseToken(Token.LET);
    statement.identifier = this.parseIdentifier();
    this.parseToken(Token.ASSIGN);
    statement.value = this.parseExpression();
    this.parseToken(Token.SEMICOLON);
    return statement;
  }

  parseFuncDeclarationStatement(): FuncDeclarationStatement {
    const stmt = new FuncDeclarationStatement();
    this.parseToken(Token.FUNC);
    stmt.identifier = this.parseIdentifier();
    this.parseToken(Token.L_PAREN);
    const parameters: LexerSymbol[] = [];
    if (!this.currentTokenIs(Token.R_PAREN)) {
      parameters.push(this.parseIdentifier());
      while (this.currentTokenIs(Token.COMMA)) {
        this.parseToken(Token.COMMA);
        parameters.push(this.parseIdentifier());
      }
    }
    stmt.parameters = parameters;
    this.parseToken(Token.R_PAREN);
    stmt.body = this.parseBlockStatement();
    return stmt;
  }

  parseIfStatement(): IfStatement {
    const stmt = new IfStatement();
    this.parseToken(Token.IF);
    this.parseToken(Token.L_PAREN);
    stmt.condition = this.parseExpression();
    this.parseToken(Token.R_PAREN);
    stmt.trueBranch = this.parseStatement();
    if (this.nextTokenIs(Token.ELSE)) {
      stmt.falseBranch = this.parseStatement();
    }
    return stmt;
  }

  parseForStatement(): ForStatement {
    const stmt = new ForStatement();
    this.parseToken(Token.FOR);
    this.parseToken(Token.L_PAREN);
    if (!this.nextTokenIs(Token.SEMICOLON)) {
      stmt.initialize = this.parseExpression();
    }
    this.parseToken(Token.SEMICOLON);
    if (!this.nextTokenIs(Token.SEMICOLON)) {
      stmt.condition = this.parseExpression();
    }
    this.parseToken(Token.SEMICOLON);
    if (!this.nextTokenIs(Token.R_PAREN)) {
      stmt.afterEach = this.parseExpression();
    }
    this.parseToken(Token.R_PAREN);
    stmt.body = this.parseStatement();
    return stmt;
  }

  parseWhileStatement(): WhileStatement {
    const stmt = new WhileStatement();
    this.parseToken(Token.WHILE);
    this.parseToken(Token.L_PAREN);
    stmt.condition = this.parseExpression();
    this.parseToken(Token.R_PAREN);
    stmt.body = this.parseStatement();
    return stmt;
  }

  parseContinueStatement(): ContinueStatement {
    this.parseToken(Token.CONTINUE);
    this.parseToken(Token.SEMICOLON);
    return new ContinueStatement();
  }

  parseBreakStatement(): BreakStatement {
    this.parseToken(Token.BREAK);
    this.parseToken(Token.SEMICOLON);
    return new BreakStatement();
  }

  parseReturnStatement(): ReturnStatement {
    const stmt = new ReturnStatement();
    this.parseToken(Token.RETURN);
    stmt.returnValue = this.parseExpression();
    this.parseToken(Token.SEMICOLON);
    return stmt;
  }

  parseExpression(): Expression {
    switch (this.currentSymbol.token) {
      case Token.NULL:
      case Token.TRUE:
      case Token.FALSE: {
        const expr = new LiteralExpression();
        expr.symbol = this.currentSymbol;
        expr.value = this.currentTokenIs(Token.NULL) ? null : this.currentTokenIs(Token.TRUE);
        this.readNextSymbol();
        return expr;
      }
      case Token.NUMBER_LITERAL:
      case Token.STRING_LITERAL: {
        const expr = new LiteralExpression();
        expr.symbol = this.currentSymbol;
        expr.value = this.currentSymbol.literal;
        if (this.currentTokenIs(Token.NUMBER_LITERAL)) {
          expr.value = +(expr.value as string);
        }
        this.readNextSymbol();
        return expr;
      }
      case Token.L_PAREN: {
        this.parseToken(Token.L_PAREN);
        const expr = this.parseExpression();
        this.parseToken(Token.R_PAREN);
        return expr;
      }
      case Token.IDENTIFIER: {
        if (this.nextTokenIs(Token.L_PAREN)) {
          return this.parseCallExpression();
        }
        const expr = new IdentifierExpression();
        expr.symbol = this.parseIdentifier();
        return expr;
      }
      default:
        throw new ParseError(this.currentSymbol);
    }
  }

  parseUnaOpExpression() {}

  parseBinOpExpression() {}

  parseCallExpression(): CallExpression {
    const expr = new CallExpression();
    expr.identifier = this.parseIdentifier();
    this.parseToken(Token.L_PAREN);
    const args: Expression[] = [];
    if (!this.currentTokenIs(Token.R_PAREN)) {
      args.push(this.parseExpression());
      while (this.currentTokenIs(Token.COMMA)) {
        this.parseToken(Token.COMMA);
        args.push(this.parseExpression());
      }
    }
    expr.arguments = args;
    this.parseToken(Token.R_PAREN);
    return expr;
  }

  private readNextSymbol() {
    this.currentSymbol = this.nextSymbol;
    this.nextSymbol = this.lexer.nextSymbol();
  }

  private parseToken(token: Token) {
    if (this.currentSymbol.token !== token) {
      throw new UnexpectedTokenError(this.currentSymbol, token);
    }
    this.readNextSymbol();
  }

  private parseIdentifier(): LexerSymbol {
    if (this.currentSymbol.token !== Token.IDENTIFIER) {
      throw new UnexpectedTokenError(this.currentSymbol, Token.IDENTIFIER);
    }
    const ret = { ...this.currentSymbol };
    this.readNextSymbol();
    return ret;
  }

  private currentTokenIs(token: Token) {
    return this.currentSymbol.token === token;
  }

  private nextTokenIs(token: Token) {
    return this.nextSymbol.token === token;
  }
}
