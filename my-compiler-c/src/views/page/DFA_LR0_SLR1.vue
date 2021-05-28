<template>
  <div class="grammar-analysis">
    <a-table
      :columns="columnHead"
      :data-source="LRTable"
      :scroll="{ x: 900, y: 700 }"
      class="table"
    >
    </a-table>
  </div>
</template>

<script>
import { makeNode } from "@/storage/Tree.js";
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
      tokenData: this.$store.state.compilation.tokenData, //[[六元组],]
      allSymbols: this.$store.state.compilation.allSymbols,
      tokenToGram: this.$store.state.compilation.tokenToGram, //token经过二次封装后
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
      rowLines: [],
    };
  },
  //写好文法,有难度噢...  我是好的文法+LR0项目簇+识别活前缀的DFA+SLR1的做法,或者直接上LR1分析法也行更方便
  created() {
    this.startGrammarAnalysis();
  },
  methods: {
    makeNode,
    //语法分析开关
    startGrammarAnalysis() {
      // console.log(this.isACanToEmpty("DeclarationStce"));
      this.initPrint(); //打印一些信息,并在其中执行isACanToEmpty函数!!
      this.getAllFirst(); //得到所有First集
      this.getAllFollow(); //得到所有的Follow集合
      this.checkFirstSymbols(); //检查符号个数等是否正确
      this.constructDfaToIdentifyViablePrefix(); //构造LR0项目簇和识别活前缀的DFA
      let str = "以下是识别活前缀的DFA的状态转换表: \n\n";
      for (let arr of this.ixList) {
        str = str + arr.join("\t") + "\n";
      }
      this.$store.state.compilation.previewData = str;
      console.log("状态转换表: ", this.ixList);
      this.getSLR1AnalsisTable(); //构造SLR1分析表
      console.log("action表: ", this.actionTable);
      console.log("goto表: ", this.gotoTable);
      this.startExecutiveProgram(); //开启LR分析总控程序
    },
    //LR分析的总控程序
    startExecutiveProgram() {
      let cnt = 0,
        tokenData = this.tokenData,
        cacheShift = [];
      let nodeStack = []; //存储规约后的节点
      let inputArr = this.tokenToGram.slice(0);
      let rowArr = this.rowLines.slice(0),
        row = "???";
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
        StateStack: StateStack.join(","),
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
          // console.log(flag);
          let state = null; //string类型为移进,数组类型为规约
          if (typeof flag === "string") {
            state = flag;
            //即state类似为StateI,是个字符串,准备移进,移进之后改变当前输入符号,我放在后面写了
            Instruction += "进行移进动作: " + state + "和" + a + "分别入栈;";
            SymbolsStack.push(a);
            row = rowArr.shift();
            let node = new this.makeNode(a, undefined, ++cnt, row);
            nodeStack.push(node); //移进时,创建新节点并入栈
            cacheShift.push(node); //将所有叶子节点加进来,它天然就是有序的,因为我要干一件事儿
            StateStack.push(state);
            Instruction += "\n面临输入符号: " + InputString[0];
          } else {
            // console.log(flag);
            let len = flag[1],
              production = flag[0];
            Production = production.slice(0, production.length - 2); //去掉空格和`
            let childrenNodes = []; //装着当前这层即将要规约的节点
            while (len--) {
              let si = StateStack.pop();
              let ai = SymbolsStack.pop();
              childrenNodes.push(nodeStack.pop()); //出栈并加入children中
              Instruction = Instruction + si + "和" + ai + "分别退栈;";
            }
            let productArr = production.split("->");
            let A = productArr[0],
              right = productArr[1].split(" "); //每个元素就是节点的label
            // console.log(Production,len,right);
            let topPointer = StateStack.length - 1; //准备规约
            SymbolsStack.push(A); //先将A入符号栈,然后从goto表中得到后继状态,并入状态栈
            // console.log(
            //   "规约:",
            //   StateStack[topPointer],
            //   this.gotoTable[StateStack[topPointer]],
            //   A
            // );
            let nextState = this.gotoTable[StateStack[topPointer]][A];
            StateStack.push(nextState); //注意规约动作并不改变当前输入符号
            // console.log(
            //   "NextState: " + nextState,
            //   A + "的Follow集合为: " + this.followData[A]
            // );
            Instruction +=
              "进行规约动作:状态 " +
              nextState +
              "和符号 " +
              A +
              "分别入栈;\n即将面临符号仍为: " +
              a;
            ////逆向构造AST
            nodeStack.push(
              new this.makeNode(A, childrenNodes.reverse(), ++cnt)
            ); //再将父节点加入栈中
          }
          if (state !== null) {
            a = InputString.shift(); //移进动作时输入符号才后移一位
            // console.log(a, InputString.length);
          }
          //此处的actionTable里若报错,说明是stateTop为undefined,也就是上面规约操作从goto表中
          //得到的状态为undefined!!一般是规约长度不对,比如对应的产生式不应是当前这个,故退栈个数不同,导致最终找不到状态.
          stateTop = StateStack[StateStack.length - 1];

          // console.log(
          //   StateStack.length - 1,
          //   "状态 " + stateTop,
          //   "面临" + a,
          //   this.actionTable[stateTop]
          // );
          //然后push这个七元式,再更新数据
          this.LRTable.push({
            key: OrderNumber,
            OrderNumber,
            StateStack: StateStack.join(","),
            SymbolsStack: SymbolsStack.join(" "),
            Production,
            InputString: InputString.join(" "),
            Instruction,
          });
          flag = this.actionTable[stateTop][a];
        } else {
          //找不到就报错
          console.log(
            "Error",
            this.closureC[StateStack[StateStack.length - 1]]
          );
          let arr = [],
            obj = this.actionTable[StateStack[StateStack.length - 1]];
          for (let key in obj) {
            arr.push(key);
          }
          let errorStr = "此处期待满足下述任一文法符号: " + arr.join("、");
          let stateString = StateStack.join(","),
            symbolsString = SymbolsStack.join(" "),
            inputString = InputString.join(" ");
          this.LRTable.push({
            key: OrderNumber,
            OrderNumber,
            StateStack: stateString,
            SymbolsStack: symbolsString,
            Production,
            InputString: inputString,
            Instruction:
              "当前输入符号为: " +
              a +
              "  \n" +
              "第 " +
              row +
              " 行有语法错误!!\n" +
              errorStr,
          });
          break;
        }
      }
      if (flag === "accept") {
        ++OrderNumber;
        StateStack.pop();
        SymbolsStack.push("$");
        this.LRTable.push({
          key: OrderNumber,
          OrderNumber,
          StateStack: StateStack.join(","),
          SymbolsStack: SymbolsStack.join(" "),
          Production: "",
          InputString: InputString.join(" "),
          Instruction: "恭喜您!!源程序无语法错误!!LR分析成功",
        });
        console.log("LR分析成功!!");
        console.log(cacheShift);
        //来吧还有件事儿没干呢,就是最底层的源代码有些符号因为我是进行了一次封装的,所以它不是最初的样子了
        for (let i = 0, len = cacheShift.length; i < len; i++) {
          let tempNodeName = cacheShift[i].label,
            tokenName = tokenData[i].TokenName;
          if (tempNodeName !== tokenName) {
            //因为我在GetToken中对最初的token流做了一次封装,所以这里需要逆向..
            let node = new this.makeNode(tokenName, undefined, ++cnt);
            // if (cacheShift[i].children === undefined) {
            cacheShift[i].children = [node]; //其实这里直接这样就足够了因为本身就是最底层终结符规约一次
            // } else {
            //   cacheShift[i].children.push(node);
            // }
          }
        }
        console.log(nodeStack); //里面只有根节点并且label为Program就对了,你也可以在详细看看Children
        this.$store.state.compilation.AST = nodeStack; //OK完美
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
          // if (key === "Program") {
          //   console.log(stateI, STATE[key]);
          // }
          for (let arr of arr2d) {
            let idx = arr.indexOf("`");
            //首先这里考虑个特殊情况,就是S->X`A,A->`,所以我的状态里也有S->XA`
            //故后面这个应该是: 吃了S之后推出的状态与它吃了A之后所goto的状态一致
            if (idx !== arr.length - 1) {
              let X = arr[idx + 1];
              let stateJ = obj[stateI][X]; //goIXTable
              //若项目A->α`Xβ且GO(Ik,X)=Ij
              if (stateJ !== undefined) {
                // //我这里有写的有问题,这个写不写无所谓,只是确实有一种特殊情况要考虑,我想想要写在哪里放在哪里
                // // //这是上面说的那种特殊情况,其实就是因为A->`而造成的,只是这段代码没用,是错误的
                // if (this.canToEmpty[arr[idx - 1]]) {
                //   // console.log(arr[idx - 1]);
                //   this.gotoTable[stateI][arr[idx - 1]] =
                //     obj[stateI][arr[idx - 1]];
                //   console.log(this.gotoTable[stateI][key]); //这个,..这个bug,太nb了..
                // }
                // if (arr[1] === "DeclarationStce") {
                //   console.log(stateI, STATE);
                // } //这是当初找bug而打印的
                if (this.terminal.includes(X)) {
                  //若X为终结符
                  this.actionTable[stateI][X] = stateJ; //obj是goIXTable
                }
                if (this.nonTerminal.includes(X)) {
                  this.gotoTable[stateI][X] = stateJ; //这就是后继状态j
                }
              }
            } else {
              if (idx !== 0) {
                // if (arr[1] === "DeclarationStce") {
                //   console.log(stateI, STATE);
                // } //这是当初找bug而打印的
                // if (key === "Program") {
                //   console.log(stateI, STATE[key], arr);
                // }
                //A->α`,没有A->`是因为这是不可达状态. key就是A
                let name = arr[idx - 1];
                if (name === "Program" && key === "StartProgram") {
                  this.actionTable[stateI]["$"] = "accept"; //接受状态,到底设为$还是accept呢?
                  console.log("结束状态在: " + stateI);
                } else {
                  let str = key + "->" + arr.join(" ");
                  //这里缺了个ele为结束符$的情况?
                  for (let ele of this.followData[key]) {
                    //注意这里一定要-1,因为多个`
                    this.actionTable[stateI][ele] = [str, arr.length - 1]; //即用A->α规约
                  }
                  // if (key === "Program") {
                  //   console.log(str);
                  // }
                  this.actionTable[stateI]["$"] = [str, arr.length - 1];
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
      for (let item of this.tokenData) {
        this.rowLines.push(item.row);
      }
      console.log("净化后的源程序的所有TokenRow: ", this.rowLines);
      console.log("终结符: ", this.terminal);
      console.log("非终结符: ", this.nonTerminal);
      console.log("所有产生式右部: ", this.productRight);
      console.log("所有产生式: ", this.productMap);
      console.log("拓广后的allProject: ", this.allProject);
      console.log("tokenToGrammar: ", this.tokenToGram);
      this.getAllCanToEmpty(); //得到所有能经过有限次推导出空的符号,并缓存,注意也有ε
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
    //得到所有能经过有限次推导出空的文法符号并缓存
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
      if (this.followData[A] === undefined) {
        if (A === "StartProgram") {
          this.followData[A] = ["$"]; //1.如果A是开始符号的话
        } else {
          this.followData[A] = []; //不是的话
        }
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
                //ps:后来发现这里写没用,应该在求闭包的时候判断
                //为了S->XAY,A->`的情况,应该跳过A不做判断的,也就是把Y的First加入X的Follow中即可
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
              if (tmpItm.join(" ") === similar[m].join(" ")) {
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
            //先做个特殊情况处理就是A->`时,就是在getClosure中的处理
            let cache = [];
            let item = similar[m];
            for (let t = idx2 + 1, len = item.length; t < len; t++) {
              if (this.canToEmpty[item[t]]) {
                let tempK = [],
                  sonNonTm = item[t];
                cache.push(sonNonTm);
                for (let ele of item) {
                  if (cache.includes(ele) === false) {
                    //就是把之前推出空的滤过
                    tempK.push(ele);
                  }
                }
                let f = true;
                for (let arr of similar) {
                  //遍历temp的已有产生式
                  if (arr.join(" ") === tempK.join(" ")) {
                    f = false;
                    break; //就是查重
                  }
                }
                if (f === true) {
                  tempArr.push([...tempK]);
                }
              } else {
                break;
              }
            }
            //然后继续重复上面的动作,即,将所有不在ClosureI中的形如HeadFiles->`γ加入ClosureI中
            //遍历headfiles的数组,找到有`γ的子数组,并且不在ClosureI中将其加入,
            this.getSonClosure(sonNonTm, stateI); //所以写成递归了
          }
          if (sonNonTm === undefined) {
            let f = true, //都要先查看是否有重复
              tempK = similar[m];
            for (let arr of tempArr) {
              //遍历temp的已有产生式
              if (arr.join(" ") === tempK.join(" ")) {
                f = false;
                break; //就是查重
              }
            }
            if (f === true) {
              tempArr.push([tempK]);
            }
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
      for (let key in collection) {
        this.closureC[index][key] = collection[key]; //1. 先把该项目集里的所有项目加进来
      }
      //2.若A->α`Bβ在Closure(I)中,则将所有不在它里面的形如B->`γ的项目加进来
      for (let key in this.closureC[index]) {
        let temp = this.closureC[index][key]; //二维数组
        // console.log(index, key);
        for (let i = 0; i < temp.length; i++) {
          let item = temp[i]; //这是每一条产生式
          let idx = item.indexOf("`"),
            nonTm = item[idx + 1];
          // console.log(nonTm,this.nonTerminal);
          if (this.nonTerminal.includes(nonTm) && nonTm !== undefined) {
            //注意!!!!!找到了A->...`B...,现在要去找B->`γ
            //但是这里要做个特殊处理就是B可以推出空的时候,就要吧A->α`β也加入这个闭包I中
            //但是为了action表里那个length是正常的,所以要进行的是用`替换B,
            //即将A->α`β加入该状态中,这个小细节隐藏的很深啊..我找了很久的bug,但是最大的bug是在go_i_x这个函数里对于'不属于'的没写好
            //后来发现还得做成β判断每个是否都能有限次推导出空才行,C
            let cache = [];
            for (let t = idx + 1, len = item.length; t < len; t++) {
              if (this.canToEmpty[item[t]]) {
                let tempK = [],
                  sonNonTm = item[t];
                cache.push(sonNonTm);
                for (let ele of item) {
                  if (cache.includes(ele) === false) {
                    //就是把之前推出空的滤过
                    tempK.push(ele);
                  }
                }
                let f = true;
                for (let arr of temp) {
                  //遍历temp的已有产生式
                  if (arr.join(" ") === tempK.join(" ")) {
                    f = false;
                    break; //就是查重
                  }
                }
                if (f === true) {
                  // console.log(index,key, this.closureC[index][key], tempK);
                  this.closureC[index][key].push([...tempK]);
                }
              } else {
                break;
              }
            }
            // console.log(cache);
            // if (this.isACanToEmpty(nonTm)) {
            //   //其实用这个,对于我的文法貌似就够了,只是为了严谨我写了上面的
            //   let tempK = [];
            //   for (let ele of item) {
            //     if (ele !== nonTm) {
            //       //就是把之前推出空的滤过
            //       tempK.push(ele);
            //     }
            //   }
            //   let f = true;
            //   for (let arr of temp) {
            //     //遍历temp的已有产生式
            //     if (arr.join(" ") === tempK.join(" ")) {
            //       f = false;
            //       break; //就是查重
            //     }
            //   }
            //   if (f === true) {
            //     // console.log(index, this.closureC[index][key], tempK);
            //     this.closureC[index][key].push([...tempK]);
            //   }
            // }
            //3.更新Statei,从里面继续重复执行上述两步,直到没有更多的项目能加入Closure(I)中
            this.getSonClosure(nonTm, index); //但是它不能继续找它本身了!!
          }
        }
        // console.log(this.closureC);
      }
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
    //不对..而且后来没用上这个函数,..留着吧,也是曾经为了该BUG而思考的过程..
    go_i_empty() {
      let arr = [],
        obj = this.canToEmpty;
      for (let key in obj) {
        if (obj[key]) {
          arr.push(key);
        }
      }
      let C = this.closureC;
      for (let stateI in C) {
        let state = C[stateI];
        for (let k in state) {
          for (let arr1d of state[k]) {
            //arr1d就是每条产生式
            let idx = arr1d.indexOf("`");
            let nonTm = arr1d[idx + 1];
            let preX = arr1d[idx - 1];
            if (this.nonTerminal.includes(nonTm) && arr.includes(nonTm)) {
              let tempK = [];
              for (let ele of arr1d) {
                if (ele !== nonTm) {
                  tempK.push(ele);
                }
              }
              //应该要做β连续可推出空时候的处理..
              //让前一个状态,指向当前状态的下一个状态(先加入tempK)
              if (preX !== undefined) {
                //GO(S1,preX)==S2(也就是当前的stateI);S2--nonTM-->S3
                //所以我们先得找到这个S1然后,当S1吃了preX之后我们加一条弧让它指向S3,再将tempK加入S3中k里,成为一条产生式
                //注意:变更为嵌套数组存弧,因为可能不止一条,
                for (let S1 in C) {
                  if (this.goIXTable[S1] !== undefined && S1 !== stateI) {
                    let arr = this.goIXTable[S1][preX];
                    // console.log(arr);
                    if (arr !== undefined) {
                      for (let itemState of arr) {
                        if (itemState === stateI) {
                          let S3Arr = this.goIXTable[stateI][nonTm];
                          // console.log(S3Arr);
                          for (let S3 of S3Arr) {
                            let tempArr2d = this.closureC[S3][k]; //也就是S3中需要含有k->preX nonTm ` β 我们要找到这个S3
                            if (tempArr2d !== undefined) {
                              for (let a1 of tempArr2d) {
                                if (
                                  a1.indexOf("`") === idx + 1 &&
                                  a1[idx] === nonTm &&
                                  a1[idx - 1] === preX
                                ) {
                                  //也就是说,找到了这个S3了
                                  this.closureC[S3][k].push(tempK);
                                  this.goIXTable[S1][preX].push(S3);
                                  this.ixList.push([S1, preX, S3]);
                                  break;
                                }
                              }
                            }
                          }
                        }
                        //这是原先goIXTable的终点值为字符串,也就是"StateI"时的写法,但现在变为数组了,不能这么写了
                        // this.closureC[S3][k].push(tempK);
                        // this.goIXTable[S1][preX] = [...arr, S3];
                        // console.log(S1, preX, S3);
                        // this.ixList.push([S1, preX, S3]);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
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
            temp[idx + 1] = "`"; //交换`和X的位置
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
        let flag1 = true; //默认该条相同
        for (let newKey2 in newObj) {
          if (flag1) {
            //遍历最新的状态里的项目,newKey2为S,E这种的左部name
            if (curObj[newKey2] === undefined) {
              flag1 = false; //出现了没有的左部那么直接结束此次循环,但是break无法跳出当前循环啊!!!!
              break;
            } else {
              //遍历比较所有的产生式是否相同,注意二维数组,我不是引用值,所以每次要拍平比较
              //现在问题的本质就是比较这个二维数组的内容是否相同,顺序可能不一致噢
              let newArr2D = newObj[newKey2],
                curArr2D = curObj[newKey2];
              if (newArr2D.length !== curArr2D.length) {
                //先保证同一个非终结符的产生式条数一致
                flag1 = false;
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
                  flag1 = false; //有一个不同,剩下的就都不用匹配了啊
                  break;
                }
              }
              if (sameNum === newArr2D.length) {
                continue; //只是这个左部对应的所有产生式相同而已,还有其他左部还没判断呢,也就是newKey2
              } else {
                flag1 = false;
              }
            }
          }
        }
        if (flag1 === true) {
          //比完之后,说明已经存在一个状态是相同的了,不用再比较了
          existStateI = curKey;
          notBelong = false; //false代表属于
          break;
        }
      }
      //
      if (this.goIXTable[stateI] === undefined) {
        this.$set(this.goIXTable, stateI, {}); //只有第一次才初始化呀
      }
      if (this.goIXTable[stateI][X] === undefined) {
        this.goIXTable[stateI][X] = [];
      }
      //添加弧线,stateI本身就是传进来的状态
      if (notBelong !== true) {
        // console.log(this.closureC["State" + this.stateCnt]);
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
    //判断用了SLR1之后是否还有冲突
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
          // console.log(key + "的Follow集合", this.followData[key]);
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
      // this.go_i_empty();
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
    //数组去重
    getUniqueArr(arr) {
      return Array.from(new Set(arr));
    },
    //得到非ε元素
    getNoεOfArr(arr) {
      return arr.filter((item) => item !== "ε");
    },
  },
};
</script>

<style lang="less">
</style>