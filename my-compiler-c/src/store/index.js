import Vue from 'vue';
import Vuex from 'vuex';
import router from '../router/index.js';
Vue.use(Vuex);
// console.log(router.options.routes);
export default new Vuex.Store({
  // strict: true,
  state: {
    //用于切换菜单的闭合状态,false代表不闭合
    collapsed: false,
    menuRoutes: router.options.routes,//存储菜单的路由
    compilation: {//存放每一遍的输出结果
      previewData: '',//左侧预览区的内容
      resultData: '',//右侧结果的内容
      textData: '',//C语言源程序的字符串形式
      tokenData: [],//词法分析后的结果,每条为数组[token,种别码,行,列],不能用对象,因为对象属性名和值唯一的,而我们这里可能重复属性名!!
      idData: {},//id表
    },
    changeCode: false,
  },
  getters: {
    getPreviewData(state) {
      return state.compilation.previewData;
    }
  },
  mutations: {
    changeCollapsed(state) {
      state.collapsed = !state.collapsed;
    },
    setPreviewData(state, value) {
      state.compilation.previewData = value;
    },
    setResultData(state, value) {
      state.compilation.resultData = value;
    },
    setTextData(state, value) {
      state.compilation.textData = value;
    },
    setTokenData(state, value) {
      state.compilation.tokenData = value;
    },


  },
  actions: {
    changeCollapsed({ commit }) {
      commit('changeCollapsed');
    },
    changePreviewData({ commit }, payload) {
      commit('setPreviewData', payload.value);
    },
    changeResultData({ commit }, payload) {
      commit('setResultData', payload.value);
    },
    changeTextData({ commit }, payload) {
      commit('setTextData', payload.value);
    },
    changeTokenData({ commit }, payload) {
      commit('setTokenData', payload.value);
    },

  },
  modules: {
  },
});
