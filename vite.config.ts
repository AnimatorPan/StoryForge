import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  esbuild: {
    // 忽略未使用变量的警告
    logOverride: {
      'unused-import': 'silent',
      'unused-variable': 'silent',
    },
  },
})
