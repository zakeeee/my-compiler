import { Lexer } from '../lexer'
import { describe, test } from 'vitest'
import { Parser } from './parser'
import { inspect } from 'node:util'

describe('Parser', () => {
  test('let statement', () => {
    const input = `\
let a = 1;
let b = "12321312";
let c = true;
let d = null;
let e = (foo);
let f = e(1, 2, bar("asdf", foo));
`
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const prog = parser.parseProgram()
    // console.log(inspect(prog, false, null));
  })

  test('func declaration statement', () => {
    const input = `\
func foo() {
  func bar(x, y) {
    print(x, y);
  }
  print(bar(1, 2));
}
let foo2 = func () {
  print("this is foo2");
};
`
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const prog = parser.parseProgram()
    // console.log(inspect(prog, false, null));
  })

  test('unary expression', () => {
    const input = `\
+1;
-(+foo);
!(false);
~123;
`
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const prog = parser.parseProgram()
    // console.log(inspect(prog, false, null));
  })

  test('parse', () => {
    const input = `\
let a = {"a": 1, "b": "foo"};
let b = [1, 2, 3];
`
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const prog = parser.parseProgram()
    // console.log(inspect(prog, false, null));
  })
})
