<template>
  <div class="home">
    <left-menu :key="key"></left-menu>
    <div :class="{ 'main-app': true, 'menu-fold': $store.state.collapsed }">
      <slider-nav></slider-nav>
      <!-- 根据路由动态展示主要内容区的数据 -->

    </div>
  </div>
</template>

<script>
import LeftMenu from "./components/Menu";
import SliderNav from "./components/SliderNav";
export default {
  components: {
    LeftMenu,
    SliderNav,
  },
  data() {
    return {
      key: new Date().getTime(),
    };
  },
  methods: {},
  // watch: {
  //   $route() {
  //     this.key = new Date().getTime();//这是为了重新刷新路由组件的
  //   },
  // },
};
</script>

<style lang="less">
// 这里用less写法即可,千万不要加上scoped,另,得加个~才能正确解析
@import url("~@/assets/css/home.less");

</style>