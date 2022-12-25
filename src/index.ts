import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Interpreter } from './interpreter/interpreter'
import { Resolver } from './interpreter/resolver'
import { Lexer } from './lexer'
import { Parser } from './parser/parser'

function main() {
  const { argv } = process

  if (argv.length <= 2) {
    return
  }
  const fileName = argv[2]
  const path = resolve(process.cwd(), fileName)
  const content = readFileSync(path, { encoding: 'utf-8' })
  const lexer = new Lexer(content)
  const parser = new Parser(lexer)
  const prog = parser.parse()
  if (!prog) {
    throw new Error('has syntax error')
  }
  const resolver = new Resolver()
  const locals = resolver.run(prog)
  const interpreter = new Interpreter(locals)
  interpreter.run(prog)
}

// usage: tsx src/index.ts <filepath>
main()
