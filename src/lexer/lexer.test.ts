import { describe, expect, it } from 'vitest';
import Lexer, { createLexerSymbol } from './lexer';
import { getTokenName, Token } from './token';

describe('Lexer', () => {
  it('should recognize operators and punctuations', () => {
    const input = '= + - * / % == ! != > >= < <= , ; . : ? ( ) { } [ ] & | ^ ~ && ||';
    const items: unknown[] = [];

    const lexer = new Lexer(input);
    for (let sym = lexer.nextSymbol(); sym.token !== Token.EOF; sym = lexer.nextSymbol()) {
      if (sym.token === Token.ILLEGAL) {
        const { start } = sym;
        throw new Error(`illegal token at ${start.line}:${start.column}`);
      }
      items.push(sym);
    }

    const expected = [
      {
        token: Token.ASSIGN,
        literal: '=',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 2 },
      },
      {
        token: Token.PLUS,
        literal: '+',
        start: { line: 1, column: 3 },
        end: { line: 1, column: 4 },
      },
      {
        token: Token.MINUS,
        literal: '-',
        start: { line: 1, column: 5 },
        end: { line: 1, column: 6 },
      },
      {
        token: Token.ASTERISK,
        literal: '*',
        start: { line: 1, column: 7 },
        end: { line: 1, column: 8 },
      },
      {
        token: Token.SLASH,
        literal: '/',
        start: { line: 1, column: 9 },
        end: { line: 1, column: 10 },
      },
      {
        token: Token.PERCENT,
        literal: '%',
        start: { line: 1, column: 11 },
        end: { line: 1, column: 12 },
      },
      {
        token: Token.EQUALS,
        literal: '==',
        start: { line: 1, column: 13 },
        end: { line: 1, column: 15 },
      },
      {
        token: Token.NOT,
        literal: '!',
        start: { line: 1, column: 16 },
        end: { line: 1, column: 17 },
      },
      {
        token: Token.NOT_EQUALS,
        literal: '!=',
        start: { line: 1, column: 18 },
        end: { line: 1, column: 20 },
      },
      {
        token: Token.GREATER_THAN,
        literal: '>',
        start: { line: 1, column: 21 },
        end: { line: 1, column: 22 },
      },
      {
        token: Token.GREATER_EQUAL_THAN,
        literal: '>=',
        start: { line: 1, column: 23 },
        end: { line: 1, column: 25 },
      },
      {
        token: Token.LESS_THAN,
        literal: '<',
        start: { line: 1, column: 26 },
        end: { line: 1, column: 27 },
      },
      {
        token: Token.LESS_EQUAL_THAN,
        literal: '<=',
        start: { line: 1, column: 28 },
        end: { line: 1, column: 30 },
      },
      {
        token: Token.COMMA,
        literal: ',',
        start: { line: 1, column: 31 },
        end: { line: 1, column: 32 },
      },
      {
        token: Token.SEMICOLON,
        literal: ';',
        start: { line: 1, column: 33 },
        end: { line: 1, column: 34 },
      },
      {
        token: Token.DOT,
        literal: '.',
        start: { line: 1, column: 35 },
        end: { line: 1, column: 36 },
      },
      {
        token: Token.COLON,
        literal: ':',
        start: { line: 1, column: 37 },
        end: { line: 1, column: 38 },
      },
      {
        token: Token.QUESTION_MARK,
        literal: '?',
        start: { line: 1, column: 39 },
        end: { line: 1, column: 40 },
      },
      {
        token: Token.L_PAREN,
        literal: '(',
        start: { line: 1, column: 41 },
        end: { line: 1, column: 42 },
      },
      {
        token: Token.R_PAREN,
        literal: ')',
        start: { line: 1, column: 43 },
        end: { line: 1, column: 44 },
      },
      {
        token: Token.L_BRACE,
        literal: '{',
        start: { line: 1, column: 45 },
        end: { line: 1, column: 46 },
      },
      {
        token: Token.R_BRACE,
        literal: '}',
        start: { line: 1, column: 47 },
        end: { line: 1, column: 48 },
      },
      {
        token: Token.L_BRACKET,
        literal: '[',
        start: { line: 1, column: 49 },
        end: { line: 1, column: 50 },
      },
      {
        token: Token.R_BRACKET,
        literal: ']',
        start: { line: 1, column: 51 },
        end: { line: 1, column: 52 },
      },
      {
        token: Token.BIT_AND,
        literal: '&',
        start: { line: 1, column: 53 },
        end: { line: 1, column: 54 },
      },
      {
        token: Token.BIT_OR,
        literal: '|',
        start: { line: 1, column: 55 },
        end: { line: 1, column: 56 },
      },
      {
        token: Token.BIT_XOR,
        literal: '^',
        start: { line: 1, column: 57 },
        end: { line: 1, column: 58 },
      },
      {
        token: Token.BIT_NOT,
        literal: '~',
        start: { line: 1, column: 59 },
        end: { line: 1, column: 60 },
      },
      {
        token: Token.LOGIC_AND,
        literal: '&&',
        start: { line: 1, column: 61 },
        end: { line: 1, column: 63 },
      },
      {
        token: Token.LOGIC_OR,
        literal: '||',
        start: { line: 1, column: 64 },
        end: { line: 1, column: 66 },
      },
    ];
    expect(items).toEqual(expected);
  });

  it('should recognize keywords', () => {
    const input = 'let true false null func if else for while break continue return';
    const items: unknown[] = [];

    const lexer = new Lexer(input);
    for (let sym = lexer.nextSymbol(); sym.token !== Token.EOF; sym = lexer.nextSymbol()) {
      if (sym.token === Token.ILLEGAL) {
        const { start } = sym;
        throw new Error(`illegal token at ${start.line}:${start.column}`);
      }
      items.push(sym);
    }

    const expected = [
      {
        token: Token.LET,
        literal: 'let',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 4 },
      },
      {
        token: Token.TRUE,
        literal: 'true',
        start: { line: 1, column: 5 },
        end: { line: 1, column: 9 },
      },
      {
        token: Token.FALSE,
        literal: 'false',
        start: { line: 1, column: 10 },
        end: { line: 1, column: 15 },
      },
      {
        token: Token.NULL,
        literal: 'null',
        start: { line: 1, column: 16 },
        end: { line: 1, column: 20 },
      },
      {
        token: Token.FUNC,
        literal: 'func',
        start: { line: 1, column: 21 },
        end: { line: 1, column: 25 },
      },
      {
        token: Token.IF,
        literal: 'if',
        start: { line: 1, column: 26 },
        end: { line: 1, column: 28 },
      },
      {
        token: Token.ELSE,
        literal: 'else',
        start: { line: 1, column: 29 },
        end: { line: 1, column: 33 },
      },
      {
        token: Token.FOR,
        literal: 'for',
        start: { line: 1, column: 34 },
        end: { line: 1, column: 37 },
      },
      {
        token: Token.WHILE,
        literal: 'while',
        start: { line: 1, column: 38 },
        end: { line: 1, column: 43 },
      },
      {
        token: Token.BREAK,
        literal: 'break',
        start: { line: 1, column: 44 },
        end: { line: 1, column: 49 },
      },
      {
        token: Token.CONTINUE,
        literal: 'continue',
        start: { line: 1, column: 50 },
        end: { line: 1, column: 58 },
      },
      {
        token: Token.RETURN,
        literal: 'return',
        start: { line: 1, column: 59 },
        end: { line: 1, column: 65 },
      },
    ];
    expect(items).toEqual(expected);
  });

  it('should recognize identifiers', () => {
    const input = 'foO Bar a0 b123';
    const items: unknown[] = [];

    const lexer = new Lexer(input);
    for (let sym = lexer.nextSymbol(); sym.token !== Token.EOF; sym = lexer.nextSymbol()) {
      if (sym.token === Token.ILLEGAL) {
        const { start } = sym;
        throw new Error(`illegal token at ${start.line}:${start.column}`);
      }
      items.push(sym);
    }

    const expected = [
      {
        token: Token.IDENTIFIER,
        literal: 'foO',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 4 },
      },
      {
        token: Token.IDENTIFIER,
        literal: 'Bar',
        start: { line: 1, column: 5 },
        end: { line: 1, column: 8 },
      },
      {
        token: Token.IDENTIFIER,
        literal: 'a0',
        start: { line: 1, column: 9 },
        end: { line: 1, column: 11 },
      },
      {
        token: Token.IDENTIFIER,
        literal: 'b123',
        start: { line: 1, column: 12 },
        end: { line: 1, column: 16 },
      },
    ];
    expect(items).toEqual(expected);
  });

  it('should recognize number literals', () => {
    const input = '0 -1 1 -3.14 3.14 3e-3 0.1e2 +1.2e+5';
    const items: unknown[] = [];

    const lexer = new Lexer(input);
    for (let sym = lexer.nextSymbol(); sym.token !== Token.EOF; sym = lexer.nextSymbol()) {
      if (sym.token === Token.ILLEGAL) {
        const { start } = sym;
        throw new Error(`illegal token at ${start.line}:${start.column}`);
      }
      items.push(sym);
    }

    const expected = [
      {
        token: Token.NUMBER_LITERAL,
        literal: '0',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 2 },
      },
      {
        token: Token.MINUS,
        literal: '-',
        start: { line: 1, column: 3 },
        end: { line: 1, column: 4 },
      },
      {
        token: Token.NUMBER_LITERAL,
        literal: '1',
        start: { line: 1, column: 4 },
        end: { line: 1, column: 5 },
      },
      {
        token: Token.NUMBER_LITERAL,
        literal: '1',
        start: { line: 1, column: 6 },
        end: { line: 1, column: 7 },
      },
      {
        token: Token.MINUS,
        literal: '-',
        start: { line: 1, column: 8 },
        end: { line: 1, column: 9 },
      },
      {
        token: Token.NUMBER_LITERAL,
        literal: '3.14',
        start: { line: 1, column: 9 },
        end: { line: 1, column: 13 },
      },
      {
        token: Token.NUMBER_LITERAL,
        literal: '3.14',
        start: { line: 1, column: 14 },
        end: { line: 1, column: 18 },
      },
      {
        token: Token.NUMBER_LITERAL,
        literal: '3e-3',
        start: { line: 1, column: 19 },
        end: { line: 1, column: 23 },
      },
      {
        token: Token.NUMBER_LITERAL,
        literal: '0.1e2',
        start: { line: 1, column: 24 },
        end: { line: 1, column: 29 },
      },
      {
        token: Token.PLUS,
        literal: '+',
        start: { line: 1, column: 30 },
        end: { line: 1, column: 31 },
      },
      {
        token: Token.NUMBER_LITERAL,
        literal: '1.2e+5',
        start: { line: 1, column: 31 },
        end: { line: 1, column: 37 },
      },
    ];
    expect(items).toEqual(expected);
  });

  it('should recognize string literals', () => {
    const input = '"foo" "ba\\"r" "\\x00" "\\u0000"';
    const items: unknown[] = [];

    const lexer = new Lexer(input);
    for (let sym = lexer.nextSymbol(); sym.token !== Token.EOF; sym = lexer.nextSymbol()) {
      if (sym.token === Token.ILLEGAL) {
        const { start } = sym;
        throw new Error(`illegal token at ${start.line}:${start.column}`);
      }
      items.push(sym);
    }

    const expected = [
      {
        token: Token.STRING_LITERAL,
        literal: '"foo"',
        start: { line: 1, column: 1 },
        end: { line: 1, column: 6 },
      },
      {
        token: Token.STRING_LITERAL,
        literal: '"ba\\"r"',
        start: { line: 1, column: 7 },
        end: { line: 1, column: 14 },
      },
      {
        token: Token.STRING_LITERAL,
        literal: '"\\x00"',
        start: { line: 1, column: 15 },
        end: { line: 1, column: 21 },
      },
      {
        token: Token.STRING_LITERAL,
        literal: '"\\u0000"',
        start: { line: 1, column: 22 },
        end: { line: 1, column: 30 },
      },
    ];
    expect(items).toEqual(expected);
  });

  describe('error tokens', () => {
    it('should return error token when string literal across multi lines', () => {
      const input = '\n"123\n123"';

      const lexer = new Lexer(input);
      expect(lexer.nextSymbol()).toEqual({
        token: Token.ILLEGAL,
        literal: '',
        start: { line: 2, column: 1 },
        end: { line: 2, column: 1 },
      });
    });
  });
});
