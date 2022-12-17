import {
  CallExpression,
  Expression,
  IdentifierExpression,
  LetStatement,
  LiteralExpression,
  Program,
  Statement,
} from '../ast';
import { Lexer, LexerSymbol, Token } from '../lexer';

// TODO Better Error Handling
class ParseError extends Error {
  constructor(symbol: LexerSymbol) {
    super('parse error');
    console.log(symbol);
    this.name = 'ParseError';
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
    while (this.currentSymbol.token !== Token.EOF) {
      const statement = this.parseStatement();
      program.body.push(statement);
      this.readNextSymbol();
    }
    return program;
  }

  parseStatement(): Statement {
    switch (this.currentSymbol.token) {
      case Token.LET:
        return this.parseLetStatement();
      default:
        throw new ParseError(this.currentSymbol);
    }
  }

  parseLetStatement(): LetStatement {
    const statement = new LetStatement();
    if (this.nextSymbol.token !== Token.IDENTIFIER) {
      throw new ParseError(this.currentSymbol);
    }
    this.readNextSymbol();
    statement.identifier = { ...this.currentSymbol };
    if (this.nextSymbol.token !== Token.ASSIGN) {
      throw new ParseError(this.currentSymbol);
    }
    this.readNextSymbol();
    this.readNextSymbol();
    statement.value = this.parseExpression();
    if (this.currentSymbol.token !== Token.SEMICOLON) {
      throw new ParseError(this.currentSymbol);
    }
    return statement;
  }

  parseExpression(): Expression {
    switch (this.currentSymbol.token) {
      case Token.NULL:
      case Token.TRUE:
      case Token.FALSE: {
        const expr = new LiteralExpression();
        expr.symbol = this.currentSymbol;
        expr.value =
          this.currentSymbol.token === Token.NULL ? null : this.currentSymbol.token === Token.TRUE;
        this.readNextSymbol();
        return expr;
      }
      case Token.NUMBER_LITERAL:
      case Token.STRING_LITERAL: {
        const expr = new LiteralExpression();
        expr.symbol = this.currentSymbol;
        expr.value = this.currentSymbol.literal;
        if (this.currentSymbol.token === Token.NUMBER_LITERAL) {
          expr.value = +(expr.value as string);
        }
        this.readNextSymbol();
        return expr;
      }
      case Token.L_PAREN: {
        this.readNextSymbol();
        const expr = this.parseExpression();
        if (this.currentSymbol.token !== Token.R_PAREN) {
          throw new ParseError(this.currentSymbol);
        }
        this.readNextSymbol();
        return expr;
      }
      case Token.IDENTIFIER: {
        if (this.nextSymbol.token === Token.L_PAREN) {
          return this.parseCallExpression();
        }
        const expr = new IdentifierExpression();
        expr.symbol = { ...this.currentSymbol };
        this.readNextSymbol();
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
    expr.identifier = { ...this.currentSymbol };
    if (this.nextSymbol.token !== Token.L_PAREN) {
      throw new ParseError(this.currentSymbol);
    }
    this.readNextSymbol();
    this.readNextSymbol();
    while (this.currentSymbol.token !== Token.R_PAREN) {
      const arg = this.parseExpression();
      expr.arguments.push(arg);
      if (this.currentSymbol.token === Token.COMMA) {
        this.readNextSymbol();
      } else if (this.currentSymbol.token !== Token.R_PAREN) {
        throw new ParseError(this.currentSymbol);
      }
    }
    this.readNextSymbol();
    return expr;
  }

  private readNextSymbol() {
    this.currentSymbol = this.nextSymbol;
    this.nextSymbol = this.lexer.nextSymbol();
  }
}
