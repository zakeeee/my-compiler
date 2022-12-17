import { Lexer } from 'src/lexer';
import { describe, it } from 'vitest';
import { Parser } from './parser';

describe('Parser', () => {
  it('should parse', () => {
    const input = `\
let a = 1;
let b = "12321312";
let c = true;
let d = null;
let e = (foo);
let f = e(1, 2, bar("asdf", foo));
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const prog = parser.parseProgram();
    console.log(JSON.stringify(prog, null, 2));
  });
});
