```js
//::=代表定义为,在两个符号之间用空格隔开,@代表或的关系,stce代表语句(sentence嘛),ε代表空串
//我消除了左递归和回溯,也形成了一些算符优先
//还得把我们得到的token字段映射到最底层的产生式;到时得遍历,重定义,处理数据结构
//比如标识符,数字,字符,字符串啥的,需要重定义;
//函数声明时可不写形参名,只写参数类型,但我是做成了必须有形参名,即ID.你们也可做成可选态

//开写:
//程序初始相关的
StartProgram::=Program
Program::=HeadFiles DeclarationStce int main ( ) CompoundStce FunctionBlock
HeadFiles::=# include HeadFile
HeadFile::=<stdio.h>@<stdlib.h>@<math.h>@<ctype.h>@<string.h>@<malloc.h>@<signal.h>@<local.h>@<window.h>
Sentence::=DeclarationStce@ExecuteStce
//声明语句相关的
DeclarationStce::=ValueDeclaration@FunctionDeclaration@ε
ValueDeclaration::=ConstDeclaration@VariableDeclaration
ConstDeclaration::=const ConstType ConstDeclarationList
ConstType::=char@int@float@double
ConstDeclarationList::=IDentifier = CONST ConstDeclarationList1
ConstDeclarationList1::=ConstDeclarationList@ε
VariableDeclaration::=VariableType VariableDeclarationList
VariableType::=char@int@float@double
VariableDeclarationList::=SingleVariableDeclaration VariableDeclarationList1
SingleVariableDeclaration::=VARIABLE@SingleVariableDeclaration1
SingleVariableDeclaration1::==Expression@ε
VariableDeclarationList1::=;@, VariableDeclarationList
FunctionDeclaration::=FunctionType IDentifier ( FuncDeclareParameterList ) ;
FunctionType::=void@boolean@char@int@float@double
FuncDeclareParameterList::=FuncDeclareParameter@ε
FuncDeclareParameter::=VariableType IDentifier FuncDeclareParameter1
FuncDeclareParameter1::=, FuncDeclareParameter@ε
//执行语句相关的
ExecuteStce::=DataProcessStce@ControlStce@CompoundStce
DataProcessStce::=AssignStce@FunctionCallStce
AssignStce::=AssignExpr ;
//表达式
Expression::=ArithmeticExpr@RelationalExpr@BooleanExpr@AssignExpr
ArithmeticExpr::=Item ArithmeticExpr1
ArithmeticExpr1::=+ Item ArithmeticExpr@- Item ArithmeticExpr@ε
Item::=Factor Item1
Item1::=* Factor Item@/ Factor Item@% Factor Item@ε
Factor::=( ArithmeticExpr )@CONST@VARIABLE@FunctionCall
CONST::=NumericalConst@CharacterConst
VARIABLE::=IDentifier
FunctionCall::=IDentifier ( RealReferenceList )
RealReferenceList::=RealReference@ε
RealReference::=Expression RealReference1
RealReference1::=, RealReference@ε
RelationalExpr::=ArithmeticExpr RelationalExpr ArithmeticExpr
RelationalOperator::=>@<@>=@<=@==@!=
BooleanExpr::=BooleanItem BooleanExpr1
BooleanExpr1::=|| BooleanItem BooleanExpr@ε
BooleanItem::=BooleanFactor BooleanItem1
BooleanItem1::=&& BooleanFactor BooleanItem@ε
BooleanFactor::=ArithmeticExpr@RelationalExpr@! BooleanExpr
AssignExpr::=IDentifier = Expression
//接着写执行语句的函数调用语句
FunctionCallStce::=FunctionCall ;
ControlStce::=IFStce@FORStce@WHILEStce@DOWHILEStce@RETURNStce
CompoundStce::={ SentenceList }
SentenceList::=Sentence SentenceList1
SentenceList1::=SentenceList@ε
IFStce::=if ( Express ) Sentence IFStce1
IFStce1::=else Sentence@ε
FORStce::=for ( Express ; Express ; Express ) LoopStce
WHILEStce::=while ( Expression ) LoopStce
DOWHILEStce::=do LoopCompoundStce while ( Express )
LoopStce::=DeclarationStce@LoopExecuteStce@LoopCompoundStce
LoopCompoundStce::={ LoopStceList }
LoopStceList::=LoopStce LoopStceList1
LoopStceList1::=LoopStceList@ε
LoopExecuteStce::=LoopIFStce@FORStce@WHILEStce@DOWHILEStce@RETURNStce@BREAKStce@CONTINUEStce
LoopIFStce::=if ( Expression ) LoopStce LoopIFStce1
LoopIFStce1::=else LoopStce@ε
RETURNStce::=return RETURNStce1
RETURNStce1::=;@Expression ;
BREAKStce::=break ;
CONTINUEStce::=continue ;
//关于函数的
FunctionBlock::=FunctionDefinition FunctionBlock@ε
FunctionDefinition::=FunctionType IDentifier ( FuncDefinitionParameterList ) CompoundStce
FuncDefinitionParameterList::=FuncDefinitionParameter@ε
FuncDefinitionParameter::=VariableType IDentifier FuncDefinitionParameter1
FuncDefinitionParameter1::=, FuncDefinitionParameter@ε
```