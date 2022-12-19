import { Lexer } from 'src/lexer'
import { Parser } from 'src/parser/parser'
import { describe, test } from 'vitest'
import { evalProgram } from './evaluate'
import { Scope } from './scope'

describe('Builtins', () => {
  test('', () => {
    const input = `\
func add(a, b) {
  return a + b;
}
return add("1", "2");
    `
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const prog = parser.parseProgram()
    const scope = new Scope()
    console.log(evalProgram(prog, scope))
  })
})
