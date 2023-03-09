import { inspect } from 'node:util';
import { describe, expect, test } from 'vitest';
import { Lexer } from '../lexer';
import { Parser } from './parser';

describe('Parser', () => {
  test('let statement', () => {
    const input = `\
a = b = c;
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const prog = parser.parse();
    // console.log(inspect(prog, false, null));
  });

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
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const prog = parser.parse();
    // console.log(inspect(prog, false, null));
  });

  test('unary expression', () => {
    const input = `\
+1;
-(+foo);
!(false);
~123;
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const prog = parser.parse();
    // console.log(inspect(prog, false, null));
  });

  test('parse', () => {
    const input = `\
func foo() {
  print("foo");
}

let bar = func () {
  print("bar");
};

class A {
  foo() {
    print("foo A");
  }

  static bar() {
    print("bar");
  }
}

class B extends A {
  foo() {
    print("foo B");
  }
}
`;
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const prog = parser.parse();
    expect(prog).not.toBe(null);
    console.log(inspect(prog, false, null));
  });
});
