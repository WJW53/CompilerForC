// const addOpt = '+', subOpt = '-', mulOpt = '*', divOpt = '/';
const addOpt = ['+', '-'], mulOpt = ['*', '/','%'];
const relationOpt = ['<', '<=', '>', '>=', '!=', '=='];
const assignOpt = ['=','/=','*=','%=','+=','-=','<<=','>>=','&=','^=','|='];
//还有个逗号运算符呢?到时候直接写'表达式',',','表达式'吗
const smallLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',];
const bigLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const idPre = [smallLetters, bigLetters, '_'];//标识符的前缀
const zero = 0;
const nonZero = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const digit = [0, nonZero];
const digits = [digit];//闭包怎么写
const character = [addOpt, mulOpt, idPre, digit];
const string = [[idPre,string],''];
