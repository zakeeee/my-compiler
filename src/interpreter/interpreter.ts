import {
  ArrayLiteralExpression,
  AssignmentExpression,
  BlockStatement,
  BreakStatement,
  CallExpression,
  ClassStatement,
  ContinueStatement,
  EmptyStatement,
  Expression,
  ExpressionStatement,
  ForStatement,
  FunctionExpression,
  FunctionStatement,
  GetPropertyExpression,
  HashLiteralExpression,
  IdentifierExpression,
  IfStatement,
  IndexExpression,
  InfixExpression,
  LetExpression,
  LetStatement,
  LiteralExpression,
  MethodStatement,
  NewExpression,
  PrefixExpression,
  Program,
  ReturnStatement,
  ThisExpression,
  TreeNodeVisitor,
  WhileStatement,
} from 'src/ast';
import { getTokenName, Token, TokenType } from 'src/lexer';
import { makeBuiltinClasses, makeBuiltinFunctions } from './builtins-init';
import { Environment } from './environment';
import { PopArray } from './models/builtins/array';
import { FALSE, TRUE } from './models/builtins/boolean';
import { PopClass } from './models/builtins/class';
import { ArrayClass, ArrayInstance } from './models/builtins/classes/array';
import { HashClass, HashInstance } from './models/builtins/classes/hash';
import { PopFunction } from './models/builtins/function';
import { PopHash } from './models/builtins/hash';
import { PopInstance } from './models/builtins/instance';
import { NULL } from './models/builtins/null';
import { PopNumber } from './models/builtins/number';
import { PopObject } from './models/builtins/object';
import { PopString } from './models/builtins/string';

class Break extends Error {
  constructor() {
    super();
    this.name = 'Break';
  }
}

class Continue extends Error {
  constructor() {
    super();
    this.name = 'Continue';
  }
}

class Return extends Error {
  readonly value: PopObject | null;

  constructor(value: PopObject | null) {
    super();
    this.name = 'Return';
    this.value = value;
  }
}

function makeDefaultGlobals() {
  const globals = new Environment();

  const builtinClasses = makeBuiltinClasses(globals);
  Object.entries(builtinClasses).forEach(([key, cls]) => {
    globals.define(key, cls);
  });

  const builtinFuncs = makeBuiltinFunctions(globals);
  Object.entries(builtinFuncs).forEach(([key, func]) => {
    globals.define(key, func);
  });

  return globals;
}

function performPrefixOperation(tokenType: TokenType, operand: PopObject): PopObject {
  const tokenName = getTokenName(tokenType);
  switch (tokenType) {
    case TokenType.BANG:
      return operand.toBoolean() ? FALSE : TRUE;
    case TokenType.PLUS: {
      if (operand instanceof PopNumber) {
        return new PopNumber(operand.getValue());
      }
      throw new Error(`invalid prefix operation "${tokenName}" on "${operand.getType()}"`);
    }
    case TokenType.MINUS: {
      if (operand instanceof PopNumber) {
        return new PopNumber(-operand.getValue());
      }
      throw new Error(`invalid prefix operation "${tokenName}" on "${operand.getType()}"`);
    }
    case TokenType.BIT_NOT: {
      if (operand instanceof PopNumber) {
        return new PopNumber(~operand.getValue());
      }
      throw new Error(`invalid prefix operation "${tokenName}" on "${operand.getType()}"`);
    }
    default: {
      throw new Error(`unknown prefix operation "${tokenName}"`);
    }
  }
}

function performInfixOperation(tokenType: TokenType, left: PopObject, right: PopObject): PopObject {
  const tokenName = getTokenName(tokenType);
  switch (tokenType) {
    case TokenType.EQUAL:
      return left.equals(right) ? TRUE : FALSE;
    case TokenType.BANG_EQUAL: {
      return left.equals(right) ? FALSE : TRUE;
    }
    case TokenType.LOGIC_AND: {
      const a = left.toBoolean();
      const b = right.toBoolean();
      return a && b ? TRUE : FALSE;
    }
    case TokenType.LOGIC_OR: {
      const a = left.toBoolean();
      const b = right.toBoolean();
      return a || b ? TRUE : FALSE;
    }
    case TokenType.STAR: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() * right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.SLASH: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() / right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.PERCENT: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() % right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.PLUS: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() + right.getValue());
      }
      if (left instanceof PopString && right instanceof PopString) {
        return new PopString(left.getValue() + right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.MINUS: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() - right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.GREATER_THAN: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return left.getValue() > right.getValue() ? TRUE : FALSE;
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.GREATER_THAN_EQUAL: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return left.getValue() >= right.getValue() ? TRUE : FALSE;
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.LESS_THAN: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return left.getValue() < right.getValue() ? TRUE : FALSE;
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.LESS_THAN_EQUAL: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return left.getValue() <= right.getValue() ? TRUE : FALSE;
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.BIT_AND: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() & right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.BIT_OR: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() | right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.BIT_XOR: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() ^ right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.STAR_EQUAL: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() * right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.SLASH_EQUAL: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() / right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.PERCENT_EQUAL: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() % right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.PLUS_EQUAL: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() + right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.MINUS_EQUAL: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() - right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.BIT_AND_EQUAL: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() & right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.BIT_OR_EQUAL: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() | right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    case TokenType.BIT_XOR_EQUAL: {
      if (left instanceof PopNumber && right instanceof PopNumber) {
        return new PopNumber(left.getValue() ^ right.getValue());
      }
      throw new Error(
        `invalid operation "${tokenName}" on "${left.getType()}" and "${right.getType()}"`
      );
    }
    default: {
      throw new Error(`unknown infix operation "${tokenName}"`);
    }
  }
}

export class Interpreter implements TreeNodeVisitor {
  private globals: Environment;
  private curEnv: Environment;
  private locals: Map<Expression, number>;

  constructor(locals: Map<Expression, number>) {
    this.globals = makeDefaultGlobals();
    this.curEnv = this.globals;
    this.locals = locals;
  }

  run(root: Program): void {
    this.visitProgram(root);
  }

  visitProgram(node: Program): PopObject {
    for (const stmt of node.stmts) {
      stmt.accept(this);
    }
    return NULL;
  }

  visitBlockStatement(node: BlockStatement): PopObject {
    const prevEnv = this.curEnv;
    this.curEnv = new Environment(prevEnv);
    try {
      for (const stmt of node.stmts) {
        stmt.accept(this);
      }
    } finally {
      this.curEnv = prevEnv;
    }
    return NULL;
  }

  visitEmptyStatement(node: EmptyStatement): PopObject {
    return NULL;
  }

  visitExpressionStatement(node: ExpressionStatement): PopObject {
    node.expr.accept(this);
    return NULL;
  }

  visitLetStatement(node: LetStatement): PopObject {
    node.expr.accept(this);
    return NULL;
  }

  visitIfStatement(node: IfStatement): PopObject {
    const condition = node.condition.accept(this);
    if (condition.toBoolean()) {
      node.consequence.accept(this);
    } else if (node.alternative) {
      node.alternative.accept(this);
    }
    return NULL;
  }

  visitForStatement(node: ForStatement): PopObject {
    const { curEnv: prevEnv } = this;
    this.curEnv = new Environment(prevEnv);
    try {
      node.initialize?.accept(this);

      let condition = true;
      if (node.condition) {
        condition = node.condition.accept(this).toBoolean();
      }
      while (condition) {
        try {
          node.body.accept(this);
        } catch (error) {
          if (error instanceof Break) {
            break;
          }
          if (error instanceof Continue) {
            // noop
          }
          throw error;
        }

        node.afterEach?.accept(this);

        if (node.condition) {
          condition = node.condition.accept(this).toBoolean();
        }
      }
    } finally {
      this.curEnv = prevEnv;
    }
    return NULL;
  }

  visitWhileStatement(node: WhileStatement): PopObject {
    let condition = node.condition.accept(this).toBoolean();
    while (condition) {
      try {
        node.body.accept(this);
      } catch (error) {
        if (error instanceof Break) {
          break;
        }
        if (error instanceof Continue) {
          // noop
        }
        throw error;
      }

      condition = node.condition.accept(this).toBoolean();
    }
    return NULL;
  }

  visitContinueStatement(node: ContinueStatement): PopObject {
    throw new Continue();
  }

  visitBreakStatement(node: BreakStatement): PopObject {
    throw new Break();
  }

  visitReturnStatement(node: ReturnStatement): PopObject {
    throw new Return(node.value ? node.value.accept(this) : null);
  }

  visitFunctionStatement(node: FunctionStatement): PopObject {
    const funcName = node.name.lexeme;
    const params = node.params.map((param) => param.lexeme);
    const func = new PopFunction(this.curEnv, {
      name: funcName,
      params,
      func: (env) => {
        const prevEnv = this.curEnv;
        this.curEnv = env;
        try {
          node.body.accept(this);
          return NULL;
        } catch (error) {
          if (error instanceof Return) {
            return error.value ?? NULL;
          }
          throw error;
        } finally {
          this.curEnv = prevEnv;
        }
      },
    });
    this.curEnv.define(funcName, func);
    return NULL;
  }

  visitMethodStatement(node: MethodStatement): PopObject {
    return NULL;
  }

  visitClassStatement(node: ClassStatement): PopObject {
    const className = node.name.lexeme;
    let superClass: PopClass | null = null;
    if (node.superClass?.lexeme) {
      const cls = this.globals.getValue(node.superClass.lexeme);
      if (cls instanceof PopClass) {
        superClass = cls;
      }
    }
    this.curEnv.define(className, null);
    const cls = new PopClass(this.curEnv, className, superClass);
    for (const method of node.methods) {
      const methodName = method.name.lexeme;
      const params = method.params.map((param) => param.lexeme);
      const func = new PopFunction(this.curEnv, {
        name: methodName,
        params,
        func: (env) => {
          const prevEnv = this.curEnv;
          this.curEnv = env;
          try {
            method.body.accept(this);
            return NULL;
          } catch (error) {
            if (error instanceof Return) {
              return error.value ?? NULL;
            }
            throw error;
          } finally {
            this.curEnv = prevEnv;
          }
        },
      });
      if (method.isStatic) {
        cls.setProperty(methodName, func);
      } else {
        cls.setMethod(methodName, func);
      }
    }
    this.curEnv.assign(className, cls);
    return NULL;
  }

  visitPrefixExpression(node: PrefixExpression): PopObject {
    const operand = node.operand.accept(this);
    const tokenType = node.operator.type;
    return performPrefixOperation(tokenType, operand);
  }

  visitInfixExpression(node: InfixExpression): PopObject {
    const tokenType = node.operator.type;
    const left = node.left.accept(this);
    const right = node.right.accept(this);
    return performInfixOperation(tokenType, left, right);
  }

  visitAssignmentExpression(node: AssignmentExpression): PopObject {
    const right = node.right.accept(this);
    const tokenType = node.operator.type;

    if (tokenType === TokenType.ASSIGN) {
      if (node.left instanceof IdentifierExpression) {
        const name = node.left.name.lexeme;
        const res = this.curEnv.assign(name, right);
        if (!res) {
          throw new Error(`cannot assign to undefined name "${name}"`);
        }
      } else if (node.left instanceof GetPropertyExpression) {
        const object = node.left.object.accept(this);
        const prop = node.left.prop.lexeme;
        if (!(object instanceof PopInstance)) {
          throw new Error(`cannot set property of "${object.getType()}"`);
        }
        object.setProperty(prop, right);
      } else {
        const indexable = node.left.indexable.accept(this);
        const index = node.left.index.accept(this);
        if (index instanceof PopNumber) {
          const arrayClass = this.curEnv.getValue('Array');
          if (
            indexable instanceof PopInstance &&
            arrayClass instanceof ArrayClass &&
            indexable.isInstanceOf(arrayClass)
          ) {
            const arrayInstance = indexable as unknown as ArrayInstance;
            const idx = index.getValue();
            arrayInstance.array.setAt(idx, right);
            return NULL;
          }
          throw new Error('');
        } else if (index instanceof PopString) {
          const hashClass = this.curEnv.getValue('Hash');
          if (
            indexable instanceof PopInstance &&
            hashClass instanceof HashClass &&
            indexable.isInstanceOf(hashClass)
          ) {
            const hashInstance = indexable as unknown as HashInstance;
            const key = index.getValue();
            hashInstance.hash.set(key, right);
            return NULL;
          }
          throw new Error('');
        } else {
          throw new Error('');
        }
      }
      return right;
    }

    // *=, /=, %=, +=, -=, &=, |=, ^=
    let value: PopObject;
    if (node.left instanceof IdentifierExpression) {
      const name = node.left.name.lexeme;
      const left = this.curEnv.getValue(name);
      if (!(left instanceof PopObject)) {
        throw new Error(`"${name}" is undefined`);
      }
      value = performInfixOperation(tokenType, left, right);
      this.curEnv.assign(name, value);
    } else if (node.left instanceof GetPropertyExpression) {
      const object = node.left.object.accept(this);
      const prop = node.left.prop.lexeme;
      if (!(object instanceof PopInstance)) {
        throw new Error(`cannot get property of "${object.getType()}"`);
      }
      const left = object.getProperty(prop);
      if (!left) {
        throw new Error(`unknown property "${prop}"`);
      }
      value = performInfixOperation(tokenType, left, right);
      object.setProperty(prop, value);
    } else {
      const indexable = node.left.indexable.accept(this);
      const index = node.left.index.accept(this);
      if (index instanceof PopNumber) {
        const arrayClass = this.curEnv.getValue('Array');
        if (
          indexable instanceof PopInstance &&
          arrayClass instanceof ArrayClass &&
          indexable.isInstanceOf(arrayClass)
        ) {
          const arrayInstance = indexable as unknown as ArrayInstance;
          const idx = index.getValue();
          arrayInstance.array.setAt(
            idx,
            performInfixOperation(tokenType, arrayInstance.array.getAt(idx), right)
          );
          return NULL;
        }
        throw new Error('');
      } else if (index instanceof PopString) {
        const hashClass = this.curEnv.getValue('Hash');
        if (
          indexable instanceof PopInstance &&
          hashClass instanceof HashClass &&
          indexable.isInstanceOf(hashClass)
        ) {
          const hashInstance = indexable as unknown as HashInstance;
          const key = index.getValue();
          hashInstance.hash.set(
            key,
            performInfixOperation(tokenType, hashInstance.hash.get(key), right)
          );
          return NULL;
        }
        throw new Error('');
      } else {
        throw new Error('');
      }
    }
    return value;
  }

  visitLetExpression(node: LetExpression): PopObject {
    for (const decl of node.varDecls) {
      const name = decl.name.lexeme;
      let value: PopObject = NULL;
      if (decl.initializer) {
        value = decl.initializer.accept(this);
      }
      this.curEnv.define(name, value);
    }
    return NULL;
  }

  visitCallExpression(node: CallExpression): PopObject {
    const callee = node.callee.accept(this);
    if (!(callee instanceof PopFunction)) {
      throw new Error('object is not callable');
    }
    const args = node.args.map((arg) => arg.accept(this));
    return callee.call(args);
  }

  visitLiteralExpression(node: LiteralExpression): PopObject {
    const tokenType = node.token.type;
    switch (tokenType) {
      case TokenType.NUMBER_LITERAL:
        return new PopNumber(node.value as number);
      case TokenType.STRING_LITERAL:
        return new PopString(node.value as string);
      case TokenType.TRUE:
        return TRUE;
      case TokenType.FALSE:
        return FALSE;
      case TokenType.NULL:
        return NULL;
    }
    throw new Error(`unknown literal expression of type ${getTokenName(tokenType)}`);
  }

  visitIdentifierExpression(node: IdentifierExpression): PopObject {
    const val = this.lookUpIdentifier(node.name, node);
    if (!val) {
      throw new Error(`"${node.name.lexeme}" is undefined`);
    }
    return val;
  }

  visitFunctionExpression(node: FunctionExpression): PopObject {
    const params = node.params.map((param) => param.lexeme);
    return new PopFunction(this.curEnv, {
      params,
      func: (env) => {
        const prevEnv = this.curEnv;
        this.curEnv = env;
        try {
          node.body.accept(this);
          return NULL;
        } catch (error) {
          if (error instanceof Return) {
            return error.value ?? NULL;
          }
          throw error;
        } finally {
          this.curEnv = prevEnv;
        }
      },
    });
  }

  visitArrayLiteralExpression(node: ArrayLiteralExpression): PopObject {
    const arrayClass = this.globals.getValue('Array');
    if (!(arrayClass instanceof PopClass)) {
      throw new Error('cannot find class "Array"');
    }
    const elements = node.elements.map((expr) => expr.accept(this));
    const instance = arrayClass.call([new PopArray(elements)]);
    return instance;
  }

  visitHashLiteralExpression(node: HashLiteralExpression): PopObject {
    const hashClass = this.globals.getValue('Hash');
    if (!(hashClass instanceof PopClass)) {
      throw new Error('cannot find class "Hash"');
    }
    const map = new Map<string, PopObject>();
    for (const entry of node.entries) {
      const { key } = entry;
      const value = entry.value.accept(this);
      map.set(key, value);
    }
    const instance = hashClass.call([new PopHash(map)]);
    return instance;
  }

  visitGetPropertyExpression(node: GetPropertyExpression): PopObject {
    const object = node.object.accept(this);
    const propName = node.prop.lexeme;
    if (!(object instanceof PopInstance)) {
      throw new Error(`cannot get property of "${object.getType()}"`);
    }
    const val = object.getProperty(propName);
    if (!val) {
      throw new Error(`unknown property "${propName}"`);
    }
    return val;
  }

  visitNewExpression(node: NewExpression): PopObject {
    const className = node.cls.lexeme;
    const cls = this.curEnv.getValue(className);
    if (!(cls instanceof PopClass)) {
      throw new Error(`cannot find class "${className}"`);
    }
    const args = node.args.map((arg) => arg.accept(this));
    return cls.call(args);
  }

  visitThisExpression(node: ThisExpression): PopObject {
    const instance = this.curEnv.getValue('this');
    if (!(instance instanceof PopObject)) {
      throw new Error('"this" is undefined');
    }
    return instance;
  }

  visitIndexExpression(node: IndexExpression): PopObject {
    const indexable = node.indexable.accept(this);
    const index = node.index.accept(this);
    if (index instanceof PopNumber) {
      const arrayClass = this.curEnv.getValue('Array');
      if (
        indexable instanceof PopInstance &&
        arrayClass instanceof ArrayClass &&
        indexable.isInstanceOf(arrayClass)
      ) {
        const arrayInstance = indexable as unknown as ArrayInstance;
        const idx = index.getValue();
        return arrayInstance.array.getAt(idx);
      }
      throw new Error('');
    } else if (index instanceof PopString) {
      const hashClass = this.curEnv.getValue('Hash');
      if (
        indexable instanceof PopInstance &&
        hashClass instanceof HashClass &&
        indexable.isInstanceOf(hashClass)
      ) {
        const hashInstance = indexable as unknown as HashInstance;
        const key = index.getValue();
        return hashInstance.hash.get(key);
      }
      throw new Error('');
    } else {
      throw new Error('');
    }
  }

  private lookUpIdentifier(name: Token, expr: Expression): PopObject | null {
    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      return this.curEnv.ancestor(distance)!.getValue(name.lexeme);
    } else {
      return this.globals.getValue(name.lexeme);
    }
  }
}
