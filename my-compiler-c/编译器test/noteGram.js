Factor::=UnaryExpr@( IDType ) Factor
UnaryExpr::=PostfixExpr@++ UnaryExpr@-- UnaryExpr@UnaryOperator Factor@sizeof UnaryExpr@sizeof ( IDType )
PostfixExpr::=PrimaryExpr PostfixExpr1
PrimaryExpr::=( Expression )@CONST@VARIABLE@String@FunctionCall
PostfixExpr1::=. IDentifier PostfixExpr1@++ PostfixExpr1@-- PostfixExpr1@ε
UnaryOperator::=&@*@-@~