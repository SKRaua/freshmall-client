import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';

const srcPath = new URL('./src', import.meta.url).pathname;

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'types/auto-imports.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': srcPath,
      '/@': srcPath,
    },
  },
});
