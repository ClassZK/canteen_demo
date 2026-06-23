import { createApp } from 'vue';
import App from '@/views/Layout/App.vue';
const app = createApp(App);

import beforeAppMount from '@/views/Layout/aux_modules/beforeAppMount';
import { setupStore } from './store/index';
import { setupRouter } from './router/index';
import { setupDirective } from './directive/index';
import { setupComponents } from './components/index';


const startApp = () => {
    beforeAppMount();

    setupStore(app);
    setupRouter(app);
    setupDirective(app);
    setupComponents(app);

    app.mount('#app');
}
startApp();
