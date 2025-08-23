---
title: 写 C 时遇到的一个小问题
published: 2025-08-23
description: '数组越界不报错？有点意思'
image: ''
tags: [Programming, C]
category: 'Journal'
draft: false 
lang: ''
---

# 0. 起因

``` c title="main.c"
#include <stdio.h>

int main(void)
{
    int sum = 0, i = 0;
    char input[5];

    while (1) {
        sum = 0;
        scanf("%s", input);
        for (i = 0; input[i] != '\0'; i++)
            sum = sum*10 + input[i] - '0';
        printf("input=%d\n", sum);
    }
    return 0;
}
```

在浏览[Linux C编程一站式学习 第十章 gdb 3. 观察点](https://akaedu.github.io/book/ch10s03.html) 时遇到了上述代码。这段代码目的很简单：把从输入设备输入的整数字符串转换为整数并输出。原文采用了以下调试步骤发现了问题：

``` shell
$ ./main
123
input=123
67
input=67
12345
input=123407
```

原文的解释是：在内存中，局部变量`i`紧跟在`input[4]`后，所以`input[5]`指的就是局部变量`i`。而从键盘输入了`12345`，分别给`input`的各个元素赋值，便成了：

``` c showLineNumbers=False
input[0] = '1';
input[1] = '2';
input[2] = '3';
input[3] = '4';
input[4] = '5';
i = '\0';

```

这里的 `i` 被赋值为 `'\0'`，因为键盘读取了一行字符串，而字符串以`'\0'`结尾。C 语言的`scanf()`函数不会读取空白字符，所以末尾不包含`\n`。

注意到：

``` c showLineNumbers startLineNumber=11
for (i = 0; input[i] != '\0'; i++)
```

`for`循环的控制条件是`input[i] != '\0'`，而这个数组并不包含`'\0'`，因此出现了访问越界的情况。

原文使用了 GDB 调试，部分调试信息如下：
``` shell
(gdb) n
11			for (i = 0; input[i] != '\0'; i++)
(gdb) p sum
$3 = 12345
(gdb) n
12				sum = sum*10 + input[i] - '0';
(gdb) x/7b input
0xbfb8f0a7:	0x31	0x32	0x33	0x34	0x35	0x05	0x00
```

`i`后面一个地址位置的值是`0x00`，因此最后一次循环执行了 `12345*10 + 0x05 - '\0'`，得到了 `123407` 。

然而，事情真的有这么简单吗？

# 1. 发现问题

我在使用 CLion 调试上述代码，正常得很！
``` shell
12345
input=12345
114514
input=114514
1919810
input=1919810
^C
```

怎么回事呢？

看了一眼原文的上一页，发现原作者是这么编译运行的：
``` shell
$ gcc main.c -g -o main
$ ./main 
```

行吧，我也这么办。

？

怪事，一切正常啊。

