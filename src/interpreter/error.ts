import { Position } from 'src/lexer/lexer'

export class PopError {
  protected name: string = 'Error'
  private errorStack: string[] = []

  constructor(private message: string) {
    this.errorStack.push(`${this.name}: ${this.message}`)
  }

  pushStack(pos: Position) {
    const { line, column } = pos
    this.errorStack.push(`    at ${line}:${column}`)
  }

  printStack(): string {
    return this.errorStack.reverse().join('\n')
  }
}

export class PopNameError extends PopError {
  protected name: string = 'NameError'
}
