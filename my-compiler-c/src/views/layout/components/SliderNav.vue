<template>
  <div class="main-header">
    <a-button
      type="primary"
      style="margin-bottom: 16px"
      @click="toggleCollapsed"
    >
      <a-icon :type="$store.state.collapsed ? 'menu-unfold' : 'menu-fold'" />
    </a-button>

    <div class="breadcrumb">
      <a-breadcrumb>
        <a-breadcrumb-item>
          {{ $route.matched[0].meta.title }}
        </a-breadcrumb-item>
        <a-breadcrumb-item>
          <router-link :to="{ name: $route.name }">
            {{ $route.meta.title }}
          </router-link>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // curRouteMatched: this.$route.matched,
    };
  },
  methods: {
    toggleCollapsed() {
      this.$store.dispatch("changeCollapsed");
    },
  },
  mounted() {},
};
</script>

<style lang="less">
.user-info{
    position: fixed;
    top: 0;
    right: 0;
    z-index: 1;
}
</style>