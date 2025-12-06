import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'
import path from 'path'

export default defineConfig({
  // 基础路径设置为相对路径
  base: './',
  
  server: {
    host: '0.0.0.0',
    port: 5173,

    allowedHosts: true,
    
    // 代理配置 - 开发环境使用相对路径
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src")
    }
  },
  
  plugins: [vue(), WindiCSS()],
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})