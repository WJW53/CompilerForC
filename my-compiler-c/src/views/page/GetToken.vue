<template>
  <div class="get-token">
    GetToken
    <textarea readonly class="result1" v-model="newTextData"></textarea>
    <textarea readonly class="errors" v-model="errors"></textarea>
  </div>
</template>
<script>
import specTable from "@/storage/LexTable.js";
export default {
  data() {
    return {
      row: 0,
      column: 0,
      idTable: [], //标识符-种别码表
      errors: "以下是该源代码的错误信息: \n", //每条都是字符串
      newTextData: null, //过滤后的新字符串
      token: this.$store.state.compilation.tokenData,
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
    this.scanner(this.newTextData, this.token);
  },
  methods: {
    startGetToken() {
      //   console.log(this.$store.state.compilation.previewData);
      this.filterResource(this.$store.state.compilation.previewData);
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
    scanner(data, token, syn, idx) {
      //根据DFA状态转换图设计. 分析模块,算法核心
      let i = 0,
        count = 0,
        ch = data[idx],
        temp = null;
      while (ch == " ") {
        idx++;
        ch = data[idx];
      }
      if (this.isLetter(data[idx])) {
        //开头为字母
      } else if (this.isDigit(data[idx])) {
      } else if (this.isBoundary(data[idx])) {
      } else if (this.isOperator(data[idx])) {
          temp = data[idx];
          if(temp==='+'){//+,++,+++,+=

          }else if(temp==='-'){

          }else if(temp === '*'){//*,*=

          }else if(temp === '/'){

          }else if(temp === '%'){

          }else if(temp==='<'){//<,<<,<=,<<=

          }else if(temp==='>'){

          }else if(temp==='='){
              
          }else if(temp==='!'){//!,!=

          }else if(temp==='&'){//&,&&,&=,取址符暂时不管了

          }else if(temp==='|'){//|,||,|=

          }else{
              //直接赋值对应种别码syn
          }
      }else{
          this.errors += ("error：there is no exist "+ch+"\n");
          return;
      }
    },
    // getNextChar(s, i) {
    //   //s是当前字符串,i是下一个字符的索引
    //   while (this.isWs(s[i])) {
    //     i++;
    //   }
    //   return s[i];
    // },
    isDigit(ch) {
      return ch <= "9" && ch >= "0";
    },

    isLetter(ch) {
      //字母或者下划线
      return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_";
    },

    isWs1(ch) {
      return (
        ch === "\n" ||
        ch === "\r" ||
        ch === "\t" ||
        ch === "\v" ||
        ch === "\f" ||
        ch === "\0"
      );
    },
    isWs2(ch) {
      return ch === " " || this.isWs1(ch);
    },
    isOperator(ch) {
      return specTable.operator[ch] !== undefined;
    },
    isBoundary(ch) {
      return specTable.boundary[ch] !== undefined;
    },
    error(info) {
      console.log(info);
    },
  },
};
</script>
<style lang='less'>
textarea {
  display: inline-block;
  width: 435px;
  height: 790px;
  resize: none;
  outline: none;
  //   border: 0;
  margin-right: 20px;
}
</style>