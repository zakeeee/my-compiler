import { createToken, isKeyword, getKeywordToken, Token, Tokens, TokenType } from './token';

export class Lexer {
  private pos: number = 0;

  constructor(private source: string) {}

  nextToken(): Token {
    this.skipWhitespace();

    const { source } = this;

    if (this.pos === source.length) {
      return createToken(TokenType.EOF, '');
    }

    switch (source[this.pos]) {
      case ',': {
        this.pos++;
        return Tokens.COMMA;
      }
      case ';': {
        this.pos++;
        return Tokens.SEMICOLON;
      }
      case '(': {
        this.pos++;
        return Tokens.L_PAREN;
      }
      case ')': {
        this.pos++;
        return Tokens.R_PAREN;
      }
      case '{': {
        this.pos++;
        return Tokens.L_BRACE;
      }
      case '}': {
        this.pos++;
        return Tokens.R_BRACE;
      }
      case '[': {
        this.pos++;
        return Tokens.L_BRACKET;
      }
      case ']': {
        this.pos++;
        return Tokens.R_BRACKET;
      }
      case '<': {
        if (this.pos + 1 < source.length && source[this.pos + 1] === '=') {
          this.pos += 2;
          return Tokens.LESS_EQUAL_THAN;
        }
        this.pos++;
        return Tokens.LESS_THAN;
      }
      case '>': {
        if (this.pos + 1 < source.length && source[this.pos + 1] === '=') {
          this.pos += 2;
          return Tokens.GREATER_EQUAL_THAN;
        }
        this.pos++;
        return Tokens.GREATER_THAN;
      }
      case '+': {
        this.pos++;
        return Tokens.PLUS;
      }
      case '-': {
        this.pos++;
        return Tokens.MINUS;
      }
      case '*': {
        this.pos++;
        return Tokens.ASTERISK;
      }
      case '/': {
        this.pos++;
        return Tokens.SLASH;
      }
      case '=': {
        if (this.pos + 1 < source.length && source[this.pos + 1] === '=') {
          this.pos += 2;
          return Tokens.EQUAL;
        }
        this.pos++;
        return Tokens.ASSIGN;
      }
      case '!': {
        if (this.pos + 1 < source.length && source[this.pos + 1] === '=') {
          this.pos += 2;
          return Tokens.NOT_EQUAL;
        }
        this.pos++;
        return Tokens.NOT;
      }
      case '"': {
        return this.nextStringLiteral();
      }
      default: {
        const nextToken = this.nextNumberLiteral() || this.nextKeywordOrIdentifier();
        if (nextToken) {
          return nextToken;
        }
      }
    }

    // 无法识别的 token
    return createToken(TokenType.ERROR, '');
  }

  private skipWhitespace() {
    const { source } = this;
    while (this.pos < source.length && [' ', '\t', '\r', '\n'].includes(source[this.pos])) {
      this.pos++;
    }
  }

  private nextStringLiteral(): Token {
    const { source, pos: start } = this;
    let end = start + 1;
    while (end < source.length) {
      if (source[end] === '"' && source[end - 1] !== '\\') {
        break;
      }
      end++;
      if (end === source.length) {
        throw new Error('missing quote');
      }
    }
    this.pos = end + 1;
    const literal = source.slice(start, end + 1);
    return createToken(TokenType.STRING_LITERAL, literal);
  }

  private nextNumberLiteral(): Token | null {
    const { source, pos: start } = this;
    // Lexer 不处理数字的正负号，都认为是 Tokens.MINUS，丢给语法分析处理
    const re = /^(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/;
    const arr = re.exec(source.slice(start));
    if (!arr) {
      return null;
    }
    const literal = arr[0];
    this.pos = start + literal.length;
    return createToken(TokenType.NUMBER_LITERAL, +literal);
  }

  private nextKeywordOrIdentifier(): Token | null {
    const { source, pos: start } = this;
    const re = /^[A-Za-z][A-Za-z0-9]*/;
    const arr = re.exec(source.slice(start));
    if (!arr) {
      return null;
    }
    const literal = arr[0];
    this.pos = start + literal.length;
    if (isKeyword(literal)) {
      return getKeywordToken(literal)!;
    }
    return createToken(TokenType.IDENTIFIER, literal);
  }
}
