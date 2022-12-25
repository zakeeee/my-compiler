import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Evaluator from './interpreter/evaluator'
import { Scope } from './interpreter/scope'
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
    throw new Error('has parse error')
  }
  const scope = new Scope()
  const evaluator = new Evaluator()
  evaluator.setScope(scope)
  evaluator.visitProgram(prog)
}

// usage: tsx src/index.ts <filepath>
main()
