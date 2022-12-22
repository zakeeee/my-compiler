import { getKeywordToken, isKeyword, Token } from './token'
import { kleeneClosure, regExpAlternation, regExpConcatenation } from './utils'

const identifierRE = /^[A-Za-z][A-Za-z0-9]*/

// Lexer 不处理数字的正负号，都认为是 Tokens.MINUS，丢给语法分析处理
const numberLiteralRE = /^(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/

const characterEscapeSequence = regExpAlternation(/["\\bfnrtv]/, /[^"\\bfnrtv0-9xu\r\n]/)
const hexEscapeSequence = /x[0-9a-fA-F]{2}/
const unicodeEscapeSequence = /u[0-9a-fA-F]{4}/
const escapeSequence = regExpAlternation(
  characterEscapeSequence,
  hexEscapeSequence,
  unicodeEscapeSequence
)
const stringCharacter = regExpAlternation(/[^"\\\r\n]/, regExpConcatenation(/\\/, escapeSequence))
const stringLiteralRE = regExpConcatenation(/^"/, kleeneClosure(stringCharacter), /"/)

type Position = {
  line: number
  column: number
}

export type LexerSymbol = {
  token: Token
  literal: string
  start: Position
  end: Position
}

export const createLexerSymbol = (
  token: Token,
  literal: string,
  start: Position,
  end: Position
) => ({
  token,
  literal,
  start,
  end,
})

const code_0 = '0'.charCodeAt(0)
const code_9 = '9'.charCodeAt(0)
function isNumber(ch: string): boolean {
  const code = ch.charCodeAt(0)
  return code >= code_0 && code <= code_9
}

const code_A = 'A'.charCodeAt(0)
const code_Z = 'Z'.charCodeAt(0)
const code_a = 'a'.charCodeAt(0)
const code_z = 'z'.charCodeAt(0)
function isLetter(ch: string): boolean {
  const code = ch.charCodeAt(0)
  return (code >= code_A && code <= code_Z) || (code >= code_a && code <= code_z)
}

export default class Lexer {
  private offset = 0
  private line = 1
  private lineOffset = 0 // 当前行起始 offset

  constructor(private source: string) {}

  nextSymbol(): LexerSymbol {
    this.skipWhitespace()

    const { source } = this
    const startPos = this.getPos()

    if (this.offset === source.length) {
      return createLexerSymbol(Token.EOF, '', startPos, startPos)
    }

    const ch = source[this.offset]
    if (isNumber(ch)) {
      const res = this.nextNumberLiteral()
      if (res) {
        const [token, literal] = res
        return createLexerSymbol(token, literal, startPos, this.getPos())
      }
    } else if (isLetter(ch)) {
      const res = this.nextKeywordOrIdentifier()
      if (res) {
        const [token, literal] = res
        return createLexerSymbol(token, literal, startPos, this.getPos())
      }
    } else if (ch === '"') {
      const res = this.nextStringLiteral()
      if (res) {
        const [token, literal] = res
        return createLexerSymbol(token, literal, startPos, this.getPos())
      }
    } else {
      this.offset++
      switch (ch) {
        case ',': {
          return createLexerSymbol(Token.COMMA, ch, startPos, this.getPos())
        }
        case ';': {
          return createLexerSymbol(Token.SEMICOLON, ch, startPos, this.getPos())
        }
        case '.': {
          return createLexerSymbol(Token.DOT, ch, startPos, this.getPos())
        }
        case ':': {
          return createLexerSymbol(Token.COLON, ch, startPos, this.getPos())
        }
        case '?': {
          return createLexerSymbol(Token.QUESTION_MARK, ch, startPos, this.getPos())
        }
        case '(': {
          return createLexerSymbol(Token.L_PAREN, ch, startPos, this.getPos())
        }
        case ')': {
          return createLexerSymbol(Token.R_PAREN, ch, startPos, this.getPos())
        }
        case '{': {
          return createLexerSymbol(Token.L_BRACE, ch, startPos, this.getPos())
        }
        case '}': {
          return createLexerSymbol(Token.R_BRACE, ch, startPos, this.getPos())
        }
        case '[': {
          return createLexerSymbol(Token.L_BRACKET, ch, startPos, this.getPos())
        }
        case ']': {
          return createLexerSymbol(Token.R_BRACKET, ch, startPos, this.getPos())
        }
        case '<': {
          if (this.offset < source.length && source[this.offset] === '=') {
            this.offset++
            return createLexerSymbol(Token.LESS_THAN_EQUAL, '<=', startPos, this.getPos())
          }
          return createLexerSymbol(Token.LESS_THAN, ch, startPos, this.getPos())
        }
        case '>': {
          if (this.offset < source.length && source[this.offset] === '=') {
            this.offset++
            return createLexerSymbol(Token.GREATER_THAN_EQUAL, '>=', startPos, this.getPos())
          }
          return createLexerSymbol(Token.GREATER_THAN, ch, startPos, this.getPos())
        }
        case '+': {
          return createLexerSymbol(Token.PLUS, ch, startPos, this.getPos())
        }
        case '-': {
          return createLexerSymbol(Token.MINUS, ch, startPos, this.getPos())
        }
        case '*': {
          return createLexerSymbol(Token.ASTERISK, ch, startPos, this.getPos())
        }
        case '/': {
          return createLexerSymbol(Token.SLASH, ch, startPos, this.getPos())
        }
        case '\\': {
          return createLexerSymbol(Token.BACK_SLASH, ch, startPos, this.getPos())
        }
        case '%': {
          return createLexerSymbol(Token.PERCENT, ch, startPos, this.getPos())
        }
        case '=': {
          if (this.offset < source.length && source[this.offset] === '=') {
            this.offset++
            return createLexerSymbol(Token.EQUAL, '==', startPos, this.getPos())
          }
          return createLexerSymbol(Token.ASSIGN, ch, startPos, this.getPos())
        }
        case '!': {
          if (this.offset < source.length && source[this.offset] === '=') {
            this.offset++
            return createLexerSymbol(Token.NOT_EQUAL, '!=', startPos, this.getPos())
          }
          return createLexerSymbol(Token.NOT, ch, startPos, this.getPos())
        }
        case '&': {
          if (this.offset < source.length && source[this.offset] === '&') {
            this.offset++
            return createLexerSymbol(Token.LOGIC_AND, '&&', startPos, this.getPos())
          }
          return createLexerSymbol(Token.BIT_AND, ch, startPos, this.getPos())
        }
        case '|': {
          if (this.offset < source.length && source[this.offset] === '|') {
            this.offset++
            return createLexerSymbol(Token.LOGIC_OR, '||', startPos, this.getPos())
          }
          return createLexerSymbol(Token.BIT_OR, ch, startPos, this.getPos())
        }
        case '^': {
          return createLexerSymbol(Token.BIT_XOR, ch, startPos, this.getPos())
        }
        case '~': {
          return createLexerSymbol(Token.BIT_NOT, ch, startPos, this.getPos())
        }
      }
    }

    // 无法识别的 token
    return createLexerSymbol(Token.ILLEGAL, '', startPos, startPos)
  }

  private getPos(): Position {
    const { line, offset, lineOffset } = this
    return {
      line,
      column: offset - lineOffset + 1,
    }
  }

  private skipWhitespace() {
    const { source } = this
    while (this.offset < source.length) {
      const ch = source[this.offset]
      if ([' ', '\t', '\r', '\n'].includes(ch)) {
        this.offset++
        if (ch === '\n') {
          this.lineOffset = this.offset
          this.line++
        }
      } else {
        break
      }
    }
  }

  private nextStringLiteral(): readonly [Token, string] | null {
    const { source, offset: start } = this
    const arr = new RegExp(stringLiteralRE).exec(source.slice(start))
    if (!arr) {
      return null
    }
    const literal = arr[0]
    this.offset = start + literal.length
    return [Token.STRING_LITERAL, literal]
  }

  private nextNumberLiteral(): readonly [Token, string] | null {
    const { source, offset: start } = this
    const arr = new RegExp(numberLiteralRE).exec(source.slice(start))
    if (!arr) {
      return null
    }
    const literal = arr[0]
    this.offset = start + literal.length
    return [Token.NUMBER_LITERAL, literal]
  }

  private nextKeywordOrIdentifier(): readonly [Token, string] | null {
    const { source, offset: start } = this
    const arr = new RegExp(identifierRE).exec(source.slice(start))
    if (!arr) {
      return null
    }
    const literal = arr[0]
    this.offset = start + literal.length
    if (isKeyword(literal)) {
      return [getKeywordToken(literal), literal]
    }
    return [Token.IDENTIFIER, literal]
  }
}
