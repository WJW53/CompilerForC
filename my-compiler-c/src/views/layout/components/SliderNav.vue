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
        <textarea
          class="preview-file"
          v-model="previewData"
        ></textarea>
      </div>
      <div class="middle-button" @click="changeFun">转换后代码=></div>
      <div class="right-show">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
export default {
  data() {
    return {
      txtData: "",
    };
  },
  computed: {
    //设置别名，起到简化代码的作用，比如this.$store.state.cityID可以用this.cId替代
    // 方法一：
    // ...mapState({
    //   cId: state => state.cityID,
    //   cname:state => state.city
    // }),
    // 方法二：
    // ...mapState({
    //   cId: 'cityID',
    //   cname:'city'
    // }),
    // 方法三(不设置别名，直接使用this.cityID即可)：
    // ...mapState(['cityID','city']),
    ...mapState({
      previewData: (state) => state.compilation.previewData,
      textData: (state) => state.compilation.textData,
    }),
  },
  methods: {
    changeFun() {
      let flag = this.$store.state.changeCode;
      if (flag === false) {
        this.$store.state.changeCode = true;
      }
    },
    ...mapActions(["changePreviewData", "changeTextData"]),
    toggleCollapsed() {
      this.$store.dispatch("changeCollapsed");
    },
    uploadFile() {
      let file = document.getElementById("#txt").files[0];
      //判断上传文件是不是txt格式,判断后缀是不是.txt
      let houzhui = file.name.substr(-4).toLocaleLowerCase();
      if (houzhui != ".txt" && houzhui != ".csv") {
        alert("请上传格式为txt的文件！");
      } //如果上传文件是txt文件，则显示文件的预览
      else {
        let reader = new FileReader();
        let _this = this;
        reader.readAsText(file, "utf-8");
        reader.onload = function (evt) {
          //注意这样获取的文本里的回车是\r\n而不是单独的一个\n
          //也就是说我们敲了一个回车代表两个字符长度,不要统计出错了哦,所以这里我替换为一个\n
          let value = evt.target.result.replace(/\r\n/g, "\n");
          // let res = value.split("\n");
          // for (let i = 0; i < res.length; i++) {
          //   res[i] = res[i].split(",");
          // }
          // console.log(res);
          _this.changePreviewData({ value }).then(() => {}); //这是从mapAction中映射出来的方法
          _this.changeTextData({ value }).then(() => {});
          // console.log('textdata\n',_this.textData);
          // console.log(_this.previewData.length);
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