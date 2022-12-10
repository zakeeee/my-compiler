grammar Pop
  ;

program: statementList? EOF;

letStatement: LET Identifier '=' singleExpression;
ifStatement: IF '(' singleExpression ')' '{' statementList? '}' (ELSE '{' statementList? '}')?;
forStatement
  : FOR '(' singleExpression? ';' singleExpression? ';' singleExpression? ')' '{' statementList? '}'
  ;
whileStatement: WHILE '(' singleExpression ')' '{' statementList? '}';
continueStatement: CONTINUE;
breakStatement: BREAK;
returnStatement: RETURN singleExpression?;
statement
  : letStatement
  | ifStatement
  | forStatement
  | whileStatement
  | continueStatement
  | breakStatement
  | returnStatement
  ;
statementList: (statement ';')*;

parameterList: Identifier (',' Identifier)*;
expressionSequence: singleExpression (',' singleExpression)*;
singleExpression
  : FUNC Identifier? '(' parameterList? ')' '{' statementList? '}' # FunctionExpression
  | singleExpression '[' expressionSequence ']'                    # MemberIndexExpression
  | singleExpression '.' (Identifier | keywords)                   # MemberDotExpression
  | singleExpression '(' expressionSequence? ')'                   # ArgumentsExpression
  | '+' singleExpression                                           # UnaryPlusExpression
  | '-' singleExpression                                           # UnaryMinusExpression
  | '~' singleExpression                                           # BitNotExpression
  | '!' singleExpression                                           # NotExpression
  | singleExpression ('*' | '/' | '%') singleExpression            # MultiplicativeExpression
  | singleExpression ('+' | '-') singleExpression                  # AdditiveExpression
  | singleExpression ('<' | '>' | '<=' | '>=') singleExpression    # RelationalExpression
  | singleExpression ('==' | '!=') singleExpression                # EqualityExpression
  | singleExpression '&' singleExpression                          # BitAndExpression
  | singleExpression '|' singleExpression                          # BitOrExpression
  | singleExpression '^' singleExpression                          # BitXOrExpression
  | singleExpression '&&' singleExpression                         # LogicalAndExpression
  | singleExpression '||' singleExpression                         # LogicalOrExpression
  | singleExpression '=' expressionSequence                        # AssignmentExpression
  | Identifier                                                     # IdentifierExpression
  | literal                                                        # LiteralExpression
  | '[' expressionSequence? ']'                                    # ArrayLiteralExpression
  | '(' expressionSequence ')'                                     # ParenthesizedExpression
  ;

Identifier: [A-Za-z][A-Za-z0-9]*;
nullLiteral: NULL;
booleanLiteral: TRUE | FALSE;
stringLiteral: '"' StringCharacter* '"';
numberLiteral
  : DecimalIntegerLiteral '.' DecimalDigit* ExponentPart?
  | DecimalIntegerLiteral ExponentPart?
  ;
literal: nullLiteral | booleanLiteral | stringLiteral | numberLiteral;

keywords: LET | TRUE | FALSE | NULL | FUNC | IF | ELSE | FOR | WHILE | BREAK | CONTINUE | RETURN;

LET: 'let';
TRUE: 'true';
FALSE: 'false';
NULL: 'null';
FUNC: 'func';
IF: 'if';
ELSE: 'else';
FOR: 'for';
WHILE: 'while';
BREAK: 'break';
CONTINUE: 'continue';
RETURN: 'return';

fragment DecimalDigit: [0-9];

fragment HexDigit: [0-9a-fA-F];

fragment DecimalIntegerLiteral: '0' | [1-9] DecimalDigit*;

fragment ExponentPart: [eE] [+-]? DecimalDigit+;

fragment StringCharacter: ~["\\\r\n] | '\\' EscapeSequence;

fragment EscapeSequence: CharacterEscapeSequence | HexEscapeSequence | UnicodeEscapeSequence;

fragment CharacterEscapeSequence: ["\\bfnrtv] | ~["\\bfnrtv0-9xu\r\n];

fragment HexEscapeSequence: 'x' HexDigit HexDigit;

fragment UnicodeEscapeSequence: 'u' HexDigit HexDigit HexDigit HexDigit;