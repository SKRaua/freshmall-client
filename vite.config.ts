import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';

const srcPath = new URL('./src', import.meta.url).pathname;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
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
    server: {
      hmr: { overlay: false },
      port: Number(env.VITE_DEV_PORT || 8080),
      open: env.VITE_DEV_OPEN === 'true',
      cors: true,
      host: env.VITE_DEV_HOST || '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://127.0.0.1:9100',
          changeOrigin: true,
        },
      },
    },
  };
});
