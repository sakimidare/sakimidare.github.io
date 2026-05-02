---
title: Bomb Lab Writeup
published: 2026-05-02
description: ''
image: ''
tags: [C, Programming, CSAPP]
category: Write Up
draft: false 
lang: ''
---

# 前言 

> 邪恶的**邪恶博士**在我们的班级机器上放置了大量的“二进制炸弹”。二进制炸弹是由一系列阶段组成的程序。每个阶段都要求你在 stdin 上键入一个特定的字符串。如果你输入了正确的字符串，那么这个阶段就被**拆除**，炸弹进入下一个阶段。否则炸弹会**爆炸**，并打印出 “BOOM!!!”，然后终止。当每一个阶段都被拆除时，炸弹才算拆除。
> 
> 有太多炸弹要我们处理，所以我们给每个学生一个炸弹来拆除。这是你的任务，你别无选择，只能接受，就是在截止时间前拆除你的炸弹。祝你好运，欢迎加入拆弹小组！

# 开始

:::note
本 WriteUp 所有操作均在 `Linux sakimidare-arch 7.0.2-arch1-1-lily #1 SMP PREEMPT_DYNAMIC Thu, 30 Apr 2026 05:29:46 +0000 x86_64 GNU/Linux` 上进行。
:::

我拿到了一个 `bomb.tar`，目录结构如下：

```
.
├── bomb
├── bomb.c
└── README

1 directory, 3 files
```

我们的目标是尽可能多地拆除炸弹（获取正确的拆弹密钥）。

首先来看 `bomb.c`:

```c title="bomb.c"
/***************************************************************************
 * Dr. Evil's Insidious Bomb, Version 1.1
 * Copyright 2011, Dr. Evil Incorporated. All rights reserved.
 *
 * LICENSE:
 *
 * Dr. Evil Incorporated (the PERPETRATOR) hereby grants you (the
 * VICTIM) explicit permission to use this bomb (the BOMB).  This is a
 * time limited license, which expires on the death of the VICTIM.
 * The PERPETRATOR takes no responsibility for damage, frustration,
 * insanity, bug-eyes, carpal-tunnel syndrome, loss of sleep, or other
 * harm to the VICTIM.  Unless the PERPETRATOR wants to take credit,
 * that is.  The VICTIM may not distribute this bomb source code to
 * any enemies of the PERPETRATOR.  No VICTIM may debug,
 * reverse-engineer, run "strings" on, decompile, decrypt, or use any
 * other technique to gain knowledge of and defuse the BOMB.  BOMB
 * proof clothing may not be worn when handling this program.  The
 * PERPETRATOR will not apologize for the PERPETRATOR's poor sense of
 * humor.  This license is null and void where the BOMB is prohibited
 * by law.
 ***************************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include "support.h"
#include "phases.h"

/* 
 * Note to self: Remember to erase this file so my victims will have no
 * idea what is going on, and so they will all blow up in a
 * spectaculary fiendish explosion. -- Dr. Evil 
 */

FILE *infile;

int main(int argc, char *argv[])
{
    char *input;

    /* Note to self: remember to port this bomb to Windows and put a 
     * fantastic GUI on it. */

    /* When run with no arguments, the bomb reads its input lines 
     * from standard input. */
    if (argc == 1) {  
	infile = stdin;
    } 

    /* When run with one argument <file>, the bomb reads from <file> 
     * until EOF, and then switches to standard input. Thus, as you 
     * defuse each phase, you can add its defusing string to <file> and
     * avoid having to retype it. */
    else if (argc == 2) {
	if (!(infile = fopen(argv[1], "r"))) {
	    printf("%s: Error: Couldn't open %s\n", argv[0], argv[1]);
	    exit(8);
	}
    }

    /* You can't call the bomb with more than 1 command line argument. */
    else {
	printf("Usage: %s [<input_file>]\n", argv[0]);
	exit(8);
    }

    /* Do all sorts of secret stuff that makes the bomb harder to defuse. */
    initialize_bomb();

    printf("Welcome to my fiendish little bomb. You have 6 phases with\n");
    printf("which to blow yourself up. Have a nice day!\n");

    /* Hmm...  Six phases must be more secure than one phase! */
    input = read_line();             /* Get input                   */
    phase_1(input);                  /* Run the phase               */
    phase_defused();                 /* Drat!  They figured it out!
				      * Let me know how they did it. */
    printf("Phase 1 defused. How about the next one?\n");

    /* The second phase is harder.  No one will ever figure out
     * how to defuse this... */
    input = read_line();
    phase_2(input);
    phase_defused();
    printf("That's number 2.  Keep going!\n");

    /* I guess this is too easy so far.  Some more complex code will
     * confuse people. */
    input = read_line();
    phase_3(input);
    phase_defused();
    printf("Halfway there!\n");

    /* Oh yeah?  Well, how good is your math?  Try on this saucy problem! */
    input = read_line();
    phase_4(input);
    phase_defused();
    printf("So you got that one.  Try this one.\n");
    
    /* Round and 'round in memory we go, where we stop, the bomb blows! */
    input = read_line();
    phase_5(input);
    phase_defused();
    printf("Good work!  On to the next...\n");

    /* This phase will never be used, since no one will get past the
     * earlier ones.  But just in case, make this one extra hard. */
    input = read_line();
    phase_6(input);
    phase_defused();

    /* Wow, they got it!  But isn't something... missing?  Perhaps
     * something they overlooked?  Mua ha ha ha ha! */
    
    return 0;
}
```

`support.h` 和 `phases.h` 并没有提供，源码中的 `initialize_bomb()`, `read_line()`, `phase_x()`, `phase_defused()` 未提供定义。这就需要我们用反汇编推出这几个函数内部的逻辑并猜出密钥。

推测原型: 

```c
void initialize_bomb();
char* read_line();
void phase_x(char*);
void phase_defused();
```

# 反汇编

## `initialize_bomb()`

```sh
objdump -d bomb -disassemble=initialize_bomb
```

```asm
objdump -d bomb --disassemble=initialize_bomb

bomb：     文件格式 elf64-x86-64


Disassembly of section .init:

Disassembly of section .plt:

Disassembly of section .text:

00000000004013a2 <initialize_bomb>:
  4013a2:       48 83 ec 08             sub    $0x8,%rsp
  4013a6:       be a0 12 40 00          mov    $0x4012a0,%esi
  4013ab:       bf 02 00 00 00          mov    $0x2,%edi
  4013b0:       e8 db f7 ff ff          call   400b90 <signal@plt>
  4013b5:       48 83 c4 08             add    $0x8,%rsp
  4013b9:       c3                      ret

Disassembly of section .fini:

```

`%edi` `%esi` 按照惯例来讲应该是函数的两个参数。`%rsp` 是栈指针，指向当前栈顶。上述汇编从栈中弹出一个四字（不用 `popq` 大概是为了不污染 `%rax`），并赋了两个魔数给两个寄存器，并调用了 `400b90` 这个地方的函数 `<signal@plt>` 。我们继续去反编译 `signal`。

```
0000000000400b90 <signal@plt>:
  400b90:       ff 25 c2 24 20 00       jmp    *0x2024c2(%rip)        # 603058 <signal@GLIBC_2.2.5>
  400b96:       68 0b 00 00 00          push   $0xb
  400b9b:       e9 30 ff ff ff          jmp    400ad0 <.plt>
```

```
0000000000400ad0 <.plt>:
  400ad0:       ff 35 1a 25 20 00       push   0x20251a(%rip)        # 602ff0 <_GLOBAL_OFFSET_TABLE_+0x8>
  400ad6:       ff 25 1c 25 20 00       jmp    *0x20251c(%rip)        # 602ff8 <_GLOBAL_OFFSET_TABLE_+0x10>
  400adc:       0f 1f 40 00             nopl   0x0(%rax)
```

坏事了，这个函数并不在我们的二进制文件里，而是动态链接到了 glibc 里面的 `signal` 函数。

查阅相关资料，发现 `signal` 函数原型如下：
```c
#include <signal.h>

typedef void (*sighandler_t)(int);

sighandler_t signal(int signum, sighandler_t handler);
```

代入`%edi`，`%esi`，发现调用的函数是：

```c
sighandler_t signal(0x2, 0x4012a0);
```

通过查表：
```
$ man signal

SIGNAL(7)                                                         Linux Programmer's Manual                                                        SIGNAL(7)

NAME
     signal - 有效信号的清单

描述 (DESCRIPTION)
     下面 列出 Linux 支持的 信号. 某些 信号 依赖于 体系结构(architecture).

     首先, POSIX.1 描述了 下列 信号.

     信号         值      动作   说明
     ─────────────────────────────────────────────────────────────────────
     SIGHUP        1       A     在控制终端上是挂起信号, 或者控制进程结束
     SIGINT        2       A     从键盘输入的中断
     SIGQUIT       3       C     从键盘输入的退出
     SIGILL        4       C     无效硬件指令
     SIGABRT       6       C     非正常终止, 可能来自 abort(3)
     SIGFPE        8       C     浮点运算例外
     SIGKILL       9      AEF    杀死进程信号
     SIGSEGV      11       C     无效的内存引用
     SIGPIPE      13       A     管道中止: 写入无人读取的管道
     SIGALRM      14       A     来自 alarm(2) 的超时信号
     SIGTERM      15       A     终止信号
     SIGUSR1   30,10,16    A     用户定义的信号 1
     SIGUSR2   31,12,17    A     用户定义的信号 2
     SIGCHLD   20,17,18    B     子进程结束或停止
     SIGCONT   19,18,25          继续停止的进程
     SIGSTOP   17,19,23   DEF    停止进程
     SIGTSTP   18,20,24    D     终端上发出的停止信号
     SIGTTIN   21,21,26    D     后台进程试图从控制终端(tty)输入
     SIGTTOU   22,22,27    D     后台进程试图在控制终端(tty)输出
...
```

发现 `0x2` 对应 `SIGINT`。

`SIGFPE` 是键盘上按下 `Ctrl`+`C`时 Linux 向程序发送的信号。上面的函数捕获了这个信号并注册了一个函数，地址在`0x4012a0`。通过

```c
typedef void (*sighandler_t)(int);
```

我们还能知道函数钩子的原型是 `void foo(int);`。

接下来反汇编 `0x4012a0` 处的函数：

```sh
$ objdump -d --start-address=0x4012a0 --stop-address=0x4013a0 bomb

bomb：     文件格式 elf64-x86-64


Disassembly of section .text:

00000000004012a0 <sig_handler>:
  4012a0:       48 83 ec 08             sub    $0x8,%rsp
  4012a4:       bf c0 24 40 00          mov    $0x4024c0,%edi
  4012a9:       e8 62 f8 ff ff          call   400b10 <puts@plt>
  4012ae:       bf 03 00 00 00          mov    $0x3,%edi
  4012b3:       e8 98 f9 ff ff          call   400c50 <sleep@plt>
  4012b8:       be 82 25 40 00          mov    $0x402582,%esi
  4012bd:       bf 01 00 00 00          mov    $0x1,%edi
  4012c2:       b8 00 00 00 00          mov    $0x0,%eax
  4012c7:       e8 34 f9 ff ff          call   400c00 <__printf_chk@plt>
  4012cc:       48 8b 3d 6d 24 20 00    mov    0x20246d(%rip),%rdi        # 603740 <stdout@GLIBC_2.2.5>
  4012d3:       e8 08 f9 ff ff          call   400be0 <fflush@plt>
  4012d8:       bf 01 00 00 00          mov    $0x1,%edi
  4012dd:       e8 6e f9 ff ff          call   400c50 <sleep@plt>
  4012e2:       bf 8a 25 40 00          mov    $0x40258a,%edi
  4012e7:       e8 24 f8 ff ff          call   400b10 <puts@plt>
  4012ec:       bf 10 00 00 00          mov    $0x10,%edi
  4012f1:       e8 2a f9 ff ff          call   400c20 <exit@plt>
```

这个函数大量调用了 `puts()` `sleep()` `fflush()` `exit()` 等函数，猜测与炸弹密钥无关。但为了保险，我们先看看 `puts()` 都输出了什么东西。

查看 `0x4024c0` `0x400b10`对应的汇编：

```sh
$ objdump -s -j .rodata bomb | grep -A 5 "4024c0"
 4024c0 536f2079 6f752074 68696e6b 20796f75  So you think you
 4024d0 2063616e 2073746f 70207468 6520626f   can stop the bo
 4024e0 6d622077 69746820 6374726c 2d632c20  mb with ctrl-c, 
 4024f0 646f2079 6f753f00 43757273 65732c20  do you?.Curses, 
 402500 796f7527 76652066 6f756e64 20746865  you've found the
 402510 20736563 72657420 70686173 65210000   secret phase!..
```

好吧确实没啥关系……不管了我们接着看下一个函数。

## `phase_1()`

```sh
$ objdump -d bomb --disassemble=phase_1

bomb：     文件格式 elf64-x86-64


Disassembly of section .init:

Disassembly of section .plt:

Disassembly of section .text:

0000000000400ee0 <phase_1>:
  400ee0:       48 83 ec 08             sub    $0x8,%rsp
  400ee4:       be 00 24 40 00          mov    $0x402400,%esi
  400ee9:       e8 4a 04 00 00          call   401338 <strings_not_equal>
  400eee:       85 c0                   test   %eax,%eax
  400ef0:       74 05                   je     400ef7 <phase_1+0x17>
  400ef2:       e8 43 05 00 00          call   40143a <explode_bomb>
  400ef7:       48 83 c4 08             add    $0x8,%rsp
  400efb:       c3                      ret

Disassembly of section .fini:
```

查看 `0x402400` 处的汇编：
```sh
$ objdump -s -j .rodata bomb | grep -A 10 "402400"
 402400 426f7264 65722072 656c6174 696f6e73  Border relations
 402410 20776974 68204361 6e616461 20686176   with Canada hav
 402420 65206e65 76657220 6265656e 20626574  e never been bet
 402430 7465722e 00000000 576f7721 20596f75  ter.....Wow! You
 402440 27766520 64656675 73656420 74686520  've defused the 
 402450 73656372 65742073 74616765 2100666c  secret stage!.fl
 402460 79657273 00000000 00000000 00000000  yers............
 402470 7c0f4000 00000000 b90f4000 00000000  |.@.......@.....
 402480 830f4000 00000000 8a0f4000 00000000  ..@.......@.....
 402490 910f4000 00000000 980f4000 00000000  ..@.......@.....
 4024a0 9f0f4000 00000000 a60f4000 00000000  ..@.......@.....
```

注意这一行：

```sh
 402430 7465722e 00000000 576f7721 20596f75  ter.....Wow! You
```

`00`标志着 C 风格字符串的结尾。也就是说，这个字符串的内容是:

```
Border relations with Canada have never been better.
```

查看 `401338` 的汇编：

```sh
objdump -d bomb --start-address=0x401338 --stop-address=0x401400

bomb：     文件格式 elf64-x86-64


Disassembly of section .text:

0000000000401338 <strings_not_equal>:
  401338:       41 54                   push   %r12
  40133a:       55                      push   %rbp
  40133b:       53                      push   %rbx
  40133c:       48 89 fb                mov    %rdi,%rbx
  40133f:       48 89 f5                mov    %rsi,%rbp
  401342:       e8 d4 ff ff ff          call   40131b <string_length>
  401347:       41 89 c4                mov    %eax,%r12d
  40134a:       48 89 ef                mov    %rbp,%rdi
  40134d:       e8 c9 ff ff ff          call   40131b <string_length>
  401352:       ba 01 00 00 00          mov    $0x1,%edx
  401357:       41 39 c4                cmp    %eax,%r12d
  40135a:       75 3f                   jne    40139b <strings_not_equal+0x63>
  40135c:       0f b6 03                movzbl (%rbx),%eax
  40135f:       84 c0                   test   %al,%al
  401361:       74 25                   je     401388 <strings_not_equal+0x50>
  401363:       3a 45 00                cmp    0x0(%rbp),%al
  401366:       74 0a                   je     401372 <strings_not_equal+0x3a>
  401368:       eb 25                   jmp    40138f <strings_not_equal+0x57>
  40136a:       3a 45 00                cmp    0x0(%rbp),%al
  40136d:       0f 1f 00                nopl   (%rax)
  401370:       75 24                   jne    401396 <strings_not_equal+0x5e>
  401372:       48 83 c3 01             add    $0x1,%rbx
  401376:       48 83 c5 01             add    $0x1,%rbp
  40137a:       0f b6 03                movzbl (%rbx),%eax
  40137d:       84 c0                   test   %al,%al
  40137f:       75 e9                   jne    40136a <strings_not_equal+0x32>
  401381:       ba 00 00 00 00          mov    $0x0,%edx
  401386:       eb 13                   jmp    40139b <strings_not_equal+0x63>
  401388:       ba 00 00 00 00          mov    $0x0,%edx
  40138d:       eb 0c                   jmp    40139b <strings_not_equal+0x63>
  40138f:       ba 01 00 00 00          mov    $0x1,%edx
  401394:       eb 05                   jmp    40139b <strings_not_equal+0x63>
  401396:       ba 01 00 00 00          mov    $0x1,%edx
  40139b:       89 d0                   mov    %edx,%eax
  40139d:       5b                      pop    %rbx
  40139e:       5d                      pop    %rbp
  40139f:       41 5c                   pop    %r12
  4013a1:       c3                      ret
```
……

怎么这么长呀！

猜测一手，上面那个函数的意思是把输入进去的内容和先前看到的字符串做比对，如果相同表明拆弹成功。到底是不是这样呢？

```
$ ./bomb
Welcome to my fiendish little bomb. You have 6 phases with
which to blow yourself up. Have a nice day!
Border relations with Canada have never been better.
Phase 1 defused. How about the next one?
```
嘿嘿，拆弹成功！

## `phase_2()`

```sh
objdump -d bomb --disassemble=phase_2                           

bomb：     文件格式 elf64-x86-64


Disassembly of section .init:

Disassembly of section .plt:

Disassembly of section .text:

0000000000400efc <phase_2>:
  400efc:       55                      push   %rbp
  400efd:       53                      push   %rbx
  400efe:       48 83 ec 28             sub    $0x28,%rsp
  400f02:       48 89 e6                mov    %rsp,%rsi
  400f05:       e8 52 05 00 00          call   40145c <read_six_numbers>
  400f0a:       83 3c 24 01             cmpl   $0x1,(%rsp)
  400f0e:       74 20                   je     400f30 <phase_2+0x34>
  400f10:       e8 25 05 00 00          call   40143a <explode_bomb>
  400f15:       eb 19                   jmp    400f30 <phase_2+0x34>
  400f17:       8b 43 fc                mov    -0x4(%rbx),%eax
  400f1a:       01 c0                   add    %eax,%eax
  400f1c:       39 03                   cmp    %eax,(%rbx)
  400f1e:       74 05                   je     400f25 <phase_2+0x29>
  400f20:       e8 15 05 00 00          call   40143a <explode_bomb>
  400f25:       48 83 c3 04             add    $0x4,%rbx
  400f29:       48 39 eb                cmp    %rbp,%rbx
  400f2c:       75 e9                   jne    400f17 <phase_2+0x1b>
  400f2e:       eb 0c                   jmp    400f3c <phase_2+0x40>
  400f30:       48 8d 5c 24 04          lea    0x4(%rsp),%rbx
  400f35:       48 8d 6c 24 18          lea    0x18(%rsp),%rbp
  400f3a:       eb db                   jmp    400f17 <phase_2+0x1b>
  400f3c:       48 83 c4 28             add    $0x28,%rsp
  400f40:       5b                      pop    %rbx
  400f41:       5d                      pop    %rbp
  400f42:       c3                      ret

Disassembly of section .fini:
```

这个函数开始出现了比较多的跳转指令，猜测由 `if` 和 `while` 编译而来。

先去看看 `40145c` 的 `read_six_numbers` 函数吧，看看读入的六个数字存到哪里去。

```sh
objdump -d bomb --start-address=0x40145c --stop-address=0x40155c

bomb：     文件格式 elf64-x86-64


Disassembly of section .text:

000000000040145c <read_six_numbers>:
  40145c:       48 83 ec 18             sub    $0x18,%rsp
  401460:       48 89 f2                mov    %rsi,%rdx
  401463:       48 8d 4e 04             lea    0x4(%rsi),%rcx
  401467:       48 8d 46 14             lea    0x14(%rsi),%rax
  40146b:       48 89 44 24 08          mov    %rax,0x8(%rsp)
  401470:       48 8d 46 10             lea    0x10(%rsi),%rax
  401474:       48 89 04 24             mov    %rax,(%rsp)
  401478:       4c 8d 4e 0c             lea    0xc(%rsi),%r9
  40147c:       4c 8d 46 08             lea    0x8(%rsi),%r8
  401480:       be c3 25 40 00          mov    $0x4025c3,%esi
  401485:       b8 00 00 00 00          mov    $0x0,%eax
  40148a:       e8 61 f7 ff ff          call   400bf0 <__isoc99_sscanf@plt>
  40148f:       83 f8 05                cmp    $0x5,%eax
  401492:       7f 05                   jg     401499 <read_six_numbers+0x3d>
  401494:       e8 a1 ff ff ff          call   40143a <explode_bomb>
  401499:       48 83 c4 18             add    $0x18,%rsp
  40149d:       c3                      ret
```

我不行了这都啥啊！

看一眼 `sscanf()` 的原型：

```c
int sscanf(const char *str, const char *format, ...);
```
发现不同于直接从 stdin 读取的 `scanf`, 他接收 n+2 = 8 个参数。

已知 x86-64 汇编中函数传参的顺序是 `%rdi` `%rsi` `%rdx` `%rcx` `%r8` `%r9`，而我们读入六个数字需要传给 `sscanf()` 7个参数。还余下两个怎么办？经过查找资料发现会从栈里从顶到底挨个读取数据。

第二个参数是`%rsi`。盲猜一手 `0x4025c3` 那边存的应该是类似 `%d %d %d %d %d %d` 的东西。

```sh
 4025c0 702e0025 64202564 20256420 25642025  p..%d %d %d %d %
 4025d0 64202564 00457272 6f723a20 5072656d  d %d.Error: Prem
```

那问题来了，`%rdi` 在哪？

既然是我输入的字符串，我有理由猜测输入的字符串原封不动地躺在 `%edi` 里边 ~~大概吧（）~~

注意到有几行汇编非常有意思：
```sh
  400efe:       48 83 ec 28             sub    $0x28,%rsp
  400f02:       48 89 e6                mov    %rsp,%rsi
  400f05:       e8 52 05 00 00          call   40145c <read_six_numbers>
  ...
  40145c:       48 83 ec 18             sub    $0x18,%rsp
  401460:       48 89 f2                mov    %rsi,%rdx
```

- `400efe` 行：开辟 `0x28` 字节大小空间；

- `400f02` 行：给当前栈指针做个备份，赋给 `%rsi`；

- `40145c` 行：开辟 `0x18` 字节大小空间。

```sh
  401460:       48 89 f2                mov    %rsi,%rdx
  401463:       48 8d 4e 04             lea    0x4(%rsi),%rcx
  401478:       4c 8d 4e 0c             lea    0xc(%rsi),%r9
  40147c:       4c 8d 46 08             lea    0x8(%rsi),%r8
  401480:       be c3 25 40 00          mov    $0x4025c3,%esi
  40148a:       e8 61 f7 ff ff          call   400bf0 <__isoc99_sscanf@plt>
```

这几行涉及内存地址的计算和 `sscanf` 的写入。可以看到参数的偏移量都是以 `%rsi`（也就是刚刚备份过的 `%rsp`）为基准的。

```sh
  401467:       48 8d 46 14             lea    0x14(%rsi),%rax
  40146b:       48 89 44 24 08          mov    %rax,0x8(%rsp)
  401470:       48 8d 46 10             lea    0x10(%rsi),%rax
  401474:       48 89 04 24             mov    %rax,(%rsp)
```

这几行为最后的两个参数算好了偏移量，只是为了给放不下的那两个参数提供一个临时的住所。`sscanf` 写入的数据仍旧以`%rsi`为基准来计算。

于是六个数字全部读取完毕，存储在以 `phase_2` 栈帧为基准的栈里。至于

```sh
  40145c:       48 83 ec 18             sub    $0x18,%rsp
```

谁管它呢，他就是个临时变量。

于是我们就有了下面一张表：

（对不起我用 AI 整理了一下实在不好意思...）

| 次序| 参数意义 | 存放位置 | 汇编证据 | 
| -- | -- | -- | -- |
| 1 | 输入字符串 | `%rdi` | (外部传入，直接透传) |
| 2 | 格式化字符串 | `%rsi` | `mov $0x4025c3, %esi` |
| 3 | 数字 1 的地址 |`%rdx` |`mov %rsi, %rdx` |
| 4 | 数字 2 的地址 |`%rcx` |`lea 0x4(%rsi), %rcx` |
| 5 | 数字 3 的地址 |`%r8` |`lea 0x8(%rsi), %r8` |
| 6 | 数字 4 的地址 |`%r9`|`lea 0xc(%rsi), %r9` |
| 7 | 数字 5 的地址 | `(%rsp)`|`mov %rax, (%rsp)` |
| 8 | 数字 6 的地址 |`0x8(%rsp)`|`mov %rax, 0x8(%rsp)` |

注意到了 `401492` 的比较跳转指令正好跳过了`401494` 的爆炸函数，所以我们要想办法满足 `jg` 的条件。