<template>
  <div class="get-token">getToken</div>
</template>
<script>
export default {
  data() {
    return {
      row: 0,
      column: 0,
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
  methods: {
    isDigit(ch) {
      return ch <= "9" && ch >= "0";
    },

    isLetter(ch) {
      //字母或者下划线
      return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_";
    },

    isWs(ch) {
      return (
        ch === " " ||
        ch === "\n" ||
        ch === "\r" ||
        ch === "\t" ||
        ch === "\v" ||
        ch === "\f" ||
        ch === "\0"
      );
    },

    error(info) {
      console.log(info);
    },

    getNextChar(s, i) {
      //s是当前字符串,i是下一个字符的索引
      while (isWs(s[i])) {
        i++;
      }
      return s[i];
    },
  },
};
</script>
<style lang='less'>
</style>