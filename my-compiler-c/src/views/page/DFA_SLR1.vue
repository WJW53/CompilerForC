<template>
  <div class="grammar-analysis">
    <a-table
      :columns="columnHead"
      :data-source="LRTable"
      :scroll="{ x: 900, y: 800 }"
      class="table"
    >
    </a-table>
  </div>
</template>

<script>
const columnHead = [
  {
    title: "OrderNumber",
    width: 100,
    dataIndex: "OrderNumber",
    key: "OrderNumber",
  },
  {
    title: "StateStack",
    width: 150,
    dataIndex: "StateStack",
    key: "StateStack",
  },
  {
    title: "SymbolsStack",
    dataIndex: "SymbolsStack",
    key: "SymbolsStack",
    width: 150,
  },
  {
    title: "Production",
    dataIndex: "Production",
    key: "Production",
    width: 200,
  },
  {
    title: "InputString",
    dataIndex: "InputString",
    key: "InputString",
    width: 150,
  },
  { title: "Instruction", dataIndex: "Instruction", key: "Instruction" },
];
export default {
  components: {},
  data() {
    return {
      columnHead,
      actionTable: {},
      gotoTable: {},
      canToEmpty: {},
      LRTable: [], //[{里面有6+1个属性,对应表的列头名}]
      allSymbols: this.$store.state.compilation.allSymbols,
      tokenToGram: this.$store.state.compilation.tokenToGram,
      firstData: this.$store.state.compilation.firstData,
      followData: this.$store.state.compilation.followData,
      nonTerminal: this.$store.state.compilation.nonTerminal, //非终结符
      terminal: this.$store.state.compilation.terminal,
      productRight: this.$store.state.compilation.productRight, //二维数组
      productMap: this.$store.state.compilation.productMap, //对象是按ascll排序的
      firstProduction: {}, //所有产生式的first集
      conflictMap: { length: 0 }, //识别活前缀的DFA中的所有冲突的状态集合
      allProject: {}, //扩展文法后的所有项目
      closureC: {}, //项目集规范族(就是所有项目集的集合 / 所有状态的集合)
      stateCnt: -1, //状态的个数,从零开始
      flagLR0: true, //有一个状态冲突就为false
      goIXTable: {}, //{State0:{A:State1,b:State2},State1:{C:State3}}
      ixList: [], //状态I面临文法符号X时的下一个状态,三元式的写法
      followGramSymbols: {}, //存储每个状态I的后继文法符号
      visitedState: [], //存储做完了闭包和状态转换的状态
    };
  },
  //裂开裂开,LR0写完可识别活前缀的DFA后,我判断出有冲突,要改用LR1了,往前探索一步应该就够了
  //但是后来我发现我就四五个状态有移进-规约冲突,且都往前探查一步即可区分,于是针对冲突的状态做处理即可
  //所以我在LR0基础上增加了SLR1
  created() {
    this.startGrammarAnalysis();
  },
  methods: {
    //语法分析开关
    startGrammarAnalysis() {
      // console.log(this.isACanToEmpty("DeclarationStce"));
      this.initPrint();
      this.getAllFirst(); //得到所有First集
      this.getAllFollow();
      console.log(this.followData.FuncDeclareParameter1);
      console.log(this.followData.FuncDeclareParameter);

      console.log(this.followData.HeadFiles);
      console.log(this.followData.CONST);
      this.checkFirstSymbols();
      this.constructDfaToIdentifyViablePrefix();
      let str = "以下是识别活前缀的DFA的状态转换表: \n\n";
      for (let arr of this.ixList) {
        str = str + arr.join("\t") + "\n";
      }
      this.$store.state.compilation.previewData = str;
      // console.log(this.ixList);
      this.getSLR1AnalsisTable();
      console.log("action表: ", this.actionTable);
      console.log("goto表: ", this.gotoTable);
      this.startExecutiveProgram();
    },
    //LR分析的总控程序
    startExecutiveProgram() {
      let inputArr = this.tokenToGram.slice(0);
      inputArr.push("$"); //注意push方法返回的是数组长度!!
      //每六个变量组合成的一个对象就是LRTable的一条数据.  先初始化一些数据
      let OrderNumber = 0,
        StateStack = ["State0"],
        SymbolsStack = ["$"],
        Production = "",
        InputString = inputArr,
        Instruction = "State0和$分别入栈;";
      //但是状态栈和符号栈最后是字符串格式,要记得到时候.join(" ");
      this.LRTable.push({
        key: OrderNumber,
        OrderNumber,
        StateStack: StateStack.join(" "),
        SymbolsStack: SymbolsStack.join(" "),
        Production,
        InputString: InputString.join(" "),
        Instruction: Instruction + "面临输入符号为: " + InputString[0],
      }); //先将初始状态入栈

      let a = InputString.shift(); //首位,注意InputString本身是数组形式
      let stateTop = StateStack[StateStack.length - 1],
        flag = this.actionTable[stateTop][a];
      //accept是分析成功,undefined是源程序中有错误,需要调用对应的错误处理程序
      // console.log(this.actionTable);
      // console.log(flag);
      while (flag !== "accept") {
        ++OrderNumber;
        Production = "";
        Instruction = "当前输入符号为: " + a + "  \n"; //每次先将产生式和说明重新初始化
        if (flag !== undefined) {
          if (typeof flag === "string") {
            //即flag类似为StateI,是个字符串,准备移进,移进之后改变当前输入符号,我放在后面写了
            Instruction += "进行移进动作: " + flag + "和" + a + "分别入栈;";
            SymbolsStack.push(a);
            StateStack.push(flag);
            Instruction += "\n面临输入符号: " + InputString[0];
          } else {
            //flag为数组,[产生式,产生式右部的长度]
            let len = flag[1],
              production = flag[0];
            Production = production.slice(0, production.length - 1); //去掉`
            // console.log(Production, len);
            while (len--) {
              let si = StateStack.pop();
              let ai = SymbolsStack.pop();
              Instruction = Instruction + si + "和" + ai + "分别退栈;";
            }
            let productArr = production.split("->");
            let A = productArr[0],
              right = productArr[1].split(" ");
            // console.log(right);
            // if(right.length===1&&right[0]==='')
            let topPointer = StateStack.length - 1; //准备规约
            SymbolsStack.push(A); //先将A入符号栈,然后从goto表中得到后继状态,并入状态栈
            console.log(this.gotoTable[StateStack[topPointer]], A);
            let nextState = this.gotoTable[StateStack[topPointer]][A];
            StateStack.push(nextState); //注意规约动作并不改变当前输入符号
            Instruction +=
              "进行规约动作: " +
              nextState +
              "和" +
              A +
              "分别入栈;\n即将面临符号仍为: " +
              a;
          }
          let stateString = StateStack.join(","),
            symbolsString = SymbolsStack.join(" "),
            inputString = InputString.join(" ");
          //然后push这个七元式,再更新数据
          this.LRTable.push({
            key: OrderNumber,
            OrderNumber,
            StateStack: stateString,
            SymbolsStack: symbolsString,
            Production,
            InputString: inputString,
            Instruction,
          });
          if (typeof flag === "string") {
            a = InputString.shift(); //移进动作时输入符号才后移一位
          }
          console.log(StateStack.length - 1);
          stateTop = StateStack[StateStack.length - 1];
          console.log(stateTop, a, this.actionTable[stateTop]);
          flag = this.actionTable[stateTop][a];
        } else {
          //找不到就报错
          console.log("Error");
          this.LRTable.push({
            key: OrderNumber,
            OrderNumber,
            StateStack: StateStack.join(","),
            SymbolsStack: SymbolsStack.join(" "),
            Production,
            InputString: InputString.join(" "),
            Instruction: "当前输入符号为: " + a + "  \n" + "此处有语法错误!!",
          });
          break;
        }
      }
      if (flag !== undefined) {
        console.log("分析成功了");
      }
    },
    //构造SLR1分析表
    getSLR1AnalsisTable() {
      let C = this.closureC; //准备遍历所有状态和边
      let obj = this.goIXTable; //状态转换表
      //没能在action表和goto表中出现的都是出错标志,goto表无标志的面积较大,不用怀疑
      for (let stateI in C) {
        if (this.actionTable[stateI] === undefined) {
          this.$set(this.actionTable, stateI, {});
        }
        if (this.gotoTable[stateI] === undefined) {
          this.$set(this.gotoTable, stateI, {});
        }

        const STATE = this.closureC[stateI];
        for (let key in STATE) {
          let arr2d = STATE[key];
          for (let arr of arr2d) {
            let idx = arr.indexOf("`");
            //首先这里考虑个特殊情况,就是S->X`A,A->`,所以我的状态里也有S->XA`
            //故后面这个应该是: 吃了S之后推出的状态与它吃了A之后所goto的状态一致
            if (idx !== arr.length - 1) {
              let X = arr[idx + 1];
              let stateJ = obj[stateI][X]; //goIXTable
              //若项目A->α`Xβ且GO(Ik,X)=Ij
              if (stateJ !== undefined) {
                if (this.terminal.includes(X)) {
                  //若X为终结符
                  this.actionTable[stateI][X] = obj[stateI][X]; //obj是goIXTable
                } else {
                  this.gotoTable[stateI][X] = obj[stateI][X]; //这就是后继状态j
                }
              }
            } else {
              if (idx !== 0) {
                //这是上面说的那种特殊情况,其实就是因为A->`而造成的
                if (this.canToEmpty[arr[idx - 1]]) {
                  // console.log(arr[idx - 1]);
                  this.gotoTable[stateI][key] = this.gotoTable[stateI][
                    arr[idx - 1]
                  ];
                }
                //A->α`,没有A->`是因为这是不可达状态. key就是A
                let name = arr[idx - 1];
                if (name === "Program" && key === "StartProgram") {
                  this.actionTable[stateI]["$"] = "accept"; //接受状态
                  console.log(stateI);
                } else {
                  let str = key + "->" + arr.join(" ");
                  //这里缺了个ele为结束符$的情况?
                  for (let ele of this.followData[key]) {
                    //注意这里一定要-1,因为多个`
                    this.actionTable[stateI][ele] = [str, arr.length - 1]; //即用A->α规约
                  }
                }
              }
            }
          }
        }
      }
    },
    //打印一些数据
    initPrint() {
      console.log(
        "共有 " +
          this.allSymbols.length +
          " 个文法符号(包含非终结符/终结符/空)!"
      );
      console.log("终结符: ", this.terminal);
      console.log("非终结符: ", this.nonTerminal);
      console.log("所有产生式右部: ", this.productRight);
      console.log("所有产生式: ", this.productMap);
      console.log("拓广后的allProject: ", this.allProject);
      console.log("tokenToGrammar: ", this.tokenToGram);
      this.getAllCanToEmpty();
      console.log("所有符号能否推出空: ", this.canToEmpty);
    },
    //看看是否First集求对了
    checkFirstSymbols() {
      let arr = [],
        n1 = 0,
        n2 = 0;
      for (let key in this.firstData) {
        if (this.terminal.includes(key)) {
          n1++;
          arr.push(key);
        } else {
          n2++;
        }
      }
      console.log("First集中共有" + n2 + "个非终结符, " + n1 + "个终结符");
      for (let item of this.terminal) {
        if (!arr.includes(item)) {
          console.log("缺失的终结符有: " + item);
        }
      }
    },
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
      // console.log(this.allProject);
      console.log("扩广文法总共" + count + "个项目");
    },
    getAllCanToEmpty() {
      for (let A of this.allSymbols) {
        this.isACanToEmpty(A);
      }
    },
    //文法符号A能否经过有限次推导,推出空
    //我写的文法若A能推出空,则它前面必有其他的产生式
    //需要避免循环推导问题吗?可用缓存处理,不过我这没必要吧,因为我文法不会造成这种状况
    isACanToEmpty(A) {
      // console.log(this.canToEmpty);
      if (this.canToEmpty[A] !== undefined) {
        return this.canToEmpty[A];
      }
      let obj = this.productMap;
      if (obj[A] !== undefined) {
        let tail = obj[A][obj[A].length - 1];
        if (tail.length === 1 && tail[0] === "ε") {
          this.canToEmpty[A] = true; //这是最后一条产生式
          return true;
        }
        for (let i = 0, lenA = obj[A].length; i < lenA; i++) {
          let arr = obj[A][i];
          for (let j = 0, len = arr.length; j < len; j++) {
            let X = arr[j];
            // console.log(A, X);
            if (this.nonTerminal.includes(X)) {
              //非终结符先查表,表里没有就递归查
              let flag = this.isACanToEmpty(X);
              if (flag === false) {
                break; //这条不用再找了,它都推不出,这一条产生式后面的符号也不用看了
              }
              if (flag === true && j === arr.length - 1) {
                this.canToEmpty[A] = true;
                return true;
              }
            } else {
              this.canToEmpty[X] = X === "ε"; //卧槽了,这条隐藏的好细啊
              if (
                this.canToEmpty[arr[j - 1]] &&
                this.canToEmpty[X] &&
                j === arr.length - 1
              ) {
                this.canToEmpty[A] = true;
                return true;
              } else {
                break;
              }
              //但X为false时这里还不能return,因为A还有其他产生式呢
            }
          }
        }
        //循环都搞完了还不返回,那就是false了
        this.canToEmpty[A] = false;
        return false;
      } else {
        //好像有个地方是终结符,那这里多做个处理
        let flag1 = A === "ε";
        this.canToEmpty[A] = flag1;
        return flag1;
      }
    },
    //有个大问题!可能右部的首非终结符,它自己当前还没求first/follow!那得到的肯定是空数组啊
    //我选用的就是递归,就是先求出所需要的东西,然后再push
    getAllFirst() {
      let n = 0;
      //我的IDentifier,FuncIDentifier,String为终结符
      let obj = this.firstProduction;
      for (let A of this.allSymbols) {
        this.getFirst(A); //没事,我做了去重的,所以即便有重复也没关系
      }
      for (let key in obj) {
        ++n;
        this.firstData[key] = obj[key].all;
      }
      console.log(
        "First集合里共 " + n + " 个符号(非终结/终结/空),以下是First集合: "
      );
      console.log(this.firstData);
    },
    //得到任意文法符号A的First集
    getFirst(A) {
      let obj = this.productMap,
        nonTmA = this.nonTerminal.includes(A);
      if (this.firstProduction[A] === undefined) {
        //A是任一文法符号,所以下面针对终结符有另外的处理
        this.$set(this.firstProduction, A, {}); //第一次的时候
        if (nonTmA) {
          this.firstProduction[A].all = [];
        } else {
          this.firstProduction[A].all = [A];
          return;
        }
      }
      // console.log("First集为: ", this.firstProduction); //没问题,可以响应式
      if (nonTmA) {
        for (let arr of obj[A]) {
          let str = arr.join(" ");
          if (this.firstProduction[A][str] === undefined) {
            this.firstProduction[A][str] = [];
          }
          if (this.terminal.includes(arr[0]) === true) {
            //终结符的话
            this.firstProduction[A][str].push(arr[0]);
            if (this.firstProduction[arr[0]] === undefined) {
              this.$set(this.firstProduction, arr[0], {}); //顺便在终结符时直接求First(a)
              this.firstProduction[arr[0]].all = [arr[0]];
            }
            // console.log("1", this.firstProduction[A]);
          } else {
            //非终结符时
            //形如A->Xα,X属于非终结符,这个all就是存放着First(A),即A的候选式的去重总和,是Array
            if (this.firstProduction[arr[0]] === undefined) {
              // console.log("1", arr[0]);
              this.getFirst(arr[0]); //先求出它的First集,也就是当它的属性all数组长度不在增大时
              // console.log("1结束");
            }
            let temp = this.getNoεOfArr(this.firstProduction[arr[0]].all); //因为这会还没求出arr[0]的first
            this.firstProduction[A][str].push(...temp);
            // console.log(temp);
            // console.log(arr);
            //以下是P99 3.1 步骤(4)
            for (let i = 0, len = arr.length; i < len; i++) {
              //在我的产生式二维数组里,不会单独出现一条形如A:[["ε"]]的,它起码还有别的产生式
              let flag = this.isACanToEmpty(arr[i]);
              if (i > 0 && flag === false && i < len - 1) {
                //到这里不能推出空了
                // console.log(arr[i] + "不能经过有限次推导推出空");
                if (this.terminal.includes(arr[i]) === false) {
                  //终结符的时候,且是第一次
                  if (this.firstProduction[arr[i]] === undefined) {
                    this.$set(this.firstProduction, arr[i], {});
                    this.firstProduction[arr[i]].all = [arr[i]];
                  }
                }
                // console.log(this.firstProduction[arr[i]]);
                if (this.firstProduction[arr[i]] === undefined) {
                  // console.log("2", arr[i]);
                  this.getFirst(arr[i]); //同理先求它的first
                  // console.log("2结束");
                }
                let temp1 = this.getNoεOfArr(this.firstProduction[arr[i]].all);
                this.firstProduction[A][str].push(...temp1);
                // console.log(temp1);
              } else if (flag === true && i === len - 1) {
                // console.log(arr + "可以经过有限次推导推出空");
                this.firstProduction[A][str].push("ε");
              }
            }
            // console.log("3", this.firstProduction[A]);
          }
        }
      }
      for (let k in this.firstProduction[A]) {
        //再把所有产生式的first集取并集
        this.firstProduction[A].all.push(...this.firstProduction[A][k]);
      }
      this.firstProduction[A].all = this.getUniqueArr(
        this.firstProduction[A].all
      ); //再去重
    },
    //用不着啊,,用到的话就遍历吧
    getAllFollow() {
      let arr = this.nonTerminal;
      for (let A of arr) {
        this.getFollow(A);
      }
    },
    //得到非终结符A的Follow集
    getFollow(A = "StartProgram") {
      if (A === "StartProgram") {
        //1.如果A是开始符号的话
        if (this.followData[A] === undefined) {
          this.followData[A] = ["$"];
        }
      }
      if (this.followData[A] === undefined) {
        this.followData[A] = [];
      }
      let obj = this.productMap;
      //2.形如A->αBβ,β只要非空其他均可,α可以为空;将First(β)\{ε}即First(β)除去ε,加入Follow(B)中

      for (let key in obj) {
        for (let arr of obj[key]) {
          let idx = arr.indexOf(A);

          if (idx > -1) {
            //A后面还有符号
            if (idx !== arr.length - 1) {
              let X = arr[idx + 1];
              let flag = this.nonTerminal.includes(X);
              //A不是最后一位且后面有一个终结符
              if (flag === false && X !== "ε") {
                this.followData[A].push(X);
              }
              //3.形如A->αB(α可以是终结符或者非终结符或者直接为空)或者A->αBβ是一个产生式且β=*>ε
              //将Follow(A)加入到Follow(B)中
              if (flag === true) {
                //是非终结符的话,首先直接加入它的First集且非空元素
                let temp = this.getNoεOfArr(this.firstData[X]);
                this.followData[A].push(...temp);
                //ps:这里是精髓哦!!为了S->XAY,A->`的情况,应该跳过A不做判断的,也就是把Y的First加入X的Follow中即可
                //如果X能推出空,那么就把X的下一位且为非终结符的符号β的First加入A中
                // if (this.isACanToEmpty(X)) {
                //   let any = arr[idx + 2]; //β为任意符号,除了空
                //   if (any !== undefined) {
                //     let temp2 = this.getNoεOfArr(this.firstData[any]);
                //     this.followData[A].push(...temp2); //不对啊卧槽,我的follow最后是去重的
                //     //Program::=HeadFiles DeclarationStce int main ( ) CompoundStce FunctionBlock
                //     //这个产生式里,DeclarationStce可以为空,就算把int加入HeadFiles里面,但是DeclarationStce
                //     //的First集里本身也有int,到时候还是会面临移进-规约冲突啊
                //   }
                // }
                //再看β能否经有限次推导推出空,β是个符号串,即从idx+1开始的,arr里的元素
                for (let j = idx + 1; j < arr.length; j++) {
                  let canToε = this.isACanToEmpty(arr[j]);
                  if (canToε === false) {
                    //β中的某一位符号,不能推出空了,直接退出
                    break;
                  }
                  if (j === arr.length - 1 && canToε === true) {
                    if (this.followData[key] === undefined) {
                      this.getFollow(key); //得先求出人家才行啊
                    }
                    this.followData[A].push(...this.followData[key]);
                  }
                }
              }
            } else {
              if (this.followData[key] === undefined) {
                this.getFollow(key); //得先求出人家才行啊
              }
              this.followData[A].push(...this.followData[key]);
            }
          }
        }
      }
      this.followData[A] = this.getUniqueArr(this.followData[A]);
      // console.log(this.followData[A]);
    },
    //数组去重
    getUniqueArr(arr) {
      return Array.from(new Set(arr));
    },
    //得到非ε元素
    getNoεOfArr(arr) {
      return arr.filter((item) => item !== "ε");
    },
    //leftName为产生式左部是一个非终结符,stateI是当前状态的编号
    getSonClosure(leftName, stateI) {
      // console.log(leftName);
      if (this.closureC[stateI][leftName] === undefined) {
        this.closureC[stateI][leftName] = []; //先初始化
      }
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
          let item = temp[i]; //这是每一条产生式
          // for (let j = 0; j < item.length; j++) {//???这个是干嘛的
          let idx = item.indexOf("`"),
            nonTm = item[idx + 1];
          // console.log(nonTm);
          // console.log(this.nonTerminal);
          if (
            idx > -1 &&
            this.nonTerminal.includes(nonTm) &&
            nonTm !== undefined
          ) {
            //注意!!!!!找到了A->...`B...,现在要去找B->`γ
            //但是这里要做个特殊处理就是B可以推出空的时候,就要吧A->αB`β也加入这个闭包I中
            //但是为了action表里那个length是正常的,所以要进行的是用`替换B,
            //即将A->α`β加入该状态中,这个小细节隐藏的很深啊..我找了一俩小时的bug
            if (this.isACanToEmpty(nonTm)) {
              let tempK = [];
              for (let ele of item) {
                if (ele !== nonTm) {
                  tempK.push(ele);
                }
              }
              // [tempK[idx], tempK[idx + 1]] = [tempK[idx + 1], tempK[idx]];
              this.closureC[index][key].push([...tempK]);
            }
            //3.更新Statei,从里面继续重复执行上述两步,直到没有更多的项目能加入Closure(I)中
            this.getSonClosure(nonTm, index); //但是它不能继续找它本身了!!
          }
          // }
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
      if (this.goIXTable[stateI] === undefined) {
        this.$set(this.goIXTable, stateI, {}); //只有第一次才初始化呀
      }
      //添加弧线,stateI本身就是传进来的状态
      if (notBelong !== true) {
        delete this.closureC["State" + this.stateCnt];
        --this.stateCnt; //别忘了再减去一
        this.goIXTable[stateI][X] = existStateI; //指向已经存在的StateI
        this.ixList.push([stateI, X, existStateI]);
      } else {
        this.goIXTable[stateI][X] = "State" + this.stateCnt; //指向最新的状态I
        this.ixList.push([stateI, X, "State" + this.stateCnt]);
      }

      this.visitedState.push(stateI); //代表这个状态我已经做完了闭包和状态转换
    },
    //用了SLR1之后是否还有冲突
    isCanSLR1() {
      let obj = this.conflictMap;
      for (let stateI in obj) {
        if (stateI === "length") {
          continue;
        }
        let arr = [];
        let flag = true;
        for (let key in obj[stateI]) {
          if (key !== "state" && key !== "reduceConflict" && key !== "length") {
            //冲突的规约项目的左部的Follow集,以及移进项目的所有可能移进符号
            arr.push([...obj[stateI][key]]);
          }
        }
        let len = arr.length;
        for (let i = 0; flag === true && i < len; i++) {
          for (let j = i + 1; j < len; j++) {
            let len1 = arr[i].length + arr[j].length;
            let len2 = this.getUniqueArr([...arr[i], ...arr[j]]).length; //去重后长度变短了
            if (len2 < len1) {
              console.log(
                "虽用了SLR1分析法,但状态" + stateI + "仍然存在冲突!!"
              );
              flag = false;
              break;
            }
          }
        }
        if (flag) {
          console.log("用了SLR1分析法,已经解决状态 " + stateI + " 的冲突");
        }
      }
    },
    //要用LR(0),则任意一项目集(一个状态)不能同时有移进-规约,也不能同时有规约-规约项目的存在,所以设个flagID判断一下
    //每次检查一个状态内是否有冲突,有一个返回false则代表有冲突,
    isCanLR0(stateI) {
      let flag1 = 0,
        flag2 = 0; //移进,规约,默认无冲突
      let shiftArr = [],
        reduceArr = [];
      for (let key in this.closureC[stateI]) {
        // console.log(key);
        let arr = this.closureC[stateI][key]; //二维数组
        for (let arr1 of arr) {
          let idx = arr1.indexOf("`");
          if (idx === arr1.length - 1 && idx !== 0) {
            //认为A->`是不可达状态
            flag2++; //规约项目+1
            if (this.followData[key] === undefined) {
              this.getFollow(key);
            }
            let str = key + "->" + arr1.join(" ");
            reduceArr.push([str, arr1.length - 1]); //-1是因为要去掉那个`
          } else {
            if (
              this.nonTerminal.includes(arr1[idx + 1]) === false &&
              idx !== arr1.length - 1
            ) {
              flag1++; //移进项目+1
              shiftArr.push(arr1[idx + 1]);
            }
          }
        }
      }
      // console.log(flag1,flag2);
      if ((flag1 > 0 && flag2 > 0) || flag2 > 1) {
        // console.log(stateI, this.closureC[stateI]);
        this.$set(this.conflictMap, stateI, { state: this.closureC[stateI] });
        this.conflictMap[stateI]["shiftConflict"] = shiftArr;
        this.conflictMap[stateI]["reduceConflict"] = reduceArr;
        this.conflictMap.length++;
        for (let arr of this.conflictMap[stateI]["reduceConflict"]) {
          let key = arr[0].split("->")[0];
          this.conflictMap[stateI][key] = this.followData[key];
          console.log(key + "的Follow集合", this.followData[key]);
        }
        return false; //冲突
      } else {
        return true;
      }
    },
    //今晚还要完善下文法以及将我的TOKEN改为type流(曾经某天的注释而已..)
    constructDfaToIdentifyViablePrefix() {
      this.updateGrammar();
      // this.closureC["State" + this.stateCnt] = { StartProgram: [["`", "Program"]] }; //设为该DFA的初态
      let project = this.allProject.StartProgram.slice(0, 1);
      //project为右部即二维数组,name是它的左部即key
      // console.log(project);
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
      console.log("总共" + this.stateCnt + "个状态(项目集)");
      console.log("识别活前缀的DFA的状态转换表如下: \n", this.goIXTable);
      console.log("LR(0)的项目集规范族如下: \n", this.closureC);
      for (let i = 0; i <= this.stateCnt; i++) {
        // console.log(this.isCanLR0("State" + i));
        this.isCanLR0("State" + i);
      } //裂开了,需要用LR1,文法里有4个状态都出现了同时出现移进-规约的冲突
      console.log(
        "共含有 " +
          this.conflictMap.length +
          " 个移进-规约或规约-规约的冲突状态如下: \n",
        this.conflictMap
      );
      this.isCanSLR1(); //SLR1能否解决所有冲突
    },
  },
};
</script>

<style lang="less">
</style>