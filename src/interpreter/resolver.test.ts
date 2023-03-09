import { Lexer } from 'src/lexer';
import { Parser } from 'src/parser/parser';
import { describe, test } from 'vitest';
import { Resolver } from './resolver';

describe('Resolver', () => {
  test('foo', () => {
    const input = `\
class A {
  foo() {
    let a = "A";
    print("this is " + a);
  }
}

class B extends A {
  foo() {
    let a = "B";
    print("this is " + a);
  }
}

let a = new B();
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const prog = parser.parse();
    if (!prog) {
      throw new Error('has syntax error');
    }
    const resolver = new Resolver();
    const locals = resolver.run(prog);
    console.log(locals);
  });
});
