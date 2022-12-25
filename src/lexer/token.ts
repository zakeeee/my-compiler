import { IPosition } from 'src/types'

export enum TokenType {
  // special
  ILLEGAL = -2,
  EOF,

  // literals
  IDENTIFIER,
  NUMBER_LITERAL,
  STRING_LITERAL,

  // keywords
  LET, // let
  TRUE, // true
  FALSE, // false
  NULL, // null
  FUNC, // func
  IF, // if
  ELSE, // else
  FOR, // for
  WHILE, // while
  BREAK, // break
  CONTINUE, // continue
  RETURN, // return

  // operators and punctuations
  ASSIGN, // =
  PLUS, // +
  MINUS, // -
  STAR, // *
  SLASH, // /
  BACK_SLASH, // \
  PERCENT, // %
  EQUAL, // ==
  BANG, // !
  BANG_EQUAL, // !=
  GREATER_THAN, // >
  GREATER_THAN_EQUAL, // >=
  LESS_THAN, // <
  LESS_THAN_EQUAL, // <=
  BIT_AND, // &
  BIT_OR, // |
  BIT_XOR, // ^
  BIT_NOT, // ~
  LOGIC_AND, // &&
  LOGIC_OR, // ||
  STAR_EQUAL, // *=
  SLASH_EQUAL, // /=
  PERCENT_EQUAL, // %=
  PLUS_EQUAL, // +=
  MINUS_EQUAL, // -=
  BIT_AND_EQUAL, // &=
  BIT_OR_EQUAL, // |=
  BIT_XOR_EQUAL, // ^=

  COMMA, // ,
  SEMICOLON, // ;
  DOT, // .
  COLON, // :
  QUESTION, // ?
  L_PAREN, // (
  R_PAREN, // )
  L_BRACE, // {
  R_BRACE, // }
  L_BRACKET, // [
  R_BRACKET, // ]
}

const tokenTypeNameMap = Object.freeze({
  // special
  [TokenType.ILLEGAL]: 'Illegal',
  [TokenType.EOF]: 'EOF',

  [TokenType.IDENTIFIER]: 'Identifier',
  [TokenType.NUMBER_LITERAL]: 'NumberLiteral',
  [TokenType.STRING_LITERAL]: 'StringLiteral',

  // keywords
  [TokenType.LET]: 'let',
  [TokenType.TRUE]: 'true',
  [TokenType.FALSE]: 'false',
  [TokenType.NULL]: 'null',
  [TokenType.FUNC]: 'func',
  [TokenType.IF]: 'if',
  [TokenType.ELSE]: 'else',
  [TokenType.FOR]: 'for',
  [TokenType.WHILE]: 'while',
  [TokenType.BREAK]: 'break',
  [TokenType.CONTINUE]: 'continue',
  [TokenType.RETURN]: 'return',

  // operators and punctuations
  [TokenType.ASSIGN]: '=',
  [TokenType.PLUS]: '+',
  [TokenType.MINUS]: '-',
  [TokenType.STAR]: '*',
  [TokenType.SLASH]: '/',
  [TokenType.BACK_SLASH]: '\\',
  [TokenType.PERCENT]: '%',
  [TokenType.EQUAL]: '==',
  [TokenType.BANG]: '!',
  [TokenType.BANG_EQUAL]: '!=',
  [TokenType.GREATER_THAN]: '>',
  [TokenType.GREATER_THAN_EQUAL]: '>=',
  [TokenType.LESS_THAN]: '<',
  [TokenType.LESS_THAN_EQUAL]: '<=',
  [TokenType.BIT_AND]: '&',
  [TokenType.BIT_OR]: '|',
  [TokenType.BIT_XOR]: '^',
  [TokenType.BIT_NOT]: '~',
  [TokenType.LOGIC_AND]: '&&',
  [TokenType.LOGIC_OR]: '||',
  [TokenType.STAR_EQUAL]: '*=',
  [TokenType.SLASH_EQUAL]: '/=',
  [TokenType.PERCENT_EQUAL]: '%=',
  [TokenType.PLUS_EQUAL]: '+=',
  [TokenType.MINUS_EQUAL]: '-=',
  [TokenType.BIT_AND_EQUAL]: '&=',
  [TokenType.BIT_OR_EQUAL]: '|=',
  [TokenType.BIT_XOR_EQUAL]: '^=',

  [TokenType.COMMA]: ',',
  [TokenType.SEMICOLON]: ';',
  [TokenType.DOT]: '.',
  [TokenType.COLON]: ':',
  [TokenType.QUESTION]: '?',
  [TokenType.L_PAREN]: '(',
  [TokenType.R_PAREN]: ')',
  [TokenType.L_BRACE]: '{',
  [TokenType.R_BRACE]: '}',
  [TokenType.L_BRACKET]: '[',
  [TokenType.R_BRACKET]: ']',
})

export function getTokenName(tokenType: TokenType): string {
  return tokenTypeNameMap[tokenType]
}

const keywordTokenTypeMap = Object.freeze({
  let: TokenType.LET,
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  null: TokenType.NULL,
  func: TokenType.FUNC,
  if: TokenType.IF,
  else: TokenType.ELSE,
  for: TokenType.FOR,
  while: TokenType.WHILE,
  break: TokenType.BREAK,
  continue: TokenType.CONTINUE,
  return: TokenType.RETURN,
})

export function isKeyword(word: string): word is keyof typeof keywordTokenTypeMap {
  return keywordTokenTypeMap.hasOwnProperty(word)
}

export function getKeywordTokenType<T extends keyof typeof keywordTokenTypeMap>(
  keyword: T
): TokenType {
  return keywordTokenTypeMap[keyword]
}

export class Token {
  constructor(
    public type: TokenType,
    public lexeme: string,
    public start: IPosition,
    public end: IPosition
  ) {}
}
