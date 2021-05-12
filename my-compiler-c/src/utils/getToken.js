function isDigit(ch) {
    return ch <= '9' && ch >= '0';
}

function isLetter(ch) {//字母或者下划线
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
}

function isWs(ch) {
    return ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t' || ch === '\v' || ch === '\f' || ch === '\0';
}

function error(info) {
    console.log(info);
}

function getNextChar(s, i) {//s是当前字符串,i是下一个字符的索引
    while (isWs(s[i])) {
        i++;
    }
    return s[i];
}