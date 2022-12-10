import { describe, expect, it } from 'vitest';
import { Lexer } from './lexer';
import { createToken, Token, Tokens, TokenType } from './token';

describe('Lexer', () => {
  it('should recognize operators and punctuations', () => {
    const input = '= + - * / == ! != > >= < <= , ; ( ) { } [ ]';
    const tokens: Token[] = [];

    const lexer = new Lexer(input);
    for (let t = lexer.nextToken(); t.type !== TokenType.EOF; t = lexer.nextToken()) {
      if (t.type === TokenType.ERROR) {
        throw new Error('error token');
      }
      tokens.push(t);
    }

    const expectedTokens: Token[] = [
      Tokens.ASSIGN,
      Tokens.PLUS,
      Tokens.MINUS,
      Tokens.ASTERISK,
      Tokens.SLASH,
      Tokens.EQUAL,
      Tokens.NOT,
      Tokens.NOT_EQUAL,
      Tokens.GREATER_THAN,
      Tokens.GREATER_EQUAL_THAN,
      Tokens.LESS_THAN,
      Tokens.LESS_EQUAL_THAN,
      Tokens.COMMA,
      Tokens.SEMICOLON,
      Tokens.L_PAREN,
      Tokens.R_PAREN,
      Tokens.L_BRACE,
      Tokens.R_BRACE,
      Tokens.L_BRACKET,
      Tokens.R_BRACKET,
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should recognize keywords', () => {
    const input = 'let true false func if else for while break continue return';
    const tokens: Token[] = [];

    const lexer = new Lexer(input);
    for (let t = lexer.nextToken(); t.type !== TokenType.EOF; t = lexer.nextToken()) {
      if (t.type === TokenType.ERROR) {
        throw new Error('error token');
      }
      tokens.push(t);
    }

    const expectedTokens: Token[] = [
      Tokens.LET,
      Tokens.TRUE,
      Tokens.FALSE,
      Tokens.FUNC,
      Tokens.IF,
      Tokens.ELSE,
      Tokens.FOR,
      Tokens.WHILE,
      Tokens.BREAK,
      Tokens.CONTINUE,
      Tokens.RETURN,
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should recognize identifiers', () => {
    const input = 'foO Bar a0 b123';
    const tokens: Token[] = [];

    const lexer = new Lexer(input);
    for (let t = lexer.nextToken(); t.type !== TokenType.EOF; t = lexer.nextToken()) {
      if (t.type === TokenType.ERROR) {
        throw new Error('error token');
      }
      tokens.push(t);
    }

    const expectedTokens: Token[] = [
      createToken(TokenType.IDENTIFIER, 'foO'),
      createToken(TokenType.IDENTIFIER, 'Bar'),
      createToken(TokenType.IDENTIFIER, 'a0'),
      createToken(TokenType.IDENTIFIER, 'b123'),
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should recognize number literals', () => {
    const input = '0 -1 1 -3.14 3.14 3e-3 0.1e2 -1.2e+5';
    const tokens: Token[] = [];

    const lexer = new Lexer(input);
    for (let t = lexer.nextToken(); t.type !== TokenType.EOF; t = lexer.nextToken()) {
      if (t.type === TokenType.ERROR) {
        throw new Error('error token');
      }
      tokens.push(t);
    }

    const expectedTokens: Token[] = [
      { type: TokenType.NUMBER_LITERAL, value: 0 },
      Tokens.MINUS,
      { type: TokenType.NUMBER_LITERAL, value: 1 },
      { type: TokenType.NUMBER_LITERAL, value: 1 },
      Tokens.MINUS,
      { type: TokenType.NUMBER_LITERAL, value: 3.14 },
      { type: TokenType.NUMBER_LITERAL, value: 3.14 },
      { type: TokenType.NUMBER_LITERAL, value: 3e-3 },
      { type: TokenType.NUMBER_LITERAL, value: 0.1e2 },
      Tokens.MINUS,
      { type: TokenType.NUMBER_LITERAL, value: 1.2e5 },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should recognize string literals', () => {
    const input = '"foo" "ba\\"r" "\\x00" "\\u0000"';
    const tokens: Token[] = [];

    const lexer = new Lexer(input);
    for (let t = lexer.nextToken(); t.type !== TokenType.EOF; t = lexer.nextToken()) {
      if (t.type === TokenType.ERROR) {
        throw new Error('error token');
      }
      tokens.push(t);
    }

    const expectedTokens: Token[] = [
      createToken(TokenType.STRING_LITERAL, '"foo"'),
      createToken(TokenType.STRING_LITERAL, '"ba\\"r"'),
      createToken(TokenType.STRING_LITERAL, '"\\x00"'),
      createToken(TokenType.STRING_LITERAL, '"\\u0000"'),
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  describe('error tokens', () => {
    it('should return error token when string literal across multi lines', () => {
      const input = '"123\n123"';

      const lexer = new Lexer(input);
      expect(lexer.nextToken()).toEqual(Tokens.ERROR);
    });
  });
});
