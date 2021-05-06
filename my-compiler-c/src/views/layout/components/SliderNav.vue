<template>
  <div class="right-content">
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

    <div class="main-body">
      <div class="left-file">
        <div class="select-file">
          <input id="#txt" type="file" />
          <button file="submit" @click="uploadFile">提交</button>
        </div>
        <div class="preview-file"></div>
      </div>
      <div class="middle-button">转换代码=></div>
      <div class="right-show">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // curRouteMatched: this.$route.matched,
      txtData: "",
    };
  },
  methods: {
    toggleCollapsed() {
      this.$store.dispatch("changeCollapsed");
    },
    uploadFile() {
      // console.log(document.getElementById("#txt"));
      let file = document.getElementById("#txt").files[0];
      //判断上传文件是不是txt格式,判断后缀是不是.txt
      if (file.name.substr(-4).toLocaleLowerCase() != ".txt") {
        alert("请上传格式为txt的文件！");
      } //如果上传文件是txt文件，则显示文件的预览
      else {
        let reader = new FileReader();
        reader.readAsText(file, "utf-8");
        //reader.readAsDataURL(file);
        reader.onload = function (evt) {
          this.txtData = evt.target.result;
          //注意这样获取的文本里的回车是\r\n而不是单独的一个\n
          //也就是说我们敲了一个回车代表两个字符长度,不要统计出错了哦
          this.txtData = this.txtData.replace(/\r\n/g, "\n"); //替换成\n
          console.log(this.txtData, this.txtData.length);
          // for(let item of this.txtData){
          //   console.log(item,item==='\n');
          // }
        };
      }
    },
  },
  mounted() {},
};
</script>

<style lang="less">
</style>