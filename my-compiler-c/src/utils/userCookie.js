import Cookies from 'js-cookie';
/**
 * 
 * @param {Object} info 
 */
export function setCookie(info) {
    const arr = Object.entries(info);//键值对,二维数组
    for (const [key, value] of arr) {
        Cookies.set(key, value);
    }
    return true;
}