export enum TokenType {
  IDENTIFIER = 'Identifier',
  STRING_LITERAL = 'StringLiteral',
  NUMBER_LITERAL = 'NumberLiteral',
  KEYWORD = 'Keyword',

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

  COMMA = ',',
  SEMICOLON = ';',
  L_PAREN = '(',
  R_PAREN = ')',
  L_BRACE = '{',
  R_BRACE = '}',
  L_BRACKET = '[',
  R_BRACKET = ']',

  // Special Token Type
  EOF = 'EOF',
  ERROR = 'ERROR',
}

export interface Token {
  type: TokenType;
  literal: string;
  value?: string | number | boolean;
}

export function createToken(
  type: TokenType,
  literal: string,
  value?: string | number | boolean
): Token {
  return {
    type,
    literal,
    value,
  };
}

const keywords = [
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
] as const;

type KeywordTokens = {
  [k: string]: Token;
};

export const keywordTokens = keywords.reduce((prev, keyword) => {
  if (keyword === 'true' || keyword === 'false') {
    return {
      ...prev,
      [keyword]: createToken(TokenType.KEYWORD, keyword, keyword === 'true'),
    };
  }
  return {
    ...prev,
    [keyword]: createToken(TokenType.KEYWORD, keyword),
  };
}, {}) as KeywordTokens;
