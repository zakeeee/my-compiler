import { Lexer } from 'src/lexer'
import { Parser } from 'src/parser/parser'
import { describe, test } from 'vitest'
import { evalProgram } from './evaluate'
import { Scope } from './scope'

describe('Evaluate', () => {
  test('foo', () => {
    // const input = `\
    // let i = 0;
    // while (i < 10) {
    //   i = i + 1;
    //   if (i % 2 != 0) {
    //     continue;
    //   }
    //   print(i);
    // }
    //     `
    // const input = `\
    // func fib(n) {
    //   if (n == 1) return 1;
    //   if (n == 2) return 1;
    //   return fib(n - 1) + fib(n - 2);
    // }
    // print(fib(10));
    //     `
    const input = `\
func gen(n) {
  let i = 0;
  return func () {
    if (i < n) {
      let ret = i;
      i = i + 1;
      return ret;
    } else {
      return null;
    }
  };
}
let g = gen(10);
let i = 0;
for (; i < 12; i = i + 1) {
  print(g());
}
`
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const prog = parser.parseProgram()
    const scope = new Scope()
    evalProgram(prog, scope)
  })
})
