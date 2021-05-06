import axios from '@/axios';

export default {
    list(params) {//所有产品
        return axios.get('/products/all', { params });
    },
    remove(params) {//删除某个产品
        return axios.delete('/products/' + params.id);
    },
    add(params) {//添加某个产品
        return axios.post('/products/add', params);
    },
    detail(params) {//某个产品的详情
        return axios.get('/products/' + params.id);
    },
    edit(params) {//编辑改变后某个产品
        return axios.put('products/edit', params);
    }
}