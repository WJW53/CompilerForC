<template>
  <div class="IntermediateCode_2">
    <a-table
      :columns="columnHead"
      :data-source="midcodeTable"
      :scroll="{ x: 900, y: 700 }"
      class="table"
    >
    </a-table>
  </div>
</template>

<script>
const columnHead = [
  {
    title: "action",
    width: 100,
    dataIndex: "action",
    key: "action",
  },
  {
    title: "obj1",
    width: 150,
    dataIndex: "obj1",
    key: "obj1",
  },
  {
    title: "obj2",
    dataIndex: "obj2",
    key: "obj2",
    width: 150,
  },
  {
    title: "where",
    dataIndex: "where",
    key: "where",
    width: 200,
  },
  {
    title: "scoped",
    dataIndex: "scoped",
    key: "scoped",
  },
];
let a = [
  { key: 0, action: "main", obj1: "", obj2: "", where: "", scoped: "1-1" },
  { key: 1, action: "=", obj1: 1, obj2: "", where: "a", scoped: "1-1" },
  { key: 2, action: ">", obj1: "a", obj2: 10, where: "T0", scoped: "1-1-1" },
  { key: 3, action: "jnz", obj1: "T0", obj2: "", where: 5, scoped: "1-1-1" },
  { key: 4, action: "j", obj1: "", obj2: "", where: 7, scoped: "1-1-1" },
  { key: 5, action: "+=", obj1: 1, obj2: "", where: "a", scoped: "1-1-1" },
  { key: 6, action: "j", obj1: "", obj2: "", where: 13, scoped: "1-1-1" },
  {
    key: 7,
    action: ">",
    obj1: "a",
    obj2: 11,
    where: "T1",
    scoped: "1-1-1-1-1",
  },
  {
    key: 8,
    action: "jnz",
    obj1: "T1",
    obj2: "",
    where: 10,
    scoped: "1-1-1-1-1",
  },
  { key: 9, action: "j", obj1: "", obj2: "", where: 12, scoped: "1-1-1-1-1" },
  { key: 10, action: "-=", obj1: 1, obj2: "", where: "a", scoped: "1-1-1-1-1" },
  { key: 11, action: "j", obj1: "", obj2: "", where: 13, scoped: "1-1-1-1-1" },
  { key: 12, action: "ret", obj1: "", obj2: "", where: 0, scoped: "1-1-1-1-1" },
  { key: 13, action: "ret", obj1: "", obj2: "", where: "", scoped: "1-1" },
  { key: 14, action: "sys", obj1: "", obj2: "", where: "", scoped: "1" },
];
export default {
  components: {},
  data() {
    return {
      columnHead,
      midcodeTable: a,
    };
  },
  created() {
    this.$store.state.compilation.previewData = this.$store.state.compilation.newTextData;
  },
};
</script>

<style lang="less">
</style>