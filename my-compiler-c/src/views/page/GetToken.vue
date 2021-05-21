<template>
  <div class="get-token">
    <a-table
      :columns="columnHead"
      :data-source="token"
      :scroll="{ x: 800, y: 1100 }"
      class="table"
    >
    </a-table>
    <textarea readonly class="errors" v-model="errors"></textarea>
  </div>
</template>
<script>
import specTable from "@/storage/LexTable.js";
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
  { title: "type", dataIndex: "type", key: "type", width: 200 },
  { title: "row", dataIndex: "row", key: "row", width: 200 },
  { title: "column", dataIndex: "column", key: "column" },
];
export default {
  data() {
    return {
      columnHead,
      specTable,
      row: 1,
      column: 0,
      idTable: {}, //标识符-种别码表
      errors: "以下是净化后的源代码的错误信息: \n", //每条都是字符串
      newTextData: null, //过滤后的新字符串
      token: [],
      syn: null,
      idx: 0, //做索引
      count: 0, //做key
      purifyTextData: "", //暂时没用上这个变量
      type: "", //每个token的类型
      timer: null, //定时器
      tokenToGram: [], //token改造的当前程序的语法单位流
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
    "$store.state.compilation.previewData": {
      immediate: true,
      handler(n, o) {
        // console.log("1");//不行不行,这样的话每次要过1s才显示出来,太慢了
        // if (this.timer !== null) {
        //   clearTimeout(this.timer);
        // } else {
        //   this.timer = setTimeout(this.startGetToken, 1000);
        // }
        this.startGetToken();
      },
    },
  },
  created() {
    // this.startGetToken();
  },
  mounted() {},
  methods: {
    startGetToken() {
      this.filterResource(this.$store.state.compilation.textData);
      this.$store.state.compilation.newTextData = this.newTextData;
      this.$store.state.compilation.previewData = this.$store.state.compilation.newTextData;
      let len = this.newTextData.length;
      while (this.syn !== 0 && this.idx < len) {
        //种别码为0就是出错了
        this.scanner(this.newTextData);
        if (this.syn === 700) {
          //标识符,即id
          let key = this.token[this.token.length - 1]["TokenName"];
          // console.log(key);
          if (this.idTable[key] === undefined) {
            //如果还没存进id表中,就存
            this.idTable[key] = this.token[this.token.length - 1].TokenCode;
          }
        }
      }
      this.$store.state.compilation.idData = this.idTable;
      // console.log(this.idTable);
      this.$store.state.compilation.tokenData = this.token;
      this.$store.state.compilation.purifyTextData = this.purifyTextData;
      // console.log(this.purifyTextData);
      this.timer = null;
      for (let i = 0; i < this.token.length; i++) {
        this.changeTypeForGram(this.token[i], this.token[i + 1]);
      }
      this.$store.state.compilation.tokenToGram = this.tokenToGram;
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
    //核心算法
    scanner(data) {
      //根据DFA状态转换图设计. 分析模块,算法核心
      let i_1 = null, //i的前一位索引
        str = "", //每次都初始化为"",这个就是token name
        temp = null,
        ch = data[this.idx], //当前字符
        flag = true,
        len = data.length; //默认没有错
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
      this.column++;
      if (this.isLetter(data[this.idx])) {
        //开头为字母
        str += data[this.idx++];
        while (this.isLetter(data[this.idx]) || this.isDigit(data[this.idx])) {
          str += data[this.idx++];
        }
        this.syn = this.searchReserve(specTable.reserveWord, str); //保留字或者id的种别码
        // console.log(this.syn, "letters");
      } else if (this.isDigit(data[this.idx])) {
        let flag1 = false,
          flag2 = false,
          flag3 = false,
          flag4 = false;
        //各种数字
        if (data[this.idx] !== "0") {
          //1-9
          str += data[this.idx++];
          while (this.isDigit(data[this.idx])) {
            str += data[this.idx++];
          }
          ch = data[this.idx];
          if (this.isAboutDigit(ch)) {
            this.syn = 410; //10进制整数
          } else if (ch.toLowerCase() === "e") {
            //jump
            flag2 = true; //floatE判断
          } else if (ch === ".") {
            flag1 = true;
          } else {
            this.errorUnexpectedNumber();
            return;
          }
        } else {
          str += data[this.idx++];
          while (data[this.idx] <= "7" && data[this.idx] >= "0") {
            str += data[this.idx++];
          }
          if (str.length === 1 && this.isAboutDigit(data[this.idx])) {
            this.syn = 400; //因为是一个单独的0
          } else if (data[this.idx] === "." && str.length === 1) {
            flag1 = true; //跳到浮点数判断,0.xxx
          } else if (data[this.idx] === "." && str.length > 1) {
            this.errorUnexpectedNumber();
            return;
          } else if (data[this.idx].toLowerCase() === "x") {
            //16进制
            str += data[this.idx++];
            ch = data[this.idx];
            if (this.isInt16(ch)) {
              while (this.isInt16(ch)) {
                str += ch;
                this.idx++;
                ch = data[this.idx];
              }
              if (str.length > 2 && this.isAboutDigit(ch)) {
                this.syn = 416; //16进制
              } else {
                this.errorUnexpectedNumber();
                return;
              }
            }
          } else if (this.isAboutDigit(data[this.idx])) {
            //8进制
            this.syn = 408;
          } else {
            this.errorUnexpectedNumber();
            return;
          }
        }
        //当前字符为'.'
        if (flag1) {
          str += data[this.idx++];
          ch = data[this.idx];
          if (this.isDigit(ch)) {
            while (this.isDigit(ch)) {
              str += data[this.idx++];
              ch = data[this.idx];
            }
            if (this.isAboutDigit(ch)) {
              this.syn = 800; //浮点数
            } else if (ch.toLowerCase() === "e") {
              flag2 = true; //跳到判断科学计数法去floatE
            } else {
              this.errorUnexpectedNumber();
              return;
            }
          } else {
            this.errorUnexpectedNumber();
            return;
          }
        }
        if (flag2) {
          //当前字符为e/E
          str += data[this.idx++];
          ch = data[this.idx];
          if (ch === "+" || ch === "-") {
            str += data[this.idx++];
            if (this.isDigit(data[this.idx])) {
              flag3 = true;
            }
          } else if (this.isDigit(ch)) {
            flag3 = true;
          } else {
            this.errorUnexpectedNumber();
            return;
          }
        }
        if (flag3) {
          str += data[this.idx++];
          ch = data[this.idx];
          while (this.isDigit(ch)) {
            str += data[this.idx++];
            ch = data[this.idx];
          }
          if (this.isAboutDigit(ch)) {
            this.syn = 803; //floatE
          } else {
            this.errorUnexpectedNumber();
            return;
          }
        }
        // console.log(this.syn, "digit");
      } else if (this.isBoundary(data[this.idx])) {
        //界符,记得区分字符串和字符的种别码
        i_1 = this.idx;
        let error_row = this.row;
        str += data[this.idx]; //拼上"
        this.syn = this.specTable.boundary[str];
        if (this.syn === 308) {
          //字符串
          this.idx++; //先后移一位
          while (data[this.idx] !== '"' && this.idx < len) {
            str += data[this.idx++];
          }
          if (this.idx === len) {
            flag = false;
            this.errors +=
              "没有找到与第" + error_row + "行匹配的双引号,程序出错,请修改!!\n";
            this.syn = 0;
            return;
          } else {
            str += data[this.idx];
            this.syn = 600; //字符串
          }
        } else if (this.syn === 309) {
          //字符
          let ascll_10 = data[++this.idx].charCodeAt();
          str += data[this.idx];
          if (ascll_10 < 128 && ascll_10 >= 0 && data[this.idx + 1] === "'") {
            this.idx++;
            str += data[this.idx];
            this.syn = 500; //字符
          } else {
            flag = false;
            this.errors +=
              "第" + error_row + "行存在非ascll字符,请重新修改!!\n";
            this.syn = 0;
            return;
          }
        }
        this.idx++;
        // console.log(this.syn, "boundary");
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
          //<,<<,<=,<<=,还有头文件<stdio.h>等
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
            let case1 =
                data[this.idx + 4] + data[this.idx + 5] + data[this.idx + 6],
              case2 =
                data[this.idx + 5] + data[this.idx + 6] + data[this.idx + 7],
              case3 =
                data[this.idx + 6] + data[this.idx + 7] + data[this.idx + 8];
            if (
              this.isLetter(data[this.idx]) &&
              (case1 === ".h>" || case2 === ".h>" || case3 === ".h>")
            ) {
              this.syn = this.specTable.wordType.headFile;
              while (data[this.idx] !== ">") {
                str += data[this.idx++];
              }
              str += data[this.idx];
            } else {
              this.idx--;
              this.syn = 211; //<
            }
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
          } else if (data[this.idx] === "=") {
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
        } else if (this.idx === len) {
          this.syn = 0; //结束了!!
        } else {
          //剩余的直接赋值对应种别码即可
          this.syn = this.specTable.operator[data[this.idx++]];
        }
        // console.log(this.syn, "operator");
      } else {
        flag = false;
        if (data[this.idx] !== undefined) {
          //这是为了防止最后一个是\n的话导致不存在的问题
          //由于我之前把\r\n替换为\n了,所以才出现的这个问题,所以在这里做个判断,避免提示错误信息
          this.errors +=
            "error：there is no exist " +
            data[this.idx++] +
            ",at " +
            this.row +
            " row, " +
            this.column +
            " column!!\n";
        }
        this.syn = 0;
        return;
      }
      if (flag) {
        this.count++;
        this.purifyTextData += str;
        this.whatType(); //更改type
        this.token.push({
          key: this.count,
          TokenName: str,
          TokenCode: this.syn,
          row: this.row,
          column: this.column,
          type: this.type,
        });
      }
    },
    changeTypeForGram(token, nextToken) {
      let type = token.type;
      if (type === "integer") {
        this.tokenToGram.push("IntergerPart");
      } else if (type === "float") {
        this.tokenToGram.push("FloatNumber");
      } else if (
        type === "operator" ||
        type === "boundary" ||
        type === "reserveWord" ||
        type === "headFile"
      ) {
        this.tokenToGram.push(token.TokenName);
      } else if (type === "string") {
        this.tokenToGram.push("String");
      } else if (type === "character") {
        this.tokenToGram.push("Character");
      } else if (type === "id") {
        if (nextToken !== undefined && nextToken.TokenName === "(") {
          this.tokenToGram.push("FuncIDentifier");
        } else if (nextToken !== undefined && nextToken.TokenName === "[") {
          this.tokenToGram.push("ArrayIDentifier");
        } else {
          this.tokenToGram.push("IDentifier");
        }
      }
      // token.type = this.tokenToGram[this.tokenToGram.length - 1];
    },
    whatType() {
      if (this.syn >= 1000) {
        this.type = "headFile";
      } else if (this.syn >= 900) {
        this.type = "ws";
      } else if (this.syn >= 800) {
        this.type = "float";
      } else if (this.syn >= 700) {
        this.type = "id";
      } else if (this.syn >= 600) {
        this.type = "string";
      } else if (this.syn >= 500) {
        this.type = "character";
      } else if (this.syn >= 400) {
        this.type = "integer";
      } else if (this.syn >= 300) {
        this.type = "boundary";
      } else if (this.syn >= 200) {
        this.type = "operator";
      } else if (this.syn >= 100) {
        this.type = "reserveWord";
      } else if (this.syn >= 0) {
        this.type = "error";
      }
    },
    isAboutDigit(ch) {
      return this.isWs2(ch) || this.isBoundary(ch) || this.isOperator(ch);
    },
    isDigit(ch) {
      return ch <= "9" && ch >= "0";
    },
    isNo0Digit(ch) {
      return ch <= "9" && ch > "0";
    },
    isInt16(ch) {
      return (
        this.isDigit(ch) ||
        (((ch <= "f" && ch >= "a") || (ch >= "A" && ch <= "F")) && ch !== "_")
      );
    },
    isLetter(ch) {
      //字母或者下划线
      return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_";
    },
    errorUnexpectedNumber() {
      this.errors +=
        "在第" + this.row + "行, 第" + this.column + "列, 存在非法数字!!\n";
      this.syn = 0;
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
      // if (ch === "\n") {
      //   this.row++;//这会导致我的行列有问题
      //   this.column = 0;
      //   return true;
      // }
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
  width: 880px;
  min-height: 100px;
  resize: none;
  outline: none;
  border: 0;
  margin-right: 20px;
}
</style>