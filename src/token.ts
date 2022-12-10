export enum TokenType {
  KEYWORD = 'Keyword',
  IDENTIFIER = 'Identifier',
  STRING_LITERAL = 'StringLiteral',
  NUMBER_LITERAL = 'NumberLiteral',

  // operators
  ASSIGN = '=',
  PLUS = '+',
  MINUS = '-',
  ASTERISK = '*',
  SLASH = '/',
  EQUAL = '==',
  NOT = '!',
  NOT_EQUAL = '!=',
  GREATER_THAN = '>',
  GREATER_EQUAL_THAN = '>=',
  LESS_THAN = '<',
  LESS_EQUAL_THAN = '<=',

  // punctuations
  COMMA = ',',
  SEMICOLON = ';',
  L_PAREN = '(',
  R_PAREN = ')',
  L_BRACE = '{',
  R_BRACE = '}',
  L_BRACKET = '[',
  R_BRACKET = ']',

  // others
  EOF = 'EOF',
  ERROR = 'ERROR',
}

export interface Token {
  readonly type: TokenType;
  readonly value?: unknown;
}

export function createToken(type: TokenType, value?: unknown): Token {
  return {
    type,
    value,
  };
}

const keywords = new Set([
  'let',
  'true',
  'false',
  'func',
  'if',
  'else',
  'for',
  'while',
  'break',
  'continue',
  'return',
]);

export const Tokens = Object.freeze({
  // keywords
  LET: createToken(TokenType.KEYWORD, 'let'),
  TRUE: createToken(TokenType.KEYWORD, 'true'),
  FALSE: createToken(TokenType.KEYWORD, 'false'),
  FUNC: createToken(TokenType.KEYWORD, 'func'),
  IF: createToken(TokenType.KEYWORD, 'if'),
  ELSE: createToken(TokenType.KEYWORD, 'else'),
  FOR: createToken(TokenType.KEYWORD, 'for'),
  WHILE: createToken(TokenType.KEYWORD, 'while'),
  BREAK: createToken(TokenType.KEYWORD, 'break'),
  CONTINUE: createToken(TokenType.KEYWORD, 'continue'),
  RETURN: createToken(TokenType.KEYWORD, 'return'),

  // operators
  ASSIGN: createToken(TokenType.ASSIGN),
  PLUS: createToken(TokenType.PLUS),
  MINUS: createToken(TokenType.MINUS),
  ASTERISK: createToken(TokenType.ASTERISK),
  SLASH: createToken(TokenType.SLASH),
  EQUAL: createToken(TokenType.EQUAL),
  NOT: createToken(TokenType.NOT),
  NOT_EQUAL: createToken(TokenType.NOT_EQUAL),
  GREATER_THAN: createToken(TokenType.GREATER_THAN),
  GREATER_EQUAL_THAN: createToken(TokenType.GREATER_EQUAL_THAN),
  LESS_THAN: createToken(TokenType.LESS_THAN),
  LESS_EQUAL_THAN: createToken(TokenType.LESS_EQUAL_THAN),

  // punctuations
  COMMA: createToken(TokenType.COMMA),
  SEMICOLON: createToken(TokenType.SEMICOLON),
  L_PAREN: createToken(TokenType.L_PAREN),
  R_PAREN: createToken(TokenType.R_PAREN),
  L_BRACE: createToken(TokenType.L_BRACE),
  R_BRACE: createToken(TokenType.R_BRACE),
  L_BRACKET: createToken(TokenType.L_BRACKET),
  R_BRACKET: createToken(TokenType.R_BRACKET),

  // others
  EOF: createToken(TokenType.EOF),
  ERROR: createToken(TokenType.ERROR),
});

export function isKeyword(word: string): boolean {
  return keywords.has(word);
}

export function getKeywordToken(keyword: string): Token | null {
  return Tokens[keyword.toUpperCase() as keyof typeof Tokens] || null;
}
