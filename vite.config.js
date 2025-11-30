import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'

import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve:{
    alias:{
      "~":path.resolve(__dirname,"src")
    }
  },
  plugins: [vue(),WindiCSS()],
   server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
