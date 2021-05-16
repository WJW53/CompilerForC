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
      flagLR0: true, //有一个冲突就全都冲突
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

    //leftName为产生式左部是一个非终结符,stateI是当前状态的编号
    getSonClosure(leftName, stateI) {
      let similar = this.allProject[leftName];
      // console.log(similar);
      let tempArr = [];
      for (let m = 0; m < similar.length; m++) {
        let idx2 = similar[m].indexOf("`"); //把类似的加入Closure(I)中
        if (idx2 === 0) {
          //首位必须是`//92行左右,从if idx2===0之后写
          if (this.closureC[stateI][leftName] === undefined) {
            tempArr.push([...similar[m]]);
          } else {
            //其实我这里没必要做这些处理,因为我的每个产生式都不同且数据结构存储的精确,我循环遍历不可能碰到以前重复的东西啊
            //不对,这个貌似还是得做,因为有这种产生式A->s`A,那这个A我现在加进来了,不能说等下还会反复循环加,那就死循环了
            for (let tmpItm of this.closureC[stateI][leftName]) {
              if (tmpItm.join("") !== similar[m].join("")) {
                //就是说新加进来的,不在该状态里才行
                tempArr.push([...similar[m]]);
              }
            }
          }
          let sonNonTm = similar[m][idx2 + 1]; //比如说:是 Program->`HeadFilesβ  里的HeadFiles
          if (this.nonTerminal.includes(sonNonTm)) {
            //然后继续重复上面的动作,即,将所有不在ClosureI中的形如HeadFiles->`γ加入ClosureI中
            //遍历headfiles的数组,找到有`γ的子数组,并且不在ClosureI中将其加入,
            this.getSonClosure(sonNonTm, stateI); //所以写成递归了
          }
        }
      }
      if (tempArr.length > 0) {
        this.closureC[stateI][leftName] = tempArr;
      }
    },
    //闭包+转换函数
    //单独考虑一下仅有一个`元素的时候,该如何处理
    getClosure(collection) {
      //collection是一个集合,里面有S'->`S等.. Closure(I)是this.closureC[index]
      //保存已经查完的产生式的左部的名字
      //let visited = [];//后来发现不需要
      let index = "State" + this.stateCnt; //第n个状态/项目集,一个状态中一般会有多个项目
      this.closureC[index] = {};
      // console.log('1111');
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
            // console.log(this.nonTerminal);
            if (idx > -1 && this.nonTerminal.includes(nonTm)) {
              //找到了`B
              this.getSonClosure(nonTm, index);
            }
          }
        }
        //visited.push(key); //代表这个非终结符的产生式已经都做完闭包了
      }
      console.log(this.closureC[index]);
      //3.更新Statei,从里面继续重复执行上述两步,知道没有更多的项目能加入Closure(I)中
    },
    //要用LR(0),则任意一项目集(一个状态)不能同时有移进-规约,也不能同时有规约-规约项目的存在,所以设个flagID判断一下
    go_i_x(stateI,X) {//求Statei面临文法符号X时的下一状态
      
    },
    //每次检查一个状态内是否有冲突,有一个返回false则代表有冲突,
    canLR0(stateI) {
      let flag1 = 0,
        flag2 = 0; //移进,规约,默认无冲突
      for (let key in this.closureC[stateI]) {
        let arr = this.closureC[stateI][key]; //二维数组
        for (let arr1 of arr) {
          let idx = arr1.indexOf("`");
          if (idx === arr1.length - 1) {
            flag2++; //规约项目+1
          } else {
            if (!this.nonTerminal.includes(arr1[idx + 1])) {
              flag1++; //移进项目+1
            }
          }
        }
      }
      if ((flag1 > 0 && flag2 > 0) || flag2 > 1) {
        return false; //冲突
      } else {
        return true;
      }
    },
    //今晚还要完善下文法以及将我的TOKEN改为type流
    constructDfaToIdentifyViablePrefix() {},
  },
};
</script>

<style lang="less">
</style>