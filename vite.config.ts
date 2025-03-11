import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import svgLoader from 'vite-svg-loader';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    svgLoader(),
    legacy({
      targets: ['defaults', 'not IE 11'], // 指定兼容的浏览器范围
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'] // 如果需要，添加额外的 polyfills
    })
  ],
  build: {
    target: 'es2015' // 指定构建目标为 ES2015，以兼容更多浏览器
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        secure: false,
        changeOrigin: true
      }
    }
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import '@/assets/definitions/index.scss';`
      }
    }
  }
});
