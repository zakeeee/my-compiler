import { describe, expect, it } from 'vitest';
import { Lexer } from './lexer';
import { getTokenName, Token } from './token';

describe('Lexer', () => {
  it('should recognize operators and punctuations', () => {
    const input = '= + - * / % == ! != > >= < <= , ; . : ? ( ) { } [ ] & | ^ ~ && ||';
    const items: unknown[] = [];

    const lexer = new Lexer(input);
    for (let item = lexer.next(); item[1] !== Token.EOF; item = lexer.next()) {
      if (item[1] === Token.ILLEGAL) {
        const [pos] = item;
        throw new Error(`illegal token at ${pos.line}:${pos.column}`);
      }
      items.push(item);
    }

    const expected = [
      [{ line: 1, column: 1 }, Token.ASSIGN, '='],
      [{ line: 1, column: 3 }, Token.PLUS, '+'],
      [{ line: 1, column: 5 }, Token.MINUS, '-'],
      [{ line: 1, column: 7 }, Token.ASTERISK, '*'],
      [{ line: 1, column: 9 }, Token.SLASH, '/'],
      [{ line: 1, column: 11 }, Token.PERCENT, '%'],
      [{ line: 1, column: 13 }, Token.EQUALS, '=='],
      [{ line: 1, column: 16 }, Token.NOT, '!'],
      [{ line: 1, column: 18 }, Token.NOT_EQUALS, '!='],
      [{ line: 1, column: 21 }, Token.GREATER_THAN, '>'],
      [{ line: 1, column: 23 }, Token.GREATER_EQUAL_THAN, '>='],
      [{ line: 1, column: 26 }, Token.LESS_THAN, '<'],
      [{ line: 1, column: 28 }, Token.LESS_EQUAL_THAN, '<='],
      [{ line: 1, column: 31 }, Token.COMMA, ','],
      [{ line: 1, column: 33 }, Token.SEMICOLON, ';'],
      [{ line: 1, column: 35 }, Token.DOT, '.'],
      [{ line: 1, column: 37 }, Token.COLON, ':'],
      [{ line: 1, column: 39 }, Token.QUESTION_MARK, '?'],
      [{ line: 1, column: 41 }, Token.L_PAREN, '('],
      [{ line: 1, column: 43 }, Token.R_PAREN, ')'],
      [{ line: 1, column: 45 }, Token.L_BRACE, '{'],
      [{ line: 1, column: 47 }, Token.R_BRACE, '}'],
      [{ line: 1, column: 49 }, Token.L_BRACKET, '['],
      [{ line: 1, column: 51 }, Token.R_BRACKET, ']'],
      [{ line: 1, column: 53 }, Token.BIT_AND, '&'],
      [{ line: 1, column: 55 }, Token.BIT_OR, '|'],
      [{ line: 1, column: 57 }, Token.BIT_XOR, '^'],
      [{ line: 1, column: 59 }, Token.BIT_NOT, '~'],
      [{ line: 1, column: 61 }, Token.LOGIC_AND, '&&'],
      [{ line: 1, column: 64 }, Token.LOGIC_OR, '||'],
    ];
    expect(items).toEqual(expected);
  });

  it('should recognize keywords', () => {
    const input = 'let true false null func if else for while break continue return';
    const items: unknown[] = [];

    const lexer = new Lexer(input);
    for (let item = lexer.next(); item[1] !== Token.EOF; item = lexer.next()) {
      if (item[1] === Token.ILLEGAL) {
        const [pos] = item;
        throw new Error(`illegal token at ${pos.line}:${pos.column}`);
      }
      items.push(item);
    }

    const expected = [
      [{ line: 1, column: 1 }, Token.LET, 'let'],
      [{ line: 1, column: 5 }, Token.TRUE, 'true'],
      [{ line: 1, column: 10 }, Token.FALSE, 'false'],
      [{ line: 1, column: 16 }, Token.NULL, 'null'],
      [{ line: 1, column: 21 }, Token.FUNC, 'func'],
      [{ line: 1, column: 26 }, Token.IF, 'if'],
      [{ line: 1, column: 29 }, Token.ELSE, 'else'],
      [{ line: 1, column: 34 }, Token.FOR, 'for'],
      [{ line: 1, column: 38 }, Token.WHILE, 'while'],
      [{ line: 1, column: 44 }, Token.BREAK, 'break'],
      [{ line: 1, column: 50 }, Token.CONTINUE, 'continue'],
      [{ line: 1, column: 59 }, Token.RETURN, 'return'],
    ];
    expect(items).toEqual(expected);
  });

  it('should recognize identifiers', () => {
    const input = 'foO Bar a0 b123';
    const items: unknown[] = [];

    const lexer = new Lexer(input);
    for (let item = lexer.next(); item[1] !== Token.EOF; item = lexer.next()) {
      if (item[1] === Token.ILLEGAL) {
        const [pos] = item;
        throw new Error(`illegal token at ${pos.line}:${pos.column}`);
      }
      items.push(item);
    }

    const expected = [
      [{ line: 1, column: 1 }, Token.IDENTIFIER, 'foO'],
      [{ line: 1, column: 5 }, Token.IDENTIFIER, 'Bar'],
      [{ line: 1, column: 9 }, Token.IDENTIFIER, 'a0'],
      [{ line: 1, column: 12 }, Token.IDENTIFIER, 'b123'],
    ];
    expect(items).toEqual(expected);
  });

  it('should recognize number literals', () => {
    const input = '0 -1 1 -3.14 3.14 3e-3 0.1e2 +1.2e+5';
    const items: unknown[] = [];

    const lexer = new Lexer(input);
    for (let item = lexer.next(); item[1] !== Token.EOF; item = lexer.next()) {
      if (item[1] === Token.ILLEGAL) {
        const [pos] = item;
        throw new Error(`illegal token at ${pos.line}:${pos.column}`);
      }
      items.push(item);
    }

    const expected = [
      [{ line: 1, column: 1 }, Token.NUMBER_LITERAL, '0'],
      [{ line: 1, column: 3 }, Token.MINUS, '-'],
      [{ line: 1, column: 4 }, Token.NUMBER_LITERAL, '1'],
      [{ line: 1, column: 6 }, Token.NUMBER_LITERAL, '1'],
      [{ line: 1, column: 8 }, Token.MINUS, '-'],
      [{ line: 1, column: 9 }, Token.NUMBER_LITERAL, '3.14'],
      [{ line: 1, column: 14 }, Token.NUMBER_LITERAL, '3.14'],
      [{ line: 1, column: 19 }, Token.NUMBER_LITERAL, '3e-3'],
      [{ line: 1, column: 24 }, Token.NUMBER_LITERAL, '0.1e2'],
      [{ line: 1, column: 30 }, Token.PLUS, '+'],
      [{ line: 1, column: 31 }, Token.NUMBER_LITERAL, '1.2e+5'],
    ];
    expect(items).toEqual(expected);
  });

  it('should recognize string literals', () => {
    const input = '"foo" "ba\\"r" "\\x00" "\\u0000"';
    const items: unknown[] = [];

    const lexer = new Lexer(input);
    for (let item = lexer.next(); item[1] !== Token.EOF; item = lexer.next()) {
      if (item[1] === Token.ILLEGAL) {
        const [pos] = item;
        throw new Error(`illegal token at ${pos.line}:${pos.column}`);
      }
      items.push(item);
    }

    const expected = [
      [{ line: 1, column: 1 }, Token.STRING_LITERAL, '"foo"'],
      [{ line: 1, column: 7 }, Token.STRING_LITERAL, '"ba\\"r"'],
      [{ line: 1, column: 15 }, Token.STRING_LITERAL, '"\\x00"'],
      [{ line: 1, column: 22 }, Token.STRING_LITERAL, '"\\u0000"'],
    ];
    expect(items).toEqual(expected);
  });

  describe('error tokens', () => {
    it('should return error token when string literal across multi lines', () => {
      const input = '\n"123\n123"';

      const lexer = new Lexer(input);
      expect(lexer.next()).toEqual([{ line: 2, column: 1 }, Token.ILLEGAL, '']);
    });
  });
});
