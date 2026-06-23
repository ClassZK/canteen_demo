import { createPinia } from 'pinia';

// js/ts 文件单独使用时，需要导出 Pinia，否则部分 js/ts 优先加载时，会提示未安装。
// getActivePinia was called with no active Pinia. Did you forget to install pinia?
export const Pinia = createPinia();

export const setupStore = (app: any) => {
    app.use(Pinia);
};
