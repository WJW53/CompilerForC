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

/**
 * 获取用户的cookie信息
 */
export function getUserCookie() {
    return {
        username: Cookies.get('username'),
        appkey: Cookies.get('appkey'),
        role: Cookies.get('role'),
        email: Cookies.get('email'),
    }
}

/**
 * 移除用户的cooki信息
 */
export function removeUserCookie(){
    Cookies.remove('username');
    Cookies.remove('appkey');
    Cookies.remove('role');
    Cookies.remove('email');
    return true;
}