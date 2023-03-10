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

ifStatement: 'if' '(' expression ')' statement ('else' statement)?;

forStatement: 'for' '(' expression? ';' expression? ';' expression? ')' statement;

whileStatement: 'while' '(' expression ')' statement;

continueStatement: 'continue' ';';

breakStatement: 'break' ';';

returnStatement: 'return' expression? ';';

functionStatement: 'func' Identifier '(' parameterSequence? ')' blockStatement;

classStatement: 'class' Identifier ('extends' Identifier)? '{' methodStatement* '}';

parameterSequence: Identifier (',' Identifier)*;

methodStatement: 'static'? Identifier '(' parameterSequence? ')' blockStatement;

expressionSequence: expression (',' expression)*;

expression
  : prefixExpression       # PrefixExpression
  | infixExpression        # InfixExpression
  | assignmentExpression   # AssignmentExpression
  | letExpression          # LetExpression
  | functionExpression     # FunctionExpression
  | callExpression         # CallExpression
  | literalExpression      # LiteralExpression
  | idExpression           # IdExpression
  | groupedExpression      # GroupedExpression
  | arrayLiteralExpression # ArrayLiteralExpression
  | hashLiteralExpression  # HashLiteralExpression
  | indexExpression        # IndexExpression
  | dotExpression          # DotExpression
  | thisExpression         # ThisExpression
  | newExpression          # NewExpression
  | superExpression        # SuperExpression
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
  : (idExpression | dotExpression | indexExpression) (
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

letExpression: 'let' variableDeclaration (',' variableDeclaration)*;

functionExpression: 'func' '(' parameterSequence? ')' blockStatement;

arguments: expressionSequence?;

callExpression: expression '(' arguments ')';

literalExpression: NullLiteral | BooleanLiteral | StringLiteral | DecimalLiteral;

idExpression: Identifier;

groupedExpression: '(' expression ')';

arrayLiteralExpression: '[' expressionSequence? ']';

keyValue: StringLiteral ':' expression;

hashLiteralExpression: '{' (keyValue (',' keyValue)*)? '}';

dotExpression: expression '.' Identifier;

indexExpression: expression '[' expression ']';

newExpression: 'new' Identifier '(' arguments ')';

thisExpression: 'this';

superExpression: 'super' '.' Identifier;

keywords
  : 'let'
  | 'true'
  | 'false'
  | 'null'
  | 'func'
  | 'if'
  | 'else'
  | 'for'
  | 'while'
  | 'break'
  | 'continue'
  | 'return'
  | 'class'
  | 'extends'
  | 'static'
  | 'new'
  | 'this'
  | 'super'
  ;

Identifier: [A-Za-z][A-Za-z0-9]*;

NullLiteral: 'null';

BooleanLiteral: 'true' | 'false';

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
