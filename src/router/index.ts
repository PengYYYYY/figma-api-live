import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

// 存放固定的路由
const defaultRouterList: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/figma',
  },
  {
    path: '/figma',
    component: () => import('@/pages/figma/index.vue'),
  },
];

export const page404 = {
  path: '/:w+',
  name: '404Page',
  redirect: '/figma',
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: defaultRouterList,
  scrollBehavior() {
    return {
      el: '#app',
      top: 0,
      behavior: 'smooth',
    };
  },
});

export default router;
