<translation-unit> ::= {<external-declaration>}*

<external-declaration> ::= <function-definition>
| <declaration>

<翻译单位>：= {对外声明> } *      //函数的定义

<declaration-specifier> ::= <storage-class-specifier>            //类的定义
| <type-specifier>
| <type-qualifier>

<存储类说明符>：：=“自动”      //存储说明符auto register static extern说明的四种存储类型，四种存储类别说明符有两种存储期：自动存储期和静态存储期
| "register"
| "static"
| "extern"
| "typedef"

<type-specifier> ::= "void"        //类型说明符
| "char"
| "short"
| "int"
| "long"
| "float"
| "double"
| "signed"
| "unsigned"
| <struct-or-union-specifier>
| <enum-specifier>
| <typedef-name>

<struct-or-union-specifier> ::= <struct-or-union> <identifier> "{" {<struct-declaration>}+ "}"      //结构或联合说明符
| <struct-or-union> "{" {<struct-declaration>}+ "}"
| <struct-or-union> <identifier>

<struct-or-union> ::= "struct"       //结构体，共用体
| "union"

<struct-declaration> ::= {<specifier-qualifier>}* <struct-declarator-list>      //结构声明

<specifier-qualifier> ::= <type-specifier>           //限定类型说明符
| <type-qualifier>

<struct-declarator-list> ::= <struct-declarator>        //struct声明
| <struct-declarator-list> "," <struct-declarator>    

<struct-declarator> ::= <declarator>                       //struct声明
| <declarator> ":" <constant-expression>
| ":" <constant-expression>

<declarator> ::= {<pointer>}? <direct-declarator>       //说明

<pointer> ::= "*" {<type-qualifier>}* {<pointer>}?     //指针

<type-qualifier> ::= "const"          //const是一个c语言关键字，他限定一个变量不允许被改变
| "volatile"

<direct-declarator> ::= <identifier>        //直接声明，标识符
| "(" <declarator> ")"
| <direct-declarator> "[" {<constant-expression>}? "]"
| <direct-declarator> "(" <parameter-type-list> ")"
| <direct-declarator> "(" {<identifier>}* ")"
                                                                                
<constant-expression> ::= <conditional-expression>           //常来表达式，条件表达式

<conditional-expression> ::= <logical-or-expression>                //三位运算符
| <logical-or-expression> "?" <expression> ":" <conditional-expression>

<logical-or-expression> ::= <logical-and-expression>            //"或"
| <logical-or-expression "||" <logical-and-expression>

<logical-and-expression> ::= <inclusive-or-expression>          //"与"
| <logical-and-expression "&&" <inclusive-or-expression>

<inclusive-or-expression> ::= <exclusive-or-expression>        //"或"
| <inclusive-or-expression> "|" <exclusive-or-expression>

<exclusive-or-expression> ::= <and-expression>                    //"异或"
| <exclusive-or-expression> "^" <and-expression>

<and-expression> ::= <equality-expression>                           //"与"
| <and-expression> "&" <equality-expression>

<equality-expression> ::= <relational-expression>
| <equality-expression> "==" <relational-expression>                //"取值"
| <equality-expression> "!=" <relational-expression>                 //"不等于"

<relational-expression> ::= <shift-expression>
| <relational-expression> "<" <shift-expression>                        //"大于"
| <relational-expression> ">" <shift-expression>                        //"小于"
| <relational-expression> "<=" <shift-expression>                      //"小于等于"
| <relational-expression> ">=" <shift-expression>                      //"大于等于"

<shift-expression> ::= <additive-expression>                            //"位运算符"
| <shift-expression> "<<" <additive-expression>                        
| <shift-expression> ">>" <additive-expression>

<multiplicative-expression> ::= <cast-expression>                      //" '*,/,%'运算符"
| <multiplicative-expression> "*" <cast-expression>
| <multiplicative-expression> "/" <cast-expression>
| <multiplicative-expression> "%" <cast-expression>

```html
这个cast-expression可以对标书上P92的因子,故我可以改一下文法
```

<cast-expression> ::= <unary-expression>            //一元运算符
| "(" <type-name> ")" <cast-expression>

<unary-expression> ::= <postfix-expression>
| "++" <unary-expression>               //"自增"
| "--" <unary-expression>                 //"自减"
| <unary-operator> <cast-expression>
| "sizeof" <unary-expression>                   //动态分配空间
| "sizeof" <type-name>

<postfix-expression> ::= <primary-expression>       //后缀表达式
| <postfix-expression> "[" <expression> "]"
| <postfix-expression> "(" {<assignment-expression>}* ")"    
| <postfix-expression> "." <identifier>
| <postfix-expression> "->" <identifier>
| <postfix-expression> "++"
| <postfix-expression> "--"

<primary-expression> ::= <identifier>     //前缀表达式
| <constant>
| <string>
| "(" <expression> ")"

<constant> ::= <integer-constant>            //整型常量
| <character-constant>                              //字符常量
| <floating-constant>                                 //浮点常量
| <enumeration-constant>                          //枚举常量

<expression> ::= <assignment-expression>     //赋值表达式
| <expression> "," <assignment-expression>

<assignment-expression> ::= <conditional-expression>      //赋值表达式 
| <unary-expression> <assignment-operator> <assignment-expression>

<assignment-operator> ::= "="         //赋值操作符
| "*="
| "/="
| "%="
| "+="
| "-="
| "<<="
| ">>="
| "&="
| "^="
| "|="

<unary-operator> ::= "&"         //一元运算符
| "*"
| "+"
| "-"
| "~"
| "!"

<type-name> ::= {<specifier-qualifier>}+ {<abstract-declarator>}?   //修饰符

<parameter-type-list> ::= <parameter-list>        //参数类型列表
| <parameter-list> "," ...

<parameter-list> ::= <parameter-declaration>     //参数声明
| <parameter-list> "," <parameter-declaration>

<parameter-declaration> ::= {<declaration-specifier>}+ <declarator>       //声明说明符
| {<declaration-specifier>}+ <abstract-declarator>
| {<declaration-specifier>}+

<abstract-declarator> ::= <pointer>      //指针，直接摘要说明
| <pointer> <direct-abstract-declarator>
| <direct-abstract-declarator>

<direct-abstract-declarator> ::= ( <abstract-declarator> )           //直接声明符
| {<direct-abstract-declarator>}? "[" {<constant-expression>}? "]"
| {<direct-abstract-declarator>}? "(" {<parameter-type-list>|? ")"

<enum-specifier> ::= "enum" <identifier> "{" <enumerator-list> "}"      //枚举声明符
| "enum" "{" <enumerator-list> "}"
| "enum" <identifier>

<enumerator-list> ::= <enumerator>           //枚举器
| <enumerator-list> "," <enumerator>

<enumerator> ::= <identifier>            //枚举标识符           
| <identifier> "=" <constant-expression>

<typedef-name> ::= <identifier>     //标识符

<declaration> ::= {<declaration-specifier>}+ {<init-declarator>}*      //声明说明符，初始化

<init-declarator> ::= <declarator>                   // 初始化声明符
| <declarator> "=" <initializer>

<initializer> ::= <assignment-expression>          //初始化
| "{" <initializer-list> "}"
| "{" <initializer-list> "," "}"

<initializer-list> ::= <initializer>                //初始化列表
| <initializer-list> "," <initializer>

<compound-statement> ::= "{" {<declaration>}* {<statement>}* "}"          //复合语句

<statement> ::= <labeled-statement>                   //标记语句

 

| <expression-statement>         //表达式语句
| <compound-statement>         //复合语句
| <selection-statement>           //选择语句
| <iteration-statement>           //迭代语句
| <jump-statement>               //跳转语句

<labeled-statement> ::= <identifier> ":" < statement>       //标记语句，标识符      
| "case" <constant-expression> ":" <statement>
| "default" ":" <statement>

<expression-statement> ::= {<expression>}? ";"              //表达式语句

<selection-statement> ::= "if" "(" <expression> ")" <statement>       //选择语句
| "if" "(" <expression> ")" <statement> "else" <statement>            //if---else
| "switch" "(" <expression> ")" <statement>                           //switch

<iteration-statement> ::= "while" "(" <expression> ")" <statement>           //while循环语句 do while，for
| "do" <statement> "while" "(" <expression> ")" ";"
| "for" "(" {<expression>}? ";" {<expression>}? ";" {<expression>}? ")" <statement>

<jump-statement> ::= "goto" <identifier> ";"                       //goto跳转语句 continue，break，return
| "continue" ";"
| "break" ";"
| "return" {<expression>}? ";"