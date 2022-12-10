grammar Pop;

program: StatementList? EOF;

LetStatement: LET Identifier '=' Expression;
IfStatement:
	IF '(' Expression ')' '{' StatementList? '}' (
		ELSE '{' StatementList? '}'
	)?;
ForStatement:
	FOR '(' Expression? ';' Expression? ';' Expression? ')' '{' StatementList? '}';
WhileStatement: WHILE '(' Expression ')' '{' StatementList? '}';
ContinueStatement: CONTINUE;
BreakStatement: BREAK;
ReturnStatement: RETURN Expression?;
Statement:
	LetStatement
	| IfStatement
	| ForStatement
	| WhileStatement
	| ContinueStatement
	| BreakStatement
	| ReturnStatement;
StatementList: (Statement ';')*;

Argument: Identifier;
ArgumentList: Argument (',' Argument)*;

FunctionExpression:
	FUNC Identifier '(' ArgumentList? ')' '{' StatementList? '}';
CallExpression: Identifier '(' ExpressionList? ')';
Expression:;
ExpressionList: Expression (',' Expression)*;

Identifier: [A-Za-z][A-Za-z0-9]*;
StringLiteral: '"' StringCharacter* '"';
NumberLiteral:
	DecimalIntegerLiteral '.' DecimalDigit* ExponentPart?
	| DecimalIntegerLiteral ExponentPart?;

// keywords
LET: 'let';
TRUE: 'true';
FALSE: 'false';
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

fragment EscapeSequence:
	CharacterEscapeSequence
	| HexEscapeSequence
	| UnicodeEscapeSequence;

fragment CharacterEscapeSequence:
	SingleEscapeCharacter
	| NonEscapeCharacter;

fragment HexEscapeSequence: 'x' HexDigit HexDigit;

fragment UnicodeEscapeSequence:
	'u' HexDigit HexDigit HexDigit HexDigit;

fragment SingleEscapeCharacter: ['"\\bfnrtv];

fragment NonEscapeCharacter: ~['"\\bfnrtv0-9xu\r\n];