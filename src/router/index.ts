import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import _ from 'tddev/utils';
import _utils from '@/utils/index';

const historyPath = _.getEnv('DEPLOY_PATH', '/');

export const router = createRouter({
  history: createWebHistory(historyPath),
  routes,
  scrollBehavior: () => ({ top: 0, left: 0 })
});

/** 路由跳转前 */
router.beforeEach((to, from, next) => {
  next();
});

export const setupRouter = (app: any) => {
  app.use(router);
};