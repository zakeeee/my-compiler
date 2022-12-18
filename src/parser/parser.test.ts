import { Lexer } from 'src/lexer';
import { describe, it } from 'vitest';
import { Parser } from './parser';
import { inspect } from 'node:util';

describe('Parser', () => {
  it('should parse let statement', () => {
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
    // console.log(inspect(prog, false, null));
  });

  it('should parse func declaration statement', () => {
    const input = `\
func foo() {
  func bar(x, y) {
    print(x, y);
  }
  print(bar(1, 2));
}
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const prog = parser.parseProgram();
    console.log(inspect(prog, false, null));
  });
});
