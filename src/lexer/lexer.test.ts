import { IPosition } from 'src/types'
import { describe, expect, test } from 'vitest'
import Lexer from './lexer'
import { getTokenName, Token, TokenType } from './token'

describe('Lexer', () => {
  test('operators and punctuations', () => {
    const expected: [TokenType, string][] = [
      TokenType.ASSIGN,
      TokenType.PLUS,
      TokenType.MINUS,
      TokenType.STAR,
      TokenType.SLASH,
      TokenType.BACK_SLASH,
      TokenType.PERCENT,
      TokenType.EQUAL,
      TokenType.BANG,
      TokenType.BANG_EQUAL,
      TokenType.GREATER_THAN,
      TokenType.GREATER_THAN_EQUAL,
      TokenType.LESS_THAN,
      TokenType.LESS_THAN_EQUAL,
      TokenType.STAR_EQUAL,
      TokenType.SLASH_EQUAL,
      TokenType.PERCENT_EQUAL,
      TokenType.PLUS_EQUAL,
      TokenType.MINUS_EQUAL,
      TokenType.BIT_AND_EQUAL,
      TokenType.BIT_OR_EQUAL,
      TokenType.BIT_XOR_EQUAL,
      TokenType.COMMA,
      TokenType.SEMICOLON,
      TokenType.DOT,
      TokenType.COLON,
      TokenType.QUESTION,
      TokenType.L_PAREN,
      TokenType.R_PAREN,
      TokenType.L_BRACE,
      TokenType.R_BRACE,
      TokenType.L_BRACKET,
      TokenType.R_BRACKET,
      TokenType.BIT_AND,
      TokenType.BIT_OR,
      TokenType.BIT_XOR,
      TokenType.BIT_NOT,
      TokenType.LOGIC_AND,
      TokenType.LOGIC_OR,
    ].map((token) => [token, getTokenName(token)])
    const input = expected.map((item) => item[1]).join(' ')
    const items: [TokenType, string][] = []

    const lexer = new Lexer(input)
    let token = lexer.nextToken()
    while (token.type !== TokenType.EOF) {
      items.push([token.type, token.lexeme])
      token = lexer.nextToken()
    }

    expect(items).toEqual(expected)
  })

  test('operators and punctuations', () => {
    const expected: [TokenType, string][] = [
      TokenType.ASSIGN,
      TokenType.PLUS,
      TokenType.MINUS,
      TokenType.STAR,
      TokenType.SLASH,
      TokenType.BACK_SLASH,
      TokenType.PERCENT,
      TokenType.EQUAL,
      TokenType.BANG,
      TokenType.BANG_EQUAL,
      TokenType.GREATER_THAN,
      TokenType.GREATER_THAN_EQUAL,
      TokenType.LESS_THAN,
      TokenType.LESS_THAN_EQUAL,
      TokenType.COMMA,
      TokenType.SEMICOLON,
      TokenType.DOT,
      TokenType.COLON,
      TokenType.QUESTION,
      TokenType.L_PAREN,
      TokenType.R_PAREN,
      TokenType.L_BRACE,
      TokenType.R_BRACE,
      TokenType.L_BRACKET,
      TokenType.R_BRACKET,
      TokenType.BIT_AND,
      TokenType.BIT_OR,
      TokenType.BIT_XOR,
      TokenType.BIT_NOT,
      TokenType.LOGIC_AND,
      TokenType.LOGIC_OR,
    ].map((token) => [token, getTokenName(token)])
    const input = expected.map((item) => item[1]).join(' ')
    const items: [TokenType, string][] = []

    const lexer = new Lexer(input)
    let token = lexer.nextToken()
    while (token.type !== TokenType.EOF) {
      items.push([token.type, token.lexeme])
      token = lexer.nextToken()
    }

    expect(items).toEqual(expected)
  })

  test('keywords', () => {
    const expected = [
      TokenType.LET,
      TokenType.TRUE,
      TokenType.FALSE,
      TokenType.NULL,
      TokenType.FUNC,
      TokenType.IF,
      TokenType.ELSE,
      TokenType.FOR,
      TokenType.WHILE,
      TokenType.BREAK,
      TokenType.CONTINUE,
      TokenType.RETURN,
      TokenType.CLASS,
      TokenType.EXTENDS,
      TokenType.STATIC,
      TokenType.NEW,
      TokenType.THIS,
    ].map((token) => [token, getTokenName(token)])
    const input = expected.map((item) => item[1]).join(' ')
    const items: [TokenType, string][] = []

    const lexer = new Lexer(input)
    let token = lexer.nextToken()
    while (token.type !== TokenType.EOF) {
      items.push([token.type, token.lexeme])
      token = lexer.nextToken()
    }

    expect(items).toEqual(expected)
  })

  test('identifiers', () => {
    const expected = [
      [TokenType.IDENTIFIER, 'foO'],
      [TokenType.IDENTIFIER, 'Bar'],
      [TokenType.IDENTIFIER, 'a0'],
      [TokenType.IDENTIFIER, 'b123'],
    ]
    const input = expected.map((item) => item[1]).join(' ')
    const items: [TokenType, string][] = []

    const lexer = new Lexer(input)
    let token = lexer.nextToken()
    while (token.type !== TokenType.EOF) {
      items.push([token.type, token.lexeme])
      token = lexer.nextToken()
    }

    expect(items).toEqual(expected)
  })

  test('number literals', () => {
    const input = '0 -1 3.14 3e-3 0.1e2 +1.2e+5'
    const items: [TokenType, string][] = []

    const lexer = new Lexer(input)
    let token = lexer.nextToken()
    while (token.type !== TokenType.EOF) {
      items.push([token.type, token.lexeme])
      token = lexer.nextToken()
    }

    const expected = [
      [TokenType.NUMBER_LITERAL, '0'],
      [TokenType.MINUS, '-'],
      [TokenType.NUMBER_LITERAL, '1'],
      [TokenType.NUMBER_LITERAL, '3.14'],
      [TokenType.NUMBER_LITERAL, '3e-3'],
      [TokenType.NUMBER_LITERAL, '0.1e2'],
      [TokenType.PLUS, '+'],
      [TokenType.NUMBER_LITERAL, '1.2e+5'],
    ]
    expect(items).toEqual(expected)
  })

  test('string literals', () => {
    const expected = [
      [TokenType.STRING_LITERAL, '"foo"'],
      [TokenType.STRING_LITERAL, '"ba\\"r"'],
      [TokenType.STRING_LITERAL, '"\\x00"'],
      [TokenType.STRING_LITERAL, '"\\u0000"'],
    ]
    const input = expected.map((item) => item[1]).join(' ')
    const items: [TokenType, string][] = []

    const lexer = new Lexer(input)
    let token = lexer.nextToken()
    while (token.type !== TokenType.EOF) {
      items.push([token.type, token.lexeme])
      token = lexer.nextToken()
    }

    expect(items).toEqual(expected)
  })

  test('position', () => {
    const input = `\
let a = 1;
let b = 2;
`
    const items: [TokenType, IPosition, IPosition][] = []

    const lexer = new Lexer(input)
    let token = lexer.nextToken()
    while (token.type !== TokenType.EOF) {
      items.push([token.type, token.start, token.end])
      token = lexer.nextToken()
    }

    const expected: [TokenType, IPosition, IPosition][] = [
      [TokenType.LET, { line: 1, column: 1 }, { line: 1, column: 4 }],
      [TokenType.IDENTIFIER, { line: 1, column: 5 }, { line: 1, column: 6 }],
      [TokenType.ASSIGN, { line: 1, column: 7 }, { line: 1, column: 8 }],
      [TokenType.NUMBER_LITERAL, { line: 1, column: 9 }, { line: 1, column: 10 }],
      [TokenType.SEMICOLON, { line: 1, column: 10 }, { line: 1, column: 11 }],
      [TokenType.LET, { line: 2, column: 1 }, { line: 2, column: 4 }],
      [TokenType.IDENTIFIER, { line: 2, column: 5 }, { line: 2, column: 6 }],
      [TokenType.ASSIGN, { line: 2, column: 7 }, { line: 2, column: 8 }],
      [TokenType.NUMBER_LITERAL, { line: 2, column: 9 }, { line: 2, column: 10 }],
      [TokenType.SEMICOLON, { line: 2, column: 10 }, { line: 2, column: 11 }],
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
    const items: Token[] = []

    const lexer = new Lexer(input)
    let token = lexer.nextToken()
    while (token.type !== TokenType.EOF) {
      items.push(token)
      token = lexer.nextToken()
    }

    const expected: Token[] = [
      new Token(TokenType.LET, 'let', { line: 2, column: 1 }, { line: 2, column: 4 }),
      new Token(TokenType.IDENTIFIER, 'i', { line: 2, column: 5 }, { line: 2, column: 6 }),
      new Token(TokenType.ASSIGN, '=', { line: 2, column: 7 }, { line: 2, column: 8 }),
      new Token(TokenType.NUMBER_LITERAL, '0', { line: 2, column: 9 }, { line: 2, column: 10 }),
      new Token(TokenType.SEMICOLON, ';', { line: 2, column: 10 }, { line: 2, column: 11 }),
      new Token(TokenType.IDENTIFIER, 'print', { line: 5, column: 1 }, { line: 5, column: 6 }),
      new Token(TokenType.L_PAREN, '(', { line: 5, column: 6 }, { line: 5, column: 7 }),
      new Token(TokenType.IDENTIFIER, 'i', { line: 5, column: 7 }, { line: 5, column: 8 }),
      new Token(TokenType.R_PAREN, ')', { line: 5, column: 8 }, { line: 5, column: 9 }),
      new Token(TokenType.SEMICOLON, ';', { line: 5, column: 9 }, { line: 5, column: 10 }),
    ]
    expect(items).toEqual(expected)
  })

  describe('error tokens', () => {
    test('string literal across multi lines', () => {
      const input = '\n"123\n123"'

      const lexer = new Lexer(input)
      const token = lexer.nextToken()
      expect(token).toEqual(
        new Token(TokenType.ILLEGAL, '', { line: 2, column: 1 }, { line: 2, column: 1 })
      )
    })
  })
})
