import axios from 'axios';
import store from './store';
const instance = axios.create({
    baseURL: 'https://mallapi.duyiedu.com'
});
instance.interceptors.request.use((config) => {
    // console.log(config);
    //添加appkey,除了含/passport的都需要appkey
    if(!config.url.includes('/passport')){
        config = {
            ...config,
            params:{
                ...config.params,
                appkey: store.state.user.appkey
            }
        }
    }
    // console.log(config);
    return config;
}, (error) => {
    return Promise.reject(error);
});

instance.interceptors.response.use((response) => {
    // console.log(response);
    if (response.data.status === 'fail') {
        return Promise.reject(response.data.msg);
    } else {
        // console.log(response);
        return response.data.data;
    }
}, (error) => Promise.reject(error));

export default instance;
