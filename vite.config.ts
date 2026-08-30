import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // 允许通过预览代理域名访问（平台网关会转发不同的 Host）
    allowedHosts: true,
    watch: {
      ignored: ['**/skills/**', '**/download/**', '**/upload/**', '**/dist/**', '**/.zscripts/**'],
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
  },
  optimizeDeps: {
    // 只扫描真实入口，避免误分析平台附带的 skills 模板 HTML
    entries: ['index.html', 'src/**/*.{ts,js,vue}'],
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },
})
