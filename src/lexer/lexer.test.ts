import { describe, expect, test } from 'vitest'
import Lexer, { LexicalSymbol } from './lexer'
import { getTokenName, Token } from './token'

describe('Lexer', () => {
  test('operators and punctuations', () => {
    const expected: [Token, string][] = [
      Token.ASSIGN,
      Token.PLUS,
      Token.MINUS,
      Token.ASTERISK,
      Token.SLASH,
      Token.BACK_SLASH,
      Token.PERCENT,
      Token.EQUAL,
      Token.NOT,
      Token.NOT_EQUAL,
      Token.GREATER_THAN,
      Token.GREATER_THAN_EQUAL,
      Token.LESS_THAN,
      Token.LESS_THAN_EQUAL,
      Token.MULTIPLY_EQUAL,
      Token.DIVIDE_EQUAL,
      Token.MODULO_EQUAL,
      Token.PLUS_EQUAL,
      Token.MINUS_EQUAL,
      Token.BIT_AND_EQUAL,
      Token.BIT_OR_EQUAL,
      Token.BIT_XOR_EQUAL,
      Token.COMMA,
      Token.SEMICOLON,
      Token.DOT,
      Token.COLON,
      Token.QUESTION_MARK,
      Token.L_PAREN,
      Token.R_PAREN,
      Token.L_BRACE,
      Token.R_BRACE,
      Token.L_BRACKET,
      Token.R_BRACKET,
      Token.BIT_AND,
      Token.BIT_OR,
      Token.BIT_XOR,
      Token.BIT_NOT,
      Token.LOGIC_AND,
      Token.LOGIC_OR,
    ].map((token) => [token, getTokenName(token)])
    const input = expected.map((item) => item[1]).join(' ')
    const items: [Token, string][] = []

    const lexer = new Lexer(input)
    for (let sym = lexer.nextSymbol(); sym.token !== Token.EOF; sym = lexer.nextSymbol()) {
      if (sym.token === Token.ILLEGAL) {
        const { start } = sym
        throw new Error(`illegal token at ${start.line}:${start.column}`)
      }
      items.push([sym.token, sym.literal])
    }

    expect(items).toEqual(expected)
  })

  test('operators and punctuations', () => {
    const expected: [Token, string][] = [
      Token.ASSIGN,
      Token.PLUS,
      Token.MINUS,
      Token.ASTERISK,
      Token.SLASH,
      Token.BACK_SLASH,
      Token.PERCENT,
      Token.EQUAL,
      Token.NOT,
      Token.NOT_EQUAL,
      Token.GREATER_THAN,
      Token.GREATER_THAN_EQUAL,
      Token.LESS_THAN,
      Token.LESS_THAN_EQUAL,
      Token.COMMA,
      Token.SEMICOLON,
      Token.DOT,
      Token.COLON,
      Token.QUESTION_MARK,
      Token.L_PAREN,
      Token.R_PAREN,
      Token.L_BRACE,
      Token.R_BRACE,
      Token.L_BRACKET,
      Token.R_BRACKET,
      Token.BIT_AND,
      Token.BIT_OR,
      Token.BIT_XOR,
      Token.BIT_NOT,
      Token.LOGIC_AND,
      Token.LOGIC_OR,
    ].map((token) => [token, getTokenName(token)])
    const input = expected.map((item) => item[1]).join(' ')
    const items: [Token, string][] = []

    const lexer = new Lexer(input)
    for (let sym = lexer.nextSymbol(); sym.token !== Token.EOF; sym = lexer.nextSymbol()) {
      if (sym.token === Token.ILLEGAL) {
        const { start } = sym
        throw new Error(`illegal token at ${start.line}:${start.column}`)
      }
      items.push([sym.token, sym.literal])
    }

    expect(items).toEqual(expected)
  })

  test('keywords', () => {
    const expected = [
      Token.LET,
      Token.TRUE,
      Token.FALSE,
      Token.NULL,
      Token.FUNC,
      Token.IF,
      Token.ELSE,
      Token.FOR,
      Token.WHILE,
      Token.BREAK,
      Token.CONTINUE,
      Token.RETURN,
    ].map((token) => [token, getTokenName(token)])
    const input = expected.map((item) => item[1]).join(' ')
    const items: [Token, string][] = []

    const lexer = new Lexer(input)
    for (let sym = lexer.nextSymbol(); sym.token !== Token.EOF; sym = lexer.nextSymbol()) {
      if (sym.token === Token.ILLEGAL) {
        const { start } = sym
        throw new Error(`illegal token at ${start.line}:${start.column}`)
      }
      items.push([sym.token, sym.literal])
    }

    expect(items).toEqual(expected)
  })

  test('identifiers', () => {
    const expected = [
      [Token.IDENTIFIER, 'foO'],
      [Token.IDENTIFIER, 'Bar'],
      [Token.IDENTIFIER, 'a0'],
      [Token.IDENTIFIER, 'b123'],
    ]
    const input = expected.map((item) => item[1]).join(' ')
    const items: [Token, string][] = []

    const lexer = new Lexer(input)
    for (let sym = lexer.nextSymbol(); sym.token !== Token.EOF; sym = lexer.nextSymbol()) {
      if (sym.token === Token.ILLEGAL) {
        const { start } = sym
        throw new Error(`illegal token at ${start.line}:${start.column}`)
      }
      items.push([sym.token, sym.literal])
    }

    expect(items).toEqual(expected)
  })

  test('number literals', () => {
    const input = '0 -1 3.14 3e-3 0.1e2 +1.2e+5'
    const items: [Token, string][] = []

    const lexer = new Lexer(input)
    for (let sym = lexer.nextSymbol(); sym.token !== Token.EOF; sym = lexer.nextSymbol()) {
      if (sym.token === Token.ILLEGAL) {
        const { start } = sym
        throw new Error(`illegal token at ${start.line}:${start.column}`)
      }
      items.push([sym.token, sym.literal])
    }

    const expected = [
      [Token.NUMBER_LITERAL, '0'],
      [Token.MINUS, '-'],
      [Token.NUMBER_LITERAL, '1'],
      [Token.NUMBER_LITERAL, '3.14'],
      [Token.NUMBER_LITERAL, '3e-3'],
      [Token.NUMBER_LITERAL, '0.1e2'],
      [Token.PLUS, '+'],
      [Token.NUMBER_LITERAL, '1.2e+5'],
    ]
    expect(items).toEqual(expected)
  })

  test('string literals', () => {
    const expected = [
      [Token.STRING_LITERAL, '"foo"'],
      [Token.STRING_LITERAL, '"ba\\"r"'],
      [Token.STRING_LITERAL, '"\\x00"'],
      [Token.STRING_LITERAL, '"\\u0000"'],
    ]
    const input = expected.map((item) => item[1]).join(' ')
    const items: [Token, string][] = []

    const lexer = new Lexer(input)
    for (let sym = lexer.nextSymbol(); sym.token !== Token.EOF; sym = lexer.nextSymbol()) {
      if (sym.token === Token.ILLEGAL) {
        const { start } = sym
        throw new Error(`illegal token at ${start.line}:${start.column}`)
      }
      items.push([sym.token, sym.literal])
    }

    expect(items).toEqual(expected)
  })

  test('position', () => {
    const input = `\
let a = 1;
let b = 2;
`
    const items: LexicalSymbol[] = []

    const lexer = new Lexer(input)
    for (let sym = lexer.nextSymbol(); sym.token !== Token.EOF; sym = lexer.nextSymbol()) {
      if (sym.token === Token.ILLEGAL) {
        const { start } = sym
        throw new Error(`illegal token at ${start.line}:${start.column}`)
      }
      items.push(sym)
    }

    const expected: LexicalSymbol[] = [
      {
        token: Token.LET,
        literal: 'let',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 4 },
      },
      {
        token: Token.IDENTIFIER,
        literal: 'a',
        start: { line: 1, column: 5 },
        end: { line: 1, column: 6 },
      },
      {
        token: Token.ASSIGN,
        literal: '=',
        start: { line: 1, column: 7 },
        end: { line: 1, column: 8 },
      },
      {
        token: Token.NUMBER_LITERAL,
        literal: '1',
        start: { line: 1, column: 9 },
        end: { line: 1, column: 10 },
      },
      {
        token: Token.SEMICOLON,
        literal: ';',
        start: { line: 1, column: 10 },
        end: { line: 1, column: 11 },
      },
      {
        token: Token.LET,
        literal: 'let',
        start: { line: 2, column: 1 },
        end: { line: 2, column: 4 },
      },
      {
        token: Token.IDENTIFIER,
        literal: 'b',
        start: { line: 2, column: 5 },
        end: { line: 2, column: 6 },
      },
      {
        token: Token.ASSIGN,
        literal: '=',
        start: { line: 2, column: 7 },
        end: { line: 2, column: 8 },
      },
      {
        token: Token.NUMBER_LITERAL,
        literal: '2',
        start: { line: 2, column: 9 },
        end: { line: 2, column: 10 },
      },
      {
        token: Token.SEMICOLON,
        literal: ';',
        start: { line: 2, column: 10 },
        end: { line: 2, column: 11 },
      },
    ]
    expect(items).toEqual(expected)
  })

  test('comments', () => {
    const input = `\
// this is a comment
let i = 0; // hhh
// this is another comment
// you know what?
print(i);
    `
    const items: [Token, string][] = []

    const lexer = new Lexer(input)
    for (let sym = lexer.nextSymbol(); sym.token !== Token.EOF; sym = lexer.nextSymbol()) {
      if (sym.token === Token.ILLEGAL) {
        const { start } = sym
        throw new Error(`illegal token at ${start.line}:${start.column}`)
      }
      items.push([sym.token, sym.literal])
    }

    const expected: [Token, string][] = [
      [Token.LET, 'let'],
      [Token.IDENTIFIER, 'i'],
      [Token.ASSIGN, '='],
      [Token.NUMBER_LITERAL, '0'],
      [Token.SEMICOLON, ';'],
      [Token.IDENTIFIER, 'print'],
      [Token.L_PAREN, '('],
      [Token.IDENTIFIER, 'i'],
      [Token.R_PAREN, ')'],
      [Token.SEMICOLON, ';'],
    ]
    expect(items).toEqual(expected)
  })

  describe('error tokens', () => {
    test('string literal across multi lines', () => {
      const input = '\n"123\n123"'

      const lexer = new Lexer(input)
      expect(lexer.nextSymbol()).toEqual({
        token: Token.ILLEGAL,
        literal: '',
        start: { line: 2, column: 1 },
        end: { line: 2, column: 1 },
      })
    })
  })
})
