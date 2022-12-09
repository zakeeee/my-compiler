import {describe, expect, it} from 'vitest';
import {Lexer} from './lexer';
import {Token, TokenType} from './token';

describe('Lexer', () => {
  it('should parse number', () => {
    const input = '0 -1 1 -3.14 3.14 3e-3 0.1e2 -1.2e+5';
    const parsedNumbers: number[] = [];

    const lexer = new Lexer(input);
    for (let t = lexer.nextToken(); t.type !== TokenType.EOF; t = lexer.nextToken()) {
      if (t.type === TokenType.ERROR) {
        throw new Error('error token');
      }
      parsedNumbers.push(t.value as number);
    }
    expect(parsedNumbers).toEqual([0, -1, 1, -3.14, 3.14, 3e-3, 0.1e2, -1.2e5]);
  });
});
