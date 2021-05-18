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
import obj from "@/storage/production.js";
export default {
  components: {
    LeftMenu,
    SliderNav,
  },
  data() {
    return {
      key: new Date().getTime(),
      myProduction: obj.myProduction,
      productionTable: [],
      nonTerminal: this.$store.state.compilation.nonTerminal, //非终结符
      terminal: this.$store.state.compilation.terminal,
      productRight: this.$store.state.compilation.productRight, //三维数组
      // productMap: new Map(),//map记录了顺序
      productMap: this.$store.state.compilation.productMap,//对象是按ascll排序的
    };
  },
  created() {
    // console.log(this.myProduction);
    let arr = this.myProduction.split("\n");
    let temp = null,
      len = arr.length;
    for (let i = 0; i < len; i++) {
      temp = arr[i].split("::=");

      this.nonTerminal[i] = temp[0];
      this.productRight[i] = temp[1].split("@");
      for (let j = 0, len2 = this.productRight[i].length; j < len2; j++) {
        this.productRight[i][j] = this.productRight[i][j].split(" ");
      }
      // this.productMap.set(temp[0], this.productRight[i]);
      this.productMap[temp[0]] = this.productRight[i];
    }
    console.log(this.nonTerminal);
    // console.log(this.productRight);
    console.log(this.productMap);
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