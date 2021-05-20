export default {
    myProduction : `StartProgram::=Program
Program::=HeadFiles DeclarationStce int main ( ) CompoundStce FunctionBlock
HeadFiles::=# include HeadFile
HeadFile::=<stdio.h>@<stdlib.h>@<math.h>@<ctype.h>@<string.h>@<malloc.h>@<signal.h>@<local.h>@<window.h>
Sentence::=DeclarationStce@ExecuteStce
DeclarationStce::=ValueDeclaration@FunctionDeclaration@ε
ValueDeclaration::=ConstDeclaration@VariableDeclaration
ConstDeclaration::=const IDType ConstDeclarationList
IDType::=boolean@char@int@float@double
ConstDeclarationList::=IDentifier = CONST ConstDeclarationList1
ConstDeclarationList1::=ConstDeclarationList@ε
VariableDeclaration::=IDType VariableDeclarationList
IDType::=boolean@char@int@float@double
VariableDeclarationList::=SingleVariableDeclaration VariableDeclarationList1
SingleVariableDeclaration::=IDentifier@SingleVariableDeclaration1
SingleVariableDeclaration1::== Expression@ε
VariableDeclarationList1::=;@, VariableDeclarationList
FunctionDeclaration::=FunctionType IDentifier ( FuncDeclareParameterList ) ;
FunctionType::=void@IDType
FuncDeclareParameterList::=FuncDeclareParameter@ε
FuncDeclareParameter::=IDType IDentifier FuncDeclareParameter1
FuncDeclareParameter1::=, FuncDeclareParameter@ε
ExecuteStce::=DataProcessStce@ControlStce@CompoundStce
DataProcessStce::=AssignStce@FunctionCallStce
AssignStce::=AssignExpr ;
Expression::=Expression1@AssignExpr
Expression1::=ArithmeticExpr@RelationalExpr
ArithmeticExpr::=Item ArithmeticExpr1
ArithmeticExpr1::=+ Item ArithmeticExpr@- Item ArithmeticExpr@ε
Item::=Factor Item1
Item1::=* Factor Item@/ Factor Item@% Factor Item@ε
Factor::=( ArithmeticExpr )@CONST@IDentifier@FunctionCall
CONST::=Digits@Character
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
BooleanFactor::=Expression1@! BooleanExpr
AssignExpr::=IDentifier = Expression
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
LoopStce::=ValueDeclaration@LoopExecuteStce@LoopCompoundStce@ε
LoopCompoundStce::={ LoopStceList }
LoopStceList::=LoopStce LoopStceList1
LoopStceList1::=LoopStceList@ε
LoopExecuteStce::=LoopIFStce@FORStce@WHILEStce@DOWHILEStce@RETURNStce@BREAKStce@CONTINUEStce
LoopIFStce::=if ( Expression ) LoopStce LoopIFStce1
LoopIFStce1::=else LoopStce@ε
RETURNStce::=return RETURNStce1
RETURNStce1::=;@Expression ;
BREAKStce::=break;
CONTINUEStce::=continue ;
FunctionBlock::=FunctionDefinition FunctionBlock@ε
FunctionDefinition::=FunctionType IDentifier ( FuncDefinitionParameterList ) CompoundStce
FuncDefinitionParameterList::=FuncDefinitionParameter@ε
FuncDefinitionParameter::=IDType IDentifier FuncDefinitionParameter1
FuncDefinitionParameter1::=, FuncDefinitionParameter@ε`
}