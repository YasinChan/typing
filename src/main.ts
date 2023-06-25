// 默认用 dark 主题
import '@/assets/theme/theme-dark.css';
import './assets/main.scss';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(router);

app.mount('#app');
