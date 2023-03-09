import { IPosition } from 'src/types';
import { alternation, concatenation, kleeneClosure } from './regex';
import { getKeywordTokenType, isKeyword, Token, TokenType } from './token';
import { isLetter, isNumber } from './utils';

const identifierRE = /^[A-Za-z][A-Za-z0-9]*/;

// Lexer 不处理数字的正负号，都认为是 Tokens.MINUS，丢给语法分析处理
const numberLiteralRE = /^(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/;

const characterEscapeSequence = alternation(/["\\bfnrtv]/, /[^"\\bfnrtv0-9xu\r\n]/);
const hexEscapeSequence = /x[0-9a-fA-F]{2}/;
const unicodeEscapeSequence = /u[0-9a-fA-F]{4}/;
const escapeSequence = alternation(
  characterEscapeSequence,
  hexEscapeSequence,
  unicodeEscapeSequence
);
const stringCharacter = alternation(/[^"\\\r\n]/, concatenation(/\\/, escapeSequence));
const stringLiteralRE = concatenation(/^"/, kleeneClosure(stringCharacter), /"/);

export default class Lexer {
  private offset = 0;
  private line = 1;
  private lineOffset = 0; // 当前行起始 offset

  constructor(private source: string) {}

  nextToken(): Token {
    this.skipWhitespace();

    const startPos = this.getPos();

    if (this.isAtEnd()) {
      return new Token(TokenType.EOF, '', startPos, startPos);
    }

    const ch = this.peek();
    if (isNumber(ch)) {
      const res = this.nextNumberLiteral();
      if (res) {
        const [token, literal] = res;
        return new Token(token, literal, startPos, this.getPos());
      }
    } else if (isLetter(ch)) {
      const res = this.nextKeywordOrIdentifier();
      if (res) {
        const [token, literal] = res;
        return new Token(token, literal, startPos, this.getPos());
      }
    } else if (ch === '"') {
      const res = this.nextStringLiteral();
      if (res) {
        const [token, literal] = res;
        return new Token(token, literal, startPos, this.getPos());
      }
    } else {
      this.advance();
      switch (ch) {
        case ',': {
          return new Token(TokenType.COMMA, ch, startPos, this.getPos());
        }
        case ';': {
          return new Token(TokenType.SEMICOLON, ch, startPos, this.getPos());
        }
        case '.': {
          return new Token(TokenType.DOT, ch, startPos, this.getPos());
        }
        case ':': {
          return new Token(TokenType.COLON, ch, startPos, this.getPos());
        }
        case '?': {
          return new Token(TokenType.QUESTION, ch, startPos, this.getPos());
        }
        case '(': {
          return new Token(TokenType.L_PAREN, ch, startPos, this.getPos());
        }
        case ')': {
          return new Token(TokenType.R_PAREN, ch, startPos, this.getPos());
        }
        case '{': {
          return new Token(TokenType.L_BRACE, ch, startPos, this.getPos());
        }
        case '}': {
          return new Token(TokenType.R_BRACE, ch, startPos, this.getPos());
        }
        case '[': {
          return new Token(TokenType.L_BRACKET, ch, startPos, this.getPos());
        }
        case ']': {
          return new Token(TokenType.R_BRACKET, ch, startPos, this.getPos());
        }
        case '<': {
          if (this.match('=')) {
            return new Token(TokenType.LESS_THAN_EQUAL, '<=', startPos, this.getPos());
          }
          return new Token(TokenType.LESS_THAN, ch, startPos, this.getPos());
        }
        case '>': {
          if (this.match('=')) {
            return new Token(TokenType.GREATER_THAN_EQUAL, '>=', startPos, this.getPos());
          }
          return new Token(TokenType.GREATER_THAN, ch, startPos, this.getPos());
        }
        case '+': {
          if (this.match('=')) {
            return new Token(TokenType.PLUS_EQUAL, '+=', startPos, this.getPos());
          }
          return new Token(TokenType.PLUS, ch, startPos, this.getPos());
        }
        case '-': {
          if (this.match('=')) {
            return new Token(TokenType.MINUS_EQUAL, '-=', startPos, this.getPos());
          }
          return new Token(TokenType.MINUS, ch, startPos, this.getPos());
        }
        case '*': {
          if (this.match('=')) {
            return new Token(TokenType.STAR_EQUAL, '*=', startPos, this.getPos());
          }
          return new Token(TokenType.STAR, ch, startPos, this.getPos());
        }
        case '/': {
          if (this.match('/')) {
            // 注释
            while (!this.isAtEnd()) {
              const ch = this.advance();
              if (ch === '\n') {
                this.lineOffset = this.offset;
                this.line++;
                break;
              }
            }
            return this.nextToken();
          }
          if (this.match('=')) {
            return new Token(TokenType.SLASH_EQUAL, '/=', startPos, this.getPos());
          }
          return new Token(TokenType.SLASH, ch, startPos, this.getPos());
        }
        case '\\': {
          return new Token(TokenType.BACK_SLASH, ch, startPos, this.getPos());
        }
        case '%': {
          if (this.match('=')) {
            return new Token(TokenType.PERCENT_EQUAL, '%=', startPos, this.getPos());
          }
          return new Token(TokenType.PERCENT, ch, startPos, this.getPos());
        }
        case '=': {
          if (this.match('=')) {
            return new Token(TokenType.EQUAL, '==', startPos, this.getPos());
          }
          return new Token(TokenType.ASSIGN, ch, startPos, this.getPos());
        }
        case '!': {
          if (this.match('=')) {
            return new Token(TokenType.BANG_EQUAL, '!=', startPos, this.getPos());
          }
          return new Token(TokenType.BANG, ch, startPos, this.getPos());
        }
        case '&': {
          if (this.match('&')) {
            return new Token(TokenType.LOGIC_AND, '&&', startPos, this.getPos());
          }
          if (this.match('=')) {
            return new Token(TokenType.BIT_AND_EQUAL, '&=', startPos, this.getPos());
          }
          return new Token(TokenType.BIT_AND, ch, startPos, this.getPos());
        }
        case '|': {
          if (this.match('|')) {
            this.offset++;
            return new Token(TokenType.LOGIC_OR, '||', startPos, this.getPos());
          }
          if (this.match('=')) {
            this.offset++;
            return new Token(TokenType.BIT_OR_EQUAL, '|=', startPos, this.getPos());
          }
          return new Token(TokenType.BIT_OR, ch, startPos, this.getPos());
        }
        case '^': {
          if (this.match('=')) {
            return new Token(TokenType.BIT_XOR_EQUAL, '^=', startPos, this.getPos());
          }
          return new Token(TokenType.BIT_XOR, ch, startPos, this.getPos());
        }
        case '~': {
          return new Token(TokenType.BIT_NOT, ch, startPos, this.getPos());
        }
      }
    }

    // 无法识别的 token
    return new Token(TokenType.ILLEGAL, '', startPos, startPos);
  }

  private isAtEnd(): boolean {
    return this.offset >= this.source.length;
  }

  private advance(): string {
    if (this.isAtEnd()) {
      throw new Error('cannot advance');
    }
    return this.source[this.offset++];
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.offset] !== expected) return false;
    this.offset++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.offset];
  }

  private getPos(): IPosition {
    const { line, offset, lineOffset } = this;
    return {
      line,
      column: offset - lineOffset + 1,
    };
  }

  private skipWhitespace() {
    const { source } = this;
    while (this.offset < source.length) {
      const ch = source[this.offset];
      if ([' ', '\t', '\r', '\n'].includes(ch)) {
        this.offset++;
        if (ch === '\n') {
          this.lineOffset = this.offset;
          this.line++;
        }
      } else {
        break;
      }
    }
  }

  private nextStringLiteral(): readonly [TokenType, string] | null {
    const { source, offset: start } = this;
    const arr = new RegExp(stringLiteralRE).exec(source.slice(start));
    if (!arr) {
      return null;
    }
    const literal = arr[0];
    this.offset = start + literal.length;
    return [TokenType.STRING_LITERAL, literal];
  }

  private nextNumberLiteral(): readonly [TokenType, string] | null {
    const { source, offset: start } = this;
    const arr = new RegExp(numberLiteralRE).exec(source.slice(start));
    if (!arr) {
      return null;
    }
    const literal = arr[0];
    this.offset = start + literal.length;
    return [TokenType.NUMBER_LITERAL, literal];
  }

  private nextKeywordOrIdentifier(): readonly [TokenType, string] | null {
    const { source, offset: start } = this;
    const arr = new RegExp(identifierRE).exec(source.slice(start));
    if (!arr) {
      return null;
    }
    const literal = arr[0];
    this.offset = start + literal.length;
    if (isKeyword(literal)) {
      return [getKeywordTokenType(literal), literal];
    }
    return [TokenType.IDENTIFIER, literal];
  }
}
