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
    logOverride: {
      'unused-import': 'silent',
      'unused-variable': 'silent',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 第三方库分离
          'vendor-react': ['react', 'react-dom'],
          'vendor-zustand': ['zustand'],
          'vendor-xlsx': ['xlsx'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
