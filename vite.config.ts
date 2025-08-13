import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(() => {
  const model = process.env.model || 'dev'
  return {
    base: model === 'dev' ? '/' : '/',
    plugins: [vue(), VueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    },
    build: {
      outDir: 'dist'
    },
    server: {
      proxy: {
        '/portal': {
          // target: 'http://localhost:8080',
          target: 'http://8.134.11.253:8090', // 代理的目标地址
          changeOrigin: true // 搭建代理服务器，开启代理
          // secure: true, // 是否代理https接口
          // rewrite: path => path.replace('', '') // 不用路径重写
        }
      }
    }
  }
})
