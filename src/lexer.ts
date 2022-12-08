import { createToken, keywordTokens, Token, TokenType } from './token';

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
      case ',':
        return createToken(TokenType.COMMA, source[this.pos++]);
      case ';':
        return createToken(TokenType.SEMICOLON, source[this.pos++]);
      case '(':
        return createToken(TokenType.L_PAREN, source[this.pos++]);
      case ')':
        return createToken(TokenType.R_PAREN, source[this.pos++]);
      case '{':
        return createToken(TokenType.L_BRACE, source[this.pos++]);
      case '}':
        return createToken(TokenType.R_BRACE, source[this.pos++]);
      case '[':
        return createToken(TokenType.L_BRACKET, source[this.pos++]);
      case ']':
        return createToken(TokenType.R_BRACKET, source[this.pos++]);
      case '<': {
        if (this.pos + 1 < source.length && source[this.pos + 1] === '=') {
          this.pos += 2;
          return createToken(TokenType.LESS_EQUAL_THAN, '!=');
        }
        return createToken(TokenType.LESS_THAN, source[this.pos++]);
      }
      case '>': {
        if (this.pos + 1 < source.length && source[this.pos + 1] === '=') {
          this.pos += 2;
          return createToken(TokenType.GREATER_EQUAL_THAN, '!=');
        }
        return createToken(TokenType.GREATER_THAN, source[this.pos++]);
      }
      case '+':
        return this.nextNumberLiteral() || createToken(TokenType.PLUS, source[this.pos++]);
      case '-':
        return this.nextNumberLiteral() || createToken(TokenType.MINUS, source[this.pos++]);
      case '*':
        return createToken(TokenType.ASTERISK, source[this.pos++]);
      case '/':
        return createToken(TokenType.SLASH, source[this.pos++]);
      case '=': {
        if (this.pos + 1 < source.length && source[this.pos + 1] === '=') {
          this.pos += 2;
          return createToken(TokenType.EQUAL, '==');
        }
        return createToken(TokenType.ASSIGN, source[this.pos++]);
      }
      case '!': {
        if (this.pos + 1 < source.length && source[this.pos + 1] === '=') {
          this.pos += 2;
          return createToken(TokenType.NOT_EQUAL, '!=');
        }
        return createToken(TokenType.NOT, source[this.pos++]);
      }
      case '"':
        return this.nextStringLiteral();
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
    return createToken(TokenType.STRING_LITERAL, literal, literal);
  }

  private nextNumberLiteral(): Token | null {
    const { source, pos: start } = this;
    const re = /^[\+-]?\d+(\.\d+)?([eE][\+-]\d+)?/;
    const arr = re.exec(source.slice(start));
    if (!arr) {
      return null;
    }
    const literal = arr[0];
    this.pos = start + literal.length;
    return createToken(TokenType.NUMBER_LITERAL, literal, +literal);
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
    return keywordTokens[literal] || createToken(TokenType.IDENTIFIER, literal);
  }
}
