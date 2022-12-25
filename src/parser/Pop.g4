grammar Pop
  ;

program: statementList? EOF;

statement
  : blockStatement
  | emptyStatement
  | expressionStatement
  | letStatement
  | ifStatement
  | forStatement
  | whileStatement
  | continueStatement
  | breakStatement
  | returnStatement
  | functionStatement
  | classStatement
  ;

statementList: statement+;

blockStatement: '{' statementList? '}';

emptyStatement: ';';

expressionStatement: expression ';';

letStatement: letExpression ';';

ifStatement: IF '(' expression ')' statement (ELSE statement)?;

forStatement: FOR '(' expression? ';' expression? ';' expression? ')' statement;

whileStatement: WHILE '(' expression ')' statement;

continueStatement: CONTINUE ';';

breakStatement: BREAK ';';

returnStatement: RETURN expression? ';';

functionStatement: FUNC Identifier '(' parameterSequence? ')' blockStatement;

classStatement: CLASS Identifier (EXTENDS Identifier)? '{' methodStatement* '}';

parameterSequence: Identifier (',' Identifier)*;

methodStatement: STATIC? Identifier '(' parameterSequence? ')' blockStatement;

expressionSequence: expression (',' expression)*;

expression
  : prefixExpression       # PrefixExpression
  | infixExpression        # InfixExpression
  | assignmentExpression   # AssignmentExpression
  | letExpression          # LetExpression
  | functionExpression     # FunctionExpression
  | callExpression         # CallExpression
  | literalExpression      # LiteralExpression
  | identifierExpression   # IdentifierExpression
  | groupedExpression      # GroupedExpression
  | arrayLiteralExpression # ArrayLiteralExpression
  | hashLiteralExpression  # HashLiteralExpression
  | indexExpression        # IndexExpression
  | getPropertyExpression  # GetPropertyExpression
  | thisExpression         # ThisExpression
  | newExpression          # NewExpression
  ;

prefixExpression: '+' expression | '-' expression | '~' expression | '!' expression;

infixExpression
  : expression ('*' | '/' | '%') expression
  | expression ('+' | '-') expression
  | expression ('<' | '>' | '<=' | '>=') expression
  | expression ('==' | '!=') expression
  | expression '&' expression
  | expression '|' expression
  | expression '^' expression
  | expression '&&' expression
  | expression '||' expression
  ;

assignmentExpression
  : (identifierExpression | getPropertyExpression | indexExpression) (
    '='
    | '*='
    | '/='
    | '%='
    | '+='
    | '-='
    | '&='
    | '|='
    | '^='
  ) expression
  ;

variableDeclaration: Identifier ('=' expression)?;

letExpression: LET variableDeclaration (',' variableDeclaration)*;

functionExpression: FUNC '(' parameterSequence? ')' blockStatement;

arguments: expressionSequence?;

callExpression: expression '(' arguments ')';

literalExpression: NullLiteral | BooleanLiteral | StringLiteral | DecimalLiteral;

identifierExpression: Identifier;

groupedExpression: '(' expression ')';

arrayLiteralExpression: '[' expressionSequence? ']';

indexExpression: expression '[' expression ']';

keyValue: StringLiteral ':' expression;

hashLiteralExpression: '{' (keyValue (',' keyValue)*)? '}';

getPropertyExpression: expression '.' Identifier;

newExpression: NEW Identifier '(' arguments ')';

thisExpression: THIS;

keywords
  : LET
  | TRUE
  | FALSE
  | NULL
  | FUNC
  | IF
  | ELSE
  | FOR
  | WHILE
  | BREAK
  | CONTINUE
  | RETURN
  | CLASS
  | EXTENDS
  | STATIC
  | NEW
  | THIS
  ;

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
CLASS: 'class';
EXTENDS: 'extends';
STATIC: 'static';
NEW: 'new';
THIS: 'this';

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
