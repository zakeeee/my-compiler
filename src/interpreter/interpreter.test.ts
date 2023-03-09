import { Lexer } from 'src/lexer';
import { Parser } from 'src/parser/parser';
import { describe, test } from 'vitest';
import { Interpreter } from './interpreter';
import { Resolver } from './resolver';

describe('Interpreter', () => {
  test('foo', () => {
    //     const input = `\
    // func gen(n) {
    //   let i = 0;
    //   return func () {
    //     if (i < n) {
    //       let ret = i;
    //       i += 1;
    //       return ret;
    //     } else
    //       return null;
    //   };
    // }
    // let g1;
    // g1 = gen(10);
    // let g2 = gen(12);
    // print(str(g1));
    // for (let i = 0; i < 12; i += 1) {
    //   print("====== g1", g1());
    //   print("====== g2", g2());
    // }
    // `

    const input = `\
func fib(n) {
  if (n == 1) return 1;
  if (n == 2) return 1;
  let a = 1, b = 1;
  for (let i = 2; i < n; i += 1) {
    let tmp = a;
    a = b;
    b += tmp;
  }
  return b;
}
print(fib(20));
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const prog = parser.parse();
    if (!prog) {
      throw new Error('has syntax error');
    }
    const resolver = new Resolver();
    const locals = resolver.run(prog);
    const interpreter = new Interpreter(locals);
    interpreter.visitProgram(prog);
  });
});
