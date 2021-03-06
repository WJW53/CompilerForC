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
VariableDeclarationList::=SingleVariableDeclaration VariableDeclarationList1
SingleVariableDeclaration::=VARIABLE@SingleVariableDeclaration1
SingleVariableDeclaration1::== Expression@ε
VariableDeclarationList1::=;@, VariableDeclarationList
FunctionDeclaration::=FunctionType FuncIDentifier ( FuncDeclareParameterList ) ;
FunctionType::=void@IDType
FuncDeclareParameterList::=FuncDeclareParameter@ε
FuncDeclareParameter::=IDType FuncDeclareParameter1
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
Factor::=( ArithmeticExpr )@CONST@VARIABLE@FunctionCall
CONST::=Number@Character
VARIABLE::=IDentifier
FunctionCall::=FuncIDentifier ( RealReferenceList )
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
AssignExpr::=IDentifier AssignOperator Expression
AssignOperator::==@+=@-=@*=@/=@%=@>>=@<<=@&=@|=
FunctionCallStce::=FunctionCall ;
ControlStce::=IFStce@FORStce@WHILEStce@DOWHILEStce@RETURNStce
CompoundStce::={ SentenceList }
SentenceList::=Sentence SentenceList1
SentenceList1::=SentenceList@ε
IFStce::=if ( Expression ) Sentence IFStce1
IFStce1::=else Sentence@ε
FORStce::=for ( Expression ; Expression ; Expression ) LoopStce
WHILEStce::=while ( Expression ) LoopStce
DOWHILEStce::=do LoopCompoundStce while ( Expression )
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
FunctionDefinition::=FunctionType FuncIDentifier ( FuncDefinitionParameterList ) CompoundStce
FuncDefinitionParameterList::=FuncDefinitionParameter@ε
FuncDefinitionParameter::=IDType IDentifier FuncDefinitionParameter1
FuncDefinitionParameter1::=, FuncDefinitionParameter@ε
PrintfStce::=printf ( String PrintfID ) ;
PrintfID::=, IDentifier PrintfID1
PrintfID1::=PrintfID@ε
ScanfStce::=scanf ( String ScanfID ) ;
ScanfID::=, & IDentifier ScanfID1
ScanfID1::=ScanfID@ε
Zero::=0
NonZero::=1@2@3@4@5@6@7@8@9
Digit::=Zero@NonZero
Digits::=Digit Digits1
Digits1::=Digits@ε
Character::=_@a@b@c@d@e@f@g@h@i@j@k@l@m@n@o@p@q@r@s@t@u@v@w@x@y@z@A@B@C@D@E@F@G@H@I@J@K@L@M@N@O@P@Q@R@S@T@U@V@W@X@Y@Z
IntergerPart::=NonZero Digits1@Zero
OptionalFraction::=. Digits@ε
OptionalExponent::=ExponentE ExponentSymbols Digits@ε
ExponentE::=e@E
ExponentSymbols::=+@-@ε
FloatNumber::=IntergerPart OptionalFraction OptionalExponent
Number::=IntergerPart@FloatNumber`
}