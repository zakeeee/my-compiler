import { getKeywordToken, isKeyword, Token } from './token';
import { kleeneClosure, regExpAlternation, regExpConcatenation } from './utils';

const identifierRE = /^[A-Za-z][A-Za-z0-9]*/;

// Lexer 不处理数字的正负号，都认为是 Tokens.MINUS，丢给语法分析处理
const numberLiteralRE = /^(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/;

const characterEscapeSequence = regExpAlternation(/["\\bfnrtv]/, /[^"\\bfnrtv0-9xu\r\n]/);
const hexEscapeSequence = /x[0-9a-fA-F]{2}/;
const unicodeEscapeSequence = /u[0-9a-fA-F]{4}/;
const escapeSequence = regExpAlternation(
  characterEscapeSequence,
  hexEscapeSequence,
  unicodeEscapeSequence
);
const stringCharacter = regExpAlternation(/[^"\\\r\n]/, regExpConcatenation(/\\/, escapeSequence));
const stringLiteralRE = regExpConcatenation(/^"/, kleeneClosure(stringCharacter), /"/);

type Position = {
  line: number;
  column: number;
};

type Literal = string;

export class Lexer {
  private offset = 0;
  private line = 1;
  private lineOffset = 0; // 当前行起始 offset

  constructor(private source: string) {}

  next(): readonly [Position, Token, Literal?] {
    this.skipWhitespace();

    const { source, offset, line, lineOffset } = this;
    const startPos = {
      line,
      column: offset - lineOffset + 1,
    };

    if (this.offset === source.length) {
      return [startPos, Token.EOF];
    }

    const ch = source[this.offset];
    switch (ch) {
      case ',': {
        this.offset++;
        return [startPos, Token.COMMA];
      }
      case ';': {
        this.offset++;
        return [startPos, Token.SEMICOLON];
      }
      case '.': {
        this.offset++;
        return [startPos, Token.DOT];
      }
      case ':': {
        this.offset++;
        return [startPos, Token.COLON];
      }
      case '?': {
        this.offset++;
        return [startPos, Token.QUESTION_MARK];
      }
      case '(': {
        this.offset++;
        return [startPos, Token.L_PAREN];
      }
      case ')': {
        this.offset++;
        return [startPos, Token.R_PAREN];
      }
      case '{': {
        this.offset++;
        return [startPos, Token.L_BRACE];
      }
      case '}': {
        this.offset++;
        return [startPos, Token.R_BRACE];
      }
      case '[': {
        this.offset++;
        return [startPos, Token.L_BRACKET];
      }
      case ']': {
        this.offset++;
        return [startPos, Token.R_BRACKET];
      }
      case '<': {
        this.offset++;
        if (this.offset < source.length && source[this.offset] === '=') {
          this.offset++;
          return [startPos, Token.LESS_EQUAL_THAN];
        }
        return [startPos, Token.LESS_THAN];
      }
      case '>': {
        this.offset++;
        if (this.offset < source.length && source[this.offset] === '=') {
          this.offset++;
          return [startPos, Token.GREATER_EQUAL_THAN];
        }
        return [startPos, Token.GREATER_THAN];
      }
      case '+': {
        this.offset++;
        return [startPos, Token.PLUS];
      }
      case '-': {
        this.offset++;
        return [startPos, Token.MINUS];
      }
      case '*': {
        this.offset++;
        return [startPos, Token.ASTERISK];
      }
      case '/': {
        this.offset++;
        return [startPos, Token.SLASH];
      }
      case '%': {
        this.offset++;
        return [startPos, Token.PERCENT];
      }
      case '=': {
        this.offset++;
        if (this.offset < source.length && source[this.offset] === '=') {
          this.offset++;
          return [startPos, Token.EQUALS];
        }
        return [startPos, Token.ASSIGN];
      }
      case '!': {
        this.offset++;
        if (this.offset < source.length && source[this.offset] === '=') {
          this.offset++;
          return [startPos, Token.NOT_EQUALS];
        }
        return [startPos, Token.NOT];
      }
      case '&': {
        this.offset++;
        if (this.offset < source.length && source[this.offset] === '&') {
          this.offset++;
          return [startPos, Token.LOGIC_AND];
        }
        return [startPos, Token.BIT_AND];
      }
      case '|': {
        this.offset++;
        if (this.offset < source.length && source[this.offset] === '|') {
          this.offset++;
          return [startPos, Token.LOGIC_OR];
        }
        return [startPos, Token.BIT_OR];
      }
      case '^': {
        this.offset++;
        return [startPos, Token.BIT_XOR];
      }
      case '~': {
        this.offset++;
        return [startPos, Token.BIT_NOT];
      }
      case '"': {
        const res = this.nextStringLiteral();
        if (res) {
          return [startPos, ...res];
        }
      }
      default: {
        const res = this.nextNumberLiteral() || this.nextKeywordOrIdentifier();
        if (res) {
          return [startPos, ...res];
        }
      }
    }

    // 无法识别的 token
    return [startPos, Token.ILLEGAL];
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

  private nextStringLiteral(): readonly [Token, string] | null {
    const { source, offset: start } = this;
    const arr = new RegExp(stringLiteralRE).exec(source.slice(start));
    if (!arr) {
      return null;
    }
    const literal = arr[0];
    this.offset = start + literal.length;
    return [Token.STRING_LITERAL, literal];
  }

  private nextNumberLiteral(): readonly [Token, string] | null {
    const { source, offset: start } = this;
    const arr = new RegExp(numberLiteralRE).exec(source.slice(start));
    if (!arr) {
      return null;
    }
    const literal = arr[0];
    this.offset = start + literal.length;
    return [Token.NUMBER_LITERAL, literal];
  }

  private nextKeywordOrIdentifier(): readonly [Token, string] | null {
    const { source, offset: start } = this;
    const arr = new RegExp(identifierRE).exec(source.slice(start));
    if (!arr) {
      return null;
    }
    const literal = arr[0];
    this.offset = start + literal.length;
    if (isKeyword(literal)) {
      return [getKeywordToken(literal), literal];
    }
    return [Token.IDENTIFIER, literal];
  }
}
