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
import obj from "@/storage/production2.js";
// import obj from "@/storage/production3.js";
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
      productMap: this.$store.state.compilation.productMap, //对象是按ascll排序的
      allSymbols: this.$store.state.compilation.allSymbols,
    };
  },
  created() {
    // console.log(this.myProduction);
    let arr = this.myProduction.split("\n");
    let temp = null,
      len = arr.length;
    let terminalArr = [];
    for (let i = 0; i < len; i++) {
      temp = arr[i].split("::=");
      this.nonTerminal[i] = temp[0];
      let arr1 = (this.productRight[i] = temp[1].split("@"));
      for (let k = 0, len1 = arr1.length; k < len1; k++) {
        let t = arr1[k].split(" ");
        terminalArr.push(...t);
      }
      for (let j = 0, len2 = this.productRight[i].length; j < len2; j++) {
        this.productRight[i][j] = this.productRight[i][j].split(" ");
      }
      // this.productMap.set(temp[0], this.productRight[i]);
      this.productMap[temp[0]] = this.productRight[i];
    }
    terminalArr = Array.from(new Set(terminalArr));
    terminalArr = terminalArr.filter(
      (item) => !this.nonTerminal.includes(item)
    ); //空,算终结符
    this.terminal.push(...terminalArr);
    this.allSymbols.push(...this.terminal, ...this.nonTerminal);
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