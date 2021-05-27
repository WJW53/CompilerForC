<template>
  <div class="SemanticAnalysis">语义检查</div>
</template>

<script>
export default {
  data() {
    return {
      idTable: this.$store.state.compilation.idData,
    };
  },
  components: {},
  created() {
    console.log("标识符/变量名表(前面有没有type我不管): ", this.idTable);
  },
};
</script>

<style lang="less">
</style>