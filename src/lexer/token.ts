export enum Token {
  // special
  ILLEGAL = -2,
  EOF,
  COMMENT,

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
  ASTERISK, // *
  SLASH, // /
  BACK_SLASH, // \
  PERCENT, // %
  EQUAL, // ==
  NOT, // !
  NOT_EQUAL, // !=
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
  COMMA, // ,
  SEMICOLON, // ;
  DOT, // .
  COLON, // :
  QUESTION_MARK, // ?
  L_PAREN, // (
  R_PAREN, // )
  L_BRACE, // {
  R_BRACE, // }
  L_BRACKET, // [
  R_BRACKET, // ]
}

const tokenNameMap = Object.freeze({
  // special
  [Token.ILLEGAL]: 'Illegal',
  [Token.EOF]: 'EOF',
  [Token.COMMENT]: 'Comment',

  [Token.IDENTIFIER]: 'Identifier',
  [Token.NUMBER_LITERAL]: 'NumberLiteral',
  [Token.STRING_LITERAL]: 'StringLiteral',

  // keywords
  [Token.LET]: 'let',
  [Token.TRUE]: 'true',
  [Token.FALSE]: 'false',
  [Token.NULL]: 'null',
  [Token.FUNC]: 'func',
  [Token.IF]: 'if',
  [Token.ELSE]: 'else',
  [Token.FOR]: 'for',
  [Token.WHILE]: 'while',
  [Token.BREAK]: 'break',
  [Token.CONTINUE]: 'continue',
  [Token.RETURN]: 'return',

  // operators and punctuations
  [Token.ASSIGN]: '=',
  [Token.PLUS]: '+',
  [Token.MINUS]: '-',
  [Token.ASTERISK]: '*',
  [Token.SLASH]: '/',
  [Token.BACK_SLASH]: '\\',
  [Token.PERCENT]: '%',
  [Token.EQUAL]: '==',
  [Token.NOT]: '!',
  [Token.NOT_EQUAL]: '!=',
  [Token.GREATER_THAN]: '>',
  [Token.GREATER_THAN_EQUAL]: '>=',
  [Token.LESS_THAN]: '<',
  [Token.LESS_THAN_EQUAL]: '<=',
  [Token.BIT_AND]: '&',
  [Token.BIT_OR]: '|',
  [Token.BIT_XOR]: '^',
  [Token.BIT_NOT]: '~',
  [Token.LOGIC_AND]: '&&',
  [Token.LOGIC_OR]: '||',
  [Token.COMMA]: ',',
  [Token.SEMICOLON]: ';',
  [Token.DOT]: '.',
  [Token.COLON]: ':',
  [Token.QUESTION_MARK]: '?',
  [Token.L_PAREN]: '(',
  [Token.R_PAREN]: ')',
  [Token.L_BRACE]: '{',
  [Token.R_BRACE]: '}',
  [Token.L_BRACKET]: '[',
  [Token.R_BRACKET]: ']',
})

export function getTokenName(token: Token): string {
  return tokenNameMap[token]
}

const keywordTokenMap = Object.freeze({
  let: Token.LET,
  true: Token.TRUE,
  false: Token.FALSE,
  null: Token.NULL,
  func: Token.FUNC,
  if: Token.IF,
  else: Token.ELSE,
  for: Token.FOR,
  while: Token.WHILE,
  break: Token.BREAK,
  continue: Token.CONTINUE,
  return: Token.RETURN,
})

export function isKeyword(word: string): word is keyof typeof keywordTokenMap {
  return keywordTokenMap.hasOwnProperty(word)
}

export function getKeywordToken<T extends keyof typeof keywordTokenMap>(keyword: T): Token {
  return keywordTokenMap[keyword]
}
