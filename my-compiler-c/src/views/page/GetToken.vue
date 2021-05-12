<template>
  <div class="get-token">
    GetToken
    <!-- <textarea readonly class="result1" v-model="token"></textarea> -->
    <a-table
      :columns="columnHead"
      :data-source="token"
      :scroll="{ x: 800, y: 1100 }"
      class="table"
    >
    </a-table>
    <!-- <textarea readonly class="errors" v-model="errors"></textarea> -->
  </div>
</template>
<script>
import specTable from "@/storage/LexTable.js";
console.log(specTable);
const columnHead = [
  {
    title: "TokenName",
    width: 200,
    dataIndex: "TokenName",
    key: "TokenName",
  },
  {
    title: "TokenCode",
    width: 200,
    dataIndex: "TokenCode",
    key: "TokenCode",
  },
  { title: "row", dataIndex: "row", key: "row", width: 200 },
  { title: "column", dataIndex: "column", key: "column" },
];

// const dataArr = [];
// for (let i = 0; i < 100; i++) {
//   dataArr.push({
//     key: i,
//     TokenName: `Edrward ${i}`,
//     TokenCode: 32,
//     row: `London Park no. ${i}`,
//     column:``;
//   });
// }
export default {
  data() {
    return {
      columnHead,
      specTable,
      row: 1,
      column: 0,
      idTable: this.$store.state.compilation.idData, //标识符-种别码表
      errors: "以下是该源代码的错误信息: \n", //每条都是字符串
      newTextData: null, //过滤后的新字符串
      token: this.$store.state.compilation.tokenData,
      syn: null,
      idx: 0,//做索引
      count:0,//做key
    };
  },
  watch: {
    // "$store.state.changeCode": {
    //   handler(nv, ov) {
    //     //   if(nv===true){
    //     //       console.log('11111');
    //     //       console.log(this);
    //     //再让它取反
    //     //   }
    //   },
    // },
  },
  created() {
    this.startGetToken();
  },
  methods: {
    startGetToken() {
      this.filterResource(this.$store.state.compilation.previewData);
      this.$store.state.compilation.previewData = this.newTextData;
      let len = this.newTextData.length;
      while (this.syn !== 0 && this.idx < len) {
        this.scanner(this.newTextData);
        if (this.syn === 700) {
          //标识符,即id
          let key = this.token[this.token.length - 1][0];
          console.log(key);
          if (this.idTable[key] === undefined) {
            //如果还没存进id表中,就存
            this.idTable[key] = this.token[this.token.length - 1];
          }
        }
      }
    },
    searchReserve(reserveWord, s) {
      //查找保留字,成功查找则返回对应种别码,否则返回700种别码,即为标识符
      return reserveWord[s] === undefined ? 700 : reserveWord[s];
    },
    filterResource(txtData) {
      //预处理,去除注释,但是一定不要去除空白符,例 int i=3;而且我们要保留\n,计算row呢
      let len = txtData.length,
        tempString = "";
      for (let i = 0; i < len; i++) {
        if (txtData[i] === "/" && txtData[i + 1] === "/") {
          //若为单行注释则忽略后面的,直至遇到回车换行
          while (txtData[i] !== "\n") {
            i++;
          }
        }
        if (txtData[i] === "/" && txtData[i + 1] === "*") {
          //若为多行注释
          i += 2;
          while (txtData[i] !== "*" || txtData[i + 1] !== "/") {
            i++;
            if (i === len) {
              this.errors += "注释出错,没有找到 */,程序结束!!\n";
              return;
            }
          }
          i += 2; //跨过
        }
        // if(!(this.isWs1(txtData[i])))//算了这里还不能去掉这些空白符,因为要计算行列值
        tempString += txtData[i];
      }
      this.newTextData = tempString;
    },
    //我还有浮点数和字符串没写呢..
    scanner(data) {
      //根据DFA状态转换图设计. 分析模块,算法核心
      let i_1 = null, //i的前一位索引
        str = "", //每次都初始化为"",这个就是token name
        temp = null,
        ch = data[this.idx], //当前字符
        flag = true; //默认没有错
      while (this.isWs2(ch)) {
        //跳过空字符
        if (ch === "\n") {
          this.row++;
          this.column = 0;
        } else {
          this.column++;
        }
        this.idx++;
        ch = data[this.idx];
      }
      if (this.isLetter(data[this.idx])) {
        //开头为字母
        str += data[this.idx++];
        while (this.isLetter(data[this.idx]) || this.isDigit(data[this.idx])) {
          str += data[this.idx++];
        }
        if (data[i_1] === '"' && data[this.idx] === '"') {
          //这有问题
          this.syn = 600; //字符串的种别码
        } else {
          this.syn = this.searchReserve(specTable.reserveWord, str); //保留字或者id的种别码
        }
        console.log(this.syn, "letters");
      } else if (this.isDigit(data[this.idx])) {
        //数字
        i_1 = this.idx - 1;
        while (this.isDigit(data[this.idx])) {
          str += data[this.idx++];
        }
        if (data[i_1] === '"') {
          while (this.isLetter(data[this.idx])) {
            str += data[this.idx++];
          }
          if (this.idx < data.length - 1) {
            //因为最后起码还得有个'"'
            this.syn = 600; //字符串的种别码
          } else {
            this.errors += "该字符串没有闭合,程序出错,请修改!!\n";
          }
        } else {
          this.syn = 400; //整数的种别码
        }
        console.log(this.syn, "digit");
      } else if (this.isBoundary(data[this.idx])) {
        //界符
        str += data[this.idx++];
        this.syn = this.specTable.boundary[str];
        console.log(this.syn, "boundary");
      } else if (this.isOperator(data[this.idx])) {
        //超前搜索,记得回退一格
        //运算符
        temp = data[this.idx];
        str += temp;
        if (temp === "+") {
          //+,++,+=, +++(这其实就是先++再+,所以不用管这种)
          this.idx++;
          if (data[this.idx] === "+") {
            this.syn = 203;
            str += data[this.idx];
          } else if (data[this.idx] === "=") {
            this.syn = 230;
            str += data[this.idx];
          } else {
            this.idx--;
            this.syn = 209;
          }
          this.idx++;
        } else if (temp === "-") {
          this.idx++;
          if (data[this.idx] === "-") {
            this.syn = 204;
            str += data[this.idx];
          } else if (data[this.idx] === "=") {
            this.syn = 231;
            str += data[this.idx];
          } else {
            this.idx--;
            this.syn = 210;
          }
          this.idx++;
        } else if (temp === "*") {
          //*,*=
          this.idx++;
          if (data[this.idx] === "=") {
            this.syn = 232;
            str += data[this.idx];
          } else {
            this.idx--;
            this.syn = 206;
          }
          this.idx++;
        } else if (temp === "/") {
          this.idx++;
          if (data[this.idx] === "=") {
            this.syn = 233;
            str += data[this.idx];
          } else {
            this.idx--;
            this.syn = 207;
          }
          this.idx++;
        } else if (temp === "%") {
          this.idx++;
          if (data[this.idx] === "=") {
            this.syn = 234;
            str += data[this.idx];
          } else {
            this.idx--;
            this.syn = 208;
          }
          this.idx++;
        } else if (temp === "<") {
          //<,<<,<=,<<=
          this.idx++; //后移,超前搜索
          if (data[this.idx] === "=") {
            this.syn = 212;
            str += data[this.idx];
          } else if (data[this.idx] === "<") {
            str += data[this.idx];
            if (data[++this.idx] === "=") {
              this.syn = 225;
              str += data[this.idx];
            } else {
              this.idx--;
              this.syn = 223;
            }
          } else {
            this.idx--;
            this.syn = 211;
          }
          this.idx++;
        } else if (temp === ">") {
          this.idx++; //后移,超前搜索
          if (data[this.idx] === "=") {
            str += data[this.idx];
            this.syn = 214;
          } else if (data[this.idx] === ">") {
            str += data[this.idx];
            if (data[++this.idx] === "=") {
              this.syn = 224;
              str += data[this.idx];
            } else {
              this.idx--; //因为这里是<<嘛,所以这先退一位,因为最后一句又加了的
              this.syn = 222;
            }
          } else {
            this.idx--;
            this.syn = 213;
          }
          this.idx++;
        } else if (temp === "=") {
          this.idx++;
          if (data[this.idx] === "=") {
            str += data[this.idx];
            this.syn = 215;
          } else {
            this.idx--;
            this.syn = 219;
          }
          this.idx++;
        } else if (temp === "!") {
          //!,!=
          this.idx++;
          if (data[this.idx] === "=") {
            str += data[this.idx];
            this.syn = 216;
          } else {
            this.idx--;
            this.syn = 205;
          }
          this.idx++;
        } else if (temp === "&") {
          //&,&&,&=,取址符暂时不管了
          this.idx++;
          if (data[this.idx] === "&") {
            str += data[this.idx];
            this.syn = 217;
          } else if (data[idx] === "=") {
            str += data[this.idx];
            this.syn = 226;
          } else {
            this.idx--;
            this.syn = 236;
          }
          this.idx++;
        } else if (temp === "|") {
          //|,||,|=
          this.idx++;
          if (data[this.idx] === "|") {
            str += data[this.idx];
            this.syn = 218;
          } else if (data[this.idx] === "=") {
            str += data[this.idx];
            this.syn = 227;
          } else {
            this.idx--;
            this.syn = 240;
          }
          this.idx++;
        } else if (this.idx === data.length) {
          this.syn = 0; //结束了!!
        } else {
          //剩余的直接赋值对应种别码即可
          this.syn = this.specTable.operator[data[this.idx++]];
          str += data[this.idx];
        }
        console.log(this.syn, "operator");
      } else {
        flag = false;
        this.errors += "error：there is no exist " + data[this.idx] + "\n";
      }
      if (flag) {
        this.count++;
        console.log(this.syn);
        this.token.push({
          key: this.count,
          TokenName: str,
          TokenCode: this.syn,
          row: this.row,
          column: this.column,
        });
      }
    },
    isDigit(ch) {
      return ch <= "9" && ch >= "0";
    },

    isLetter(ch) {
      //字母或者下划线
      return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_";
    },

    isWs1(ch) {
      return (
        ch === " " ||
        ch === "\r" ||
        ch === "\t" ||
        ch === "\v" ||
        ch === "\f" ||
        ch === "\0"
      );
    },
    isWs2(ch) {
      return ch === "\n" || this.isWs1(ch);
    },
    isOperator(ch) {
      return this.specTable.operator[ch] !== undefined;
    },
    isBoundary(ch) {
      return this.specTable.boundary[ch] !== undefined;
    },
    error(info) {
      console.log(info);
    },
  },
};
</script>
<style lang='less'>
.table {
  width: 980px;
}
textarea {
  display: inline-block;
  width: 800px;
  height: 800px;
  resize: none;
  outline: none;
  //   border: 0;
  margin-right: 20px;
}
</style>