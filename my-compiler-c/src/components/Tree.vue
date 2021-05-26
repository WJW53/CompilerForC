<template>
  <ul class="tree">
    <li
      v-for="(node, index) in data"
      :key="node[defaultProps.number]"
      class="tree-node"
    >
      <i
        @click="handleClick(index)"
        v-if="node[defaultProps.children]"
        class="iconfont"
        :class="{
          'icon-down': !showChildren[index],
          'icon-right': showChildren[index],
        }"
      />
      <span class="node-label" @click="handleClick(index)">{{
        node[defaultProps.label]
      }}</span>
      <keep-alive>
        <base-tree
          v-if="showChildren[index] && node[defaultProps.children]"
          :data="node[defaultProps.children]"
        />
      </keep-alive>
    </li>
  </ul>
</template>

<script>
export default {
  name: "base-tree",
  props: {
    data: {
      type: Array,
      required: true,
    },
    defaultProps: {
      //保证没有传入的时候,这些就是默认值
      type: Object,
      default: () => ({
        label: "label",
        children: "children",
        number: "number",
      }),
    },
  },
  data() {
    return {
      showChildren: [],
    };
  },
  methods: {
    handleClick(index) {
      const flag = !this.showChildren[index];
      this.$set(this.showChildren, index, flag);
    },
  },
};
</script>

<style scoped>
@import "../assets/css/font.css";
.tree{
  margin-left: 10px;
}
li {
  list-style: none;
}

.tree-node {
  cursor: pointer;
}

.tree-node .iconfont {
  color: #008c8c;
  font-size: 12px;
  margin-right: 5px;
  vertical-align: middle;
}

.tree-node .node-label {
  font-size: 16px;
  color: #4e6ef2;
  vertical-align: middle;
}
</style>