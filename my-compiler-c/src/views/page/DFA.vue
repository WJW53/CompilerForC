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
      stateCnt: -1, //状态的个数,从零开始
      flagLR0: true, //有一个冲突就全都冲突
      // dfaPath:{},
      goIXTable: {}, //{State0:{A:State1,b:State2},State1:{C:State3}}
      followGramSymbols: {}, //存储每个状态I的后继文法符号
      visitedState: [], //存储做完了闭包和状态转换的状态
    };
  },
  //裂开裂开,LR0写完可识别活前缀的DFA后,我判断出有冲突,要改用LR1了,往前探索一步应该就够了
  created() {
    // console.log(this.nonTerminal);
    // console.log(this.productRight);
    // console.log(this.productMap);
    this.constructDfaToIdentifyViablePrefix();
  },
  methods: {
    //得到所有项目
    updateGrammar() {
      let count = 0;
      for (let key in this.productMap) {
        let len1 = this.productMap[key].length;
        this.allProject[key] = []; //数组直接赋值是可以有响应式的
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
      console.log(this.allProject);
      console.log(count);
    },
    //leftName为产生式左部是一个非终结符,stateI是当前状态的编号
    getSonClosure(leftName, stateI) {
      this.closureC[stateI][leftName] = []; //先初始化
      let similar = this.allProject[leftName];
      // console.log(similar);
      let tempArr = this.closureC[stateI][leftName];
      for (let m = 0; m < similar.length; m++) {
        let idx2 = similar[m].indexOf("`"); //把类似的加入Closure(I)中
        if (idx2 === 0) {
          //首位必须是`
          //其实我这里没必要做这些处理,因为我的每个产生式都不同且数据结构存储的精确,我循环遍历不可能碰到以前重复的东西啊
          //不对,这个还是得做,因为有这种产生式A->s`A,那这个A我现在加进来了,不能说等下还会反复循环加,那就死循环了
          if (tempArr.length === 0) {
            //也就是第一次进来的时候
            tempArr.push([...similar[m]]);
          } else {
            let addFlag = true;
            for (let tmpItm of tempArr) {
              if (tmpItm.join("") === similar[m].join("")) {
                //就是说新加进来的,不在该状态里才行
                addFlag = false;
                break;
              }
            }
            addFlag && tempArr.push([...similar[m]]); //没重复的再加
          }
          // console.log(this.closureC[stateI][leftName]);
          let sonNonTm = similar[m][idx2 + 1]; //比如说:是 Program->`HeadFilesβ  里的HeadFiles
          if (sonNonTm !== undefined && this.nonTerminal.includes(sonNonTm)) {
            //然后继续重复上面的动作,即,将所有不在ClosureI中的形如HeadFiles->`γ加入ClosureI中
            //遍历headfiles的数组,找到有`γ的子数组,并且不在ClosureI中将其加入,
            this.getSonClosure(sonNonTm, stateI); //所以写成递归了
          }
        }
      }
    },
    //闭包+转换函数
    //单独考虑一下仅有一个`元素的时候,该如何处理
    getClosure(collection) {
      //collection是一个集合,里面有S'->`S等.. Closure(I)是this.closureC[index]
      //保存已经查完的产生式的左部的名字
      ++this.stateCnt;
      let index = "State" + this.stateCnt; //第n个状态/项目集,一个状态中一般会有多个项目
      // this.closureC[index] = {};//不行,这样没有响应式
      this.$set(this.closureC, index, {});
      // console.log('1111');
      for (let key in collection) {
        this.closureC[index][key] = collection[key]; //1. 先把该项目集里的所有项目加进来
      }
      //2.若A->α`Bβ在Closure(I)中,则将所有不在它里面的形如B->`γ的项目加进来
      for (let key in this.closureC[index]) {
        let temp = this.closureC[index][key]; //二维数组
        for (let i = 0; i < temp.length; i++) {
          let item = temp[i];
          for (let j = 0; j < item.length; j++) {
            let idx = item.indexOf("`"),
              nonTm = item[idx + 1];
            // console.log(nonTm);
            // console.log(this.nonTerminal);
            if (
              idx > -1 &&
              this.nonTerminal.includes(nonTm) &&
              nonTm !== undefined
            ) {
              //找到了A->...`B...,现在要去找B->`γ
              //3.更新Statei,从里面继续重复执行上述两步,知道没有更多的项目能加入Closure(I)中
              this.getSonClosure(nonTm, index); //但是它不能继续找它本身了!!
            }
          }
        }
      }
      // console.log(this.closureC);
    },
    //得到状态I的所有的后继文法符号,注意边界和只有一个`的情况
    getStateIFollowGramSymbols(stateI) {
      let res = [];
      let obj = this.closureC[stateI];
      for (let key in obj) {
        let arr2d = obj[key];
        for (let arr of arr2d) {
          let idx = arr.indexOf("`");
          if (idx > -1 && idx !== arr.length - 1) {
            res.push(arr[idx + 1]);
          }
        }
      }
      this.followGramSymbols[stateI] = res;
      // this.$set(this.followGramSymbols, stateI, res);
    },
    //求Statei面临文法符号X时的下一状态GO(I,X) = Closure( move(I,X) )
    go_i_x(stateI, X) {
      //先求move(I,X),记得在合适的时机将this.stateCnt++;
      let move_i_x = {};
      let empty = true;
      let obj = this.closureC[stateI];
      for (let key in obj) {
        let arr2d = obj[key];
        for (let arr of arr2d) {
          let idx = arr.indexOf("`");
          if (idx > -1 && arr[idx + 1] === X) {
            let temp = [];
            if (move_i_x[key] === undefined) {
              move_i_x[key] = [];
            }
            temp = [...arr];
            temp[idx] = X; //将其变为后继状态
            temp[idx + 1] = "`";
            move_i_x[key].push(temp);
            empty = false; //代表move_i_x不为空
          }
        }
      }
      //再求Closure(move_i_x)===GO(I,X)还不能属于this.closureC
      if (empty === false) {
        this.getClosure(move_i_x); //这时已经在this.closureC内部创建一个新的状态StateI了
      }
      //新状态还不能属于this.closureC,这个挺麻烦啊,,..
      let notBelong = true,
        cnt = this.stateCnt,
        existStateI = null; //默认不属于
      let newObj = this.closureC["State" + cnt];
      //必须先精确比较每一层的长度都相同
      let len2 = 0,
        cnt2 = 0;
      for (let newKey in newObj) {
        len2 += newObj[newKey].length;
        cnt2++;
      }
      for (let i = 0; i < cnt && notBelong === true; i++) {
        //遍历比较所有的状态
        let curKey = "State" + i,
          curObj = this.closureC[curKey],
          len1 = 0,
          cnt1 = 0;
        //记录两个状态的长度(即产生式的长度),由于我用的对象数组嵌套,所以只能遍历++,统计长度了
        for (let curKey2 in curObj) {
          len1 += curObj[curKey2].length;
          cnt1++;
        }
        //总长度或者总行数不同
        if (len1 !== len2 || cnt1 !== cnt2) {
          continue;
        }
        for (let newKey2 in newObj) {
          //遍历最新的状态里的项目,newKey2为S,E这种的左部name
          if (curObj[newKey2] === undefined) {
            break; //出现了没有的左部那么直接结束此次循环
          } else {
            //遍历比较所有的产生式是否相同,注意二维数组,我不是引用值,所以每次要拍平比较
            //现在问题的本质就是比较这个二维数组的内容是否相同,顺序可能不一致噢
            let newArr2D = newObj[newKey2],
              curArr2D = curObj[newKey2];
            if (newArr2D.length !== curArr2D.length) {
              //先保证同一个非终结符的产生式条数一致
              break;
            }
            let tempCache = {}; //直接映射,每个一维数组就是一个属性值
            for (let itemArr of newArr2D) {
              tempCache[itemArr] = true;
            }
            //只有所有产生式都匹配到了,才算属于,即相同
            let sameNum = 0;
            for (let itemArr2 of curArr2D) {
              if (tempCache[itemArr2] === true) {
                sameNum++;
              } else {
                break;
              }
            }
            if (sameNum === newArr2D.length) {
              notBelong = false;
              existStateI = curKey; //记录这个原先的状态I
            }
          }
        }
      }
      this.$set(this.goIXTable, stateI, {});
      //添加弧线,stateI本身就是传进来的状态
      if (notBelong !== true) {
        delete this.closureC["State" + this.stateCnt];
        --this.stateCnt; //别忘了再减去一
        this.goIXTable[stateI][X] = existStateI; //指向已经存在的StateI
      } else {
        this.goIXTable[stateI][X] = "State" + this.stateCnt; //指向最新的状态I
      }
      this.visitedState.push(stateI); //代表这个状态我已经做完了闭包和状态转换
    },
    //要用LR(0),则任意一项目集(一个状态)不能同时有移进-规约,也不能同时有规约-规约项目的存在,所以设个flagID判断一下
    //每次检查一个状态内是否有冲突,有一个返回false则代表有冲突,
    canLR0(stateI) {
      let flag1 = 0,
        flag2 = 0; //移进,规约,默认无冲突
      for (let key in this.closureC[stateI]) {
        // console.log(key);
        let arr = this.closureC[stateI][key]; //二维数组
        for (let arr1 of arr) {
          let idx = arr1.indexOf("`");
          if (idx === arr1.length - 1 && idx !== 0) {
            //认为A->`是不可达状态
            flag2++; //规约项目+1
          } else {
            if (!this.nonTerminal.includes(arr1[idx + 1])) {
              flag1++; //移进项目+1
            }
          }
        }
      }
      // console.log(flag1,flag2);
      if ((flag1 > 0 && flag2 > 0) || flag2 > 1) {
        console.log(stateI, this.closureC[stateI]);
        return false; //冲突
      } else {
        return true;
      }
    },
    //今晚还要完善下文法以及将我的TOKEN改为type流
    constructDfaToIdentifyViablePrefix() {
      this.updateGrammar();
      // this.closureC["State" + this.stateCnt] = { StartProgram: [["`", "Program"]] }; //设为该DFA的初态
      let project = this.allProject.StartProgram.slice(0, 1);
      //project为右部即二维数组,name是它的左部即key
      console.log(project);
      this.getClosure({ StartProgram: project });
      //对this.closureC中的每个项目集即状态I及其对应的每个文法符号X,求GO(I,X);重复执行这一大条,直至C中不再增加状态
      let len1 = null,
        len2 = null;
      do {
        len1 = this.stateCnt;
        for (let stateI in this.closureC) {
          // let objStateI = this.closureC[stateI];
          if (this.visitedState.includes(stateI) === false) {
            //如果该状态还没做状态转换
            this.getStateIFollowGramSymbols(stateI);
            let gramSymbolsArr = this.followGramSymbols[stateI];
            // console.log(gramSymbolsArr);
            for (let X of gramSymbolsArr) {
              this.go_i_x(stateI, X); //会产生新的状态
            }
          }
        }
        len2 = this.stateCnt;
      } while (len1 < len2); // || this.visitedState.length < this.stateCnt + 1
      console.log(this.goIXTable);
      console.log(this.closureC);
      for (let i = 0; i <= this.stateCnt; i++) {
        // console.log(this.canLR0("State" + i));
        this.canLR0("State" + i);
      }//裂开了,需要用LR1,文法里有4个状态都出现了同时出现移进-规约的冲突
    },
  },
};
</script>

<style lang="less">
</style>