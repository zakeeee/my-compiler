# Pop language

## 数据类型

```
// 数字
1;
-1;
1.0;
1.0e-3;

// 字符串
"foo";

// boolean
true;
false;

// null
null;

// 数组
[1, 2, 3];

// 哈希
{"a": 1, "b": "foo"};
```

## 函数

```
// 函数语句
func foo() {
    print("Hello, World!");
}

foo();

// 函数表达式
let foo = func () {
    print("Hello, World!");
};

foo();

// 高阶函数
func gen(n) {
    let i = 0;
    func bar() {
        if (i < n) {
            let t = i;
            i += 1;
            return t;
        }
        return null;
    }
    return bar;
}
let g1 = gen(10);
for (let i = 0; i < 10; i += 1) {
    print(g1());
}
let g2 = gen(10);
for (let i = 0; i < 10; i += 1) {
    print(g2());
}
```

## 内置函数

```
len(arg);
type(arg);
str(arg);
print(arg1, arg2, ...);
```
