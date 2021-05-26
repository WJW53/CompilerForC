import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/layout/Home.vue';

Vue.use(VueRouter);

const originalPush = VueRouter.prototype.push;//解决一类错误
//Redirected when going from "/login" to "/index" via a navigation guard.
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch(err => err);
}

const routes = [
  {
    path: '/',
    // path: '/home',
    name: 'Home',
    component: Home,
    redirect: '/index',
    meta: {
      title: "首页",
      icon: 'home',
      hidden: false,
    },
    children: [
      {
        path: 'index',
        name: "Index",
        meta: {
          title: '选择文件',
          icon: 'file-text',
          hidden: false,
        },
        component: () => import("../views/page/Index.vue"),
      },
    ],
  },
  {
    path: '/LexicalAnalysis',
    name: 'LexicalAnalysis',
    redirect: '/LexicalAnalysis/DFA',
    meta: {
      title: '词法分析',
      icon: 'unordered-list',
      hidden: false,
    },
    component: Home,
    children: [
      {
        path: 'GetToken',
        name: 'GetToken',
        meta: {
          title: 'GetToken',
          icon: 'edit',
          hidden: false,
        },
        component: () => import("../views/page/GetToken.vue"),
      },
      // {
      //   path: 'NFA',
      //   name: 'NFA',
      //   meta: {
      //     title: 'NFA',
      //     icon: 'edit',
      //     hidden: false,
      //   },
      //   component: () => import("../views/page/NFA.vue"),
      // },
      
      // {
      //   path: 'DFA_MIN',
      //   name: 'DFA_MIN',
      //   meta: {
      //     title: 'DFA最小化',
      //     icon: 'edit',
      //     hidden: false,
      //   },
      //   component: () => import("../views/page/DFA_MIN.vue"),
      // },

    ]
  },
  {
    path: '/GrammarAnalysis',
    name: 'GrammarAnalysis',
    component: Home,
    redirect: '/GrammarAnalysis/LR',
    meta: {
      title: "语法分析",
      icon: 'unordered-list',
      hidden: false,
    },
    children: [
      {
        path: 'DFA_SLR1',
        name: 'DFA_SLR1',
        meta: {
          title: 'DFA_LR0_SLR1',
          icon: 'edit',
          hidden: false,
        },
        component: () => import("../views/page/memory.vue"),
      },
      {
        path: 'ShowAST',
        name: 'ShowAST',
        meta: {
          title: 'ShowAST',
          icon: 'edit',
          hidden: false,
        },
        component: () => import("../views/page/ShowAST.vue"),
      },
      // {
      //   path: 'LL1',
      //   name: "LL1",
      //   meta: {
      //     title: '预测分析法',
      //     icon: 'edit',
      //     hidden: false,
      //   },
      //   component: () => import("../views/page/LL1.vue"),
      // },
      // {
      //   path: 'RecursiveDescent',
      //   name: "RecursiveDescent",
      //   meta: {
      //     title: '递归下降法',
      //     icon: 'edit',
      //     hidden: false,
      //   },
      //   component: () => import("../views/page/RecursiveDescent.vue"),
      // },
      // {
      //   path: 'LR1',
      //   name: "LR1",
      //   meta: {
      //     title: 'LR1分析法',
      //     icon: 'edit',
      //     hidden: false,
      //   },
      //   component: () => import("../views/page/LR1_END.vue"),
      // },
    ],
  },
  // {
  //   path: '/SemanticAnalysis',
  //   name: 'SemanticAnalysis',
  //   component: Home,
  //   meta: {
  //     title: "语义分析",
  //     icon: 'unordered-list',
  //     hidden: false,
  //   },
  //   children: [
  //     {
  //       path: 'index',
  //       name: "index",
  //       meta: {
  //         title: '语义检查',
  //         icon: 'edit',
  //         hidden: false,
  //       },
  //       component: () => import("../views/page/SemanticAnalysis.vue"),
  //     },
  //   ],
  // },
  {
    path: '/IntermediateCode',
    name: 'IntermediateCode',
    component: Home,
    redirect: '/IntermediateCode/top2down',
    meta: {
      title: "中间代码生成",
      icon: 'unordered-list',
      hidden: false,
    },
    children: [
      // {
      //   path: 'top2down',
      //   name: "IntermediateCode-1",
      //   meta: {
      //     title: '自上而下',
      //     icon: 'edit',
      //     hidden: false,
      //   },
      //   component: () => import("../views/page/IntermediateCode_1.vue"),
      // },
      {
        path: 'down2top',
        name: "IntermediateCode-2",
        meta: {
          title: '自下而上',
          icon: 'edit',
          hidden: false,
        },
        component: () => import("../views/page/IntermediateCode_2.vue"),
      },
    ],
  },
  {
    path: '/DAG',
    name: 'DAG',
    component: Home,
    meta: {
      title: "代码优化",
      icon: 'unordered-list',
      hidden: false,
    },
    children: [
      {
        path: 'index',
        name: "DAG-Index",
        meta: {
          title: 'DAG',
          icon: 'edit',
          hidden: false,
        },
        component: () => import("../views/page/DAG.vue")
      }
    ]
  },
  {
    path: '/TargetCode',
    name: 'TargetCode',
    component: Home,
    meta: {
      title: "目标代码生成",
      icon: 'unordered-list',
      hidden: false,
    },
    children: [
      {
        path: 'index',
        name: "TargetCodeGen",
        meta: {
          title: 'TargetCodeGen',
          icon: 'edit',
          hidden: false,
        },
        component: () => import("../views/page/TargetCodeGen.vue")
      }
    ]
  }


];

const router = new VueRouter({
  routes,
});
export default router;