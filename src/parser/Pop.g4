grammar Pop
  ;

program: statementList? EOF;

statement
  : block
  | emptyStatement
  | expressionStatement
  | letStatement
  | functionStatement
  | ifStatement
  | forStatement
  | whileStatement
  | continueStatement
  | breakStatement
  | returnStatement
  ;

statementList: statement+;

block: '{' statementList? '}';

emptyStatement: ';';

expressionStatement: expressionSequence;

letStatement: LET Identifier '=' expression;

formalParameters: (Identifier (',' Identifier)*)?;

functionStatement: FUNC Identifier '(' formalParameters ')' block;

ifStatement: IF '(' expression ')' statement (ELSE statement)?;

forStatement: FOR '(' expression? ';' expression? ';' expression? ')' statement;

whileStatement: WHILE '(' expression ')' statement;

continueStatement: CONTINUE;

breakStatement: BREAK;

returnStatement: RETURN expression?;

parameterList: Identifier (',' Identifier)*;

expressionSequence: expression (',' expression)*;

expression
  : unaOpExpression
  | binOpExpression
  | callExpression
  | literalExpression
  | identifierExpression
  | '(' expression ')'
  ;

unaOpExpression: '+' expression | '-' expression | '~' expression | '!' expression;

binOpExpression
  : expression ('*' | '/' | '%') expression
  | expression ('+' | '-') expression
  | expression ('<' | '>' | '<=' | '>=') expression
  | expression ('==' | '!=') expression
  | expression '&' expression
  | expression '|' expression
  | expression '^' expression
  | expression '&&' expression
  | expression '||' expression
  | expression '=' expressionSequence
  ;

arguments: expressionSequence?;

callExpression: Identifier '(' arguments ')';

literalExpression: NullLiteral | BooleanLiteral | StringLiteral | DecimalLiteral;

identifierExpression: Identifier;

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

Identifier: [A-Za-z][A-Za-z0-9]*;

NullLiteral: NULL;

BooleanLiteral: TRUE | FALSE;

StringLiteral: '"' StringCharacter* '"';

DecimalLiteral
  : DecimalIntegerLiteral '.' DecimalDigit* ExponentPart?
  | DecimalIntegerLiteral ExponentPart?
  ;

Skip: [ \t\r\n]+ -> skip;

fragment DecimalDigit: [0-9];

fragment HexDigit: [0-9a-fA-F];

fragment DecimalIntegerLiteral: '0' | [1-9] DecimalDigit*;

fragment ExponentPart: [eE] [+-]? DecimalDigit+;

fragment StringCharacter: ~["\\\r\n] | '\\' EscapeSequence;

fragment EscapeSequence: CharacterEscapeSequence | HexEscapeSequence | UnicodeEscapeSequence;

fragment CharacterEscapeSequence: ["\\bfnrtv] | ~["\\bfnrtv0-9xu\r\n];

fragment HexEscapeSequence: 'x' HexDigit HexDigit;

fragment UnicodeEscapeSequence: 'u' HexDigit HexDigit HexDigit HexDigit;