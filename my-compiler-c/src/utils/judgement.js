export default class Judge {
    constructor() {
        console.log('judgement!');
    }
    
    static isDigit(ch) {
        return ch <= '9' && ch >= '0';
    }

    static isLetter(ch) {//字母或者下划线
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
    }

    static isWs(ch) {
        return ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t' || ch === '\v' || ch === '\f' || ch === '\0';
    }

    static error(s) {
        console.log(s);
    }
}