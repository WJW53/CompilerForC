<template>
    <base-tree :data="data"></base-tree>
</template>


<script>
import BaseTree from "../../components/Tree";
export default {
  components: {
    BaseTree,
  },
  data() {
    return {
      data: this.$store.state.compilation.AST,
    };
  },
  created() {
    this.$store.state.compilation.previewData = this.$store.state.compilation.newTextData;
  },
};
</script>

<style lang="less">
</style>