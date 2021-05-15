<template>
  <div class="DFA">DFA</div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      nonTerminal: this.$store.state.compilation.nonTerminal, //非终结符
      terminal: this.$store.state.compilation.terminal,
      productRight: this.$store.state.compilation.productRight, //二维数组
      // productMap: new Map(),//map记录了顺序
      productMap: this.$store.state.compilation.productMap, //对象是按ascll排序的
      allProject: {},
      // allProject: new Map(),
      closureC: {}, //项目集规范族(就是所有项目集的集合)
      stateCnt: 0, //状态的个数,从零开始
    };
  },
  created() {
    // console.log(this.nonTerminal);
    // console.log(this.productRight);
    // console.log(this.productMap);
    this.updateGrammar();
  },
  methods: {
    updateGrammar() {
      let count = 0;
      for (let key in this.productMap) {
        let len1 = this.productMap[key].length;
        this.allProject[key] = [];
        for (let i = 0; i < len1; i++) {
          let len2 = this.productMap[key][i].length;
          let temp = null;
          for (let j = 0; j <= len2; j++) {
            //为这个数组里的每个地方插入一个`
            temp = this.productMap[key][i].slice(0);
            if (temp.length === 1 && temp[0] === "ε") {
              //这种是A->ε的情况,则只写为A->`
              temp.splice(j, 1, "`");
              j++; //为了打破这次的循环
            } else {
              temp.splice(j, 0, "`");
            }
            this.allProject[key].push(temp);
            // console.log(temp);
            count++;
          }
        }
      }
      // this.closureC["State" + this.stateCnt] = { StartProgram: [["`", "Program"]] }; //设为该DFA的初态
      let project = this.allProject.StartProgram.slice(0, 1); //设为该DFA的初态
      //project为右部即二维数组,name是它的左部即key
      console.log(project);
      console.log(this.allProject);
      console.log(count);
      // this.closureC["State" + this.stateCnt] = {};
      this.getClosure({ StartProgram: project });
    },
    //闭包+转换函数
    //单独考虑一下仅有一个`元素的时候,该如何处理
    getClosure(collection) {
      //collection是一个集合,里面有S'->`S等.. Closure(I)是this.closureC[index]
      let index = "State" + this.stateCnt; //第n个状态/项目集,一个状态中一般会有多个项目
      this.closureC[index] = {};
      console.log('1111');
      for (let key in collection) {
        //1.
        this.closureC[index][key] = collection[key]; //先把该项目集里的所有项目加进来
      }
      //2.若A->α`Bβ在Closure(I)中,则将所有不在它里面的形如B->`γ的项目加进来
      for (let key in this.closureC[index]) {
        let temp = this.closureC[index][key]; //二维数组
        for (let i = 0; i < temp.length; i++) {
          let item = temp[i];
          for (let j = 0; j < item.length; j++) {
            let idx = item.indexOf("`"),
              nonTm = item[idx + 1];
              console.log(nonTm);
              console.log(this.nonTerminal);
            if (idx > -1 && this.nonTerminal.includes(nonTm)) {
              //找到了`B
              let similar = this.allProject[nonTm];
              console.log(similar);
              let tempArr = [];
              for (let m = 0; m < similar.length; m++) {
                let idx2 = similar[m].indexOf("`"); //把类似的加入Closure(I)中
                if (
                  idx2 > -1 &&
                  this.nonTerminal.includes(similar[m][idx2 + 1])
                ) {
                  tempArr.push(similar[m].slice()); //添加进来
                }
              }
              if (tempArr.length > 0) {
                this.closureC[index][nonTm] = tempArr;
              }
            }
          }
        }
      }
      console.log(this.closureC[index]);
      //3.更新Statei,从里面继续重复执行上述两步,知道没有更多的项目能加入Closure(I)中
    },
    go_i_x() {},
    constructDfaToIdentifyViablePrefix() {},
  },
};
</script>

<style lang="less">
</style>