// 默认用 dark 主题
import '@/assets/theme/theme-dark.scss';
import './assets/main.scss';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);

app.mount('#app');
