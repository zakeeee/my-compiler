import { getTokenName, Token, TokenType } from './lexer';

export const getLiteralValue = (token: Token) => {
  const tokenType = token.type;
  const tokenName = getTokenName(tokenType);
  switch (tokenType) {
    case TokenType.NULL:
      return null;
    case TokenType.TRUE:
    case TokenType.FALSE:
      return tokenType === TokenType.TRUE;
    case TokenType.NUMBER_LITERAL:
      return +token.lexeme;
    case TokenType.STRING_LITERAL:
      // TODO escape character
      return token.lexeme.slice(1, -1);
    default:
      throw new Error(`cannot get literal value of token type "${tokenName}"`);
  }
};
