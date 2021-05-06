import Vue from 'vue';
import Vuex from 'vuex';
import router from '../router/index.js';
Vue.use(Vuex);
// console.log(router.options.routes);
export default new Vuex.Store({
  state: {
    //用于切换菜单的闭合状态,false代表不闭合
    collapsed: false,
    menuRoutes: router.options.routes,//存储菜单的路由
  },
  mutations: {
    changeCollapsed(state) {
      state.collapsed = !state.collapsed;
    },
  },
  actions: {
    changeCollapsed({ commit }) {
      commit('changeCollapsed');
    },
  },
  modules: {
  },
});
