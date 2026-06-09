import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  // console.log('vite build env mode=' + mode, env)
  return {
    base: mode === 'dev' ? '/grgt' : '/dist-cloud',
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
    define: {
      'process.env': env
    },
    server: {
      proxy: {
        '/portal': {
          target: 'http://192.168.56.1',
          // target: 'http://localhost:8090',
          // target: 'http://localhost:8080',
          // target: 'https://online.unione.cloud', // 代理的目标地址
          changeOrigin: true // 搭建代理服务器，开启代理
          // secure: true, // 是否代理https接口
          // rewrite: path => path.replace('', '') // 不用路径重写
        },
        '/flow': {
          target: 'http://192.168.56.1',
          // target: 'http://localhost:8080',
          // target: 'http://localhost:8090',
          // target: 'https://online.unione.cloud', // 代理的目标地址
          changeOrigin: true // 搭建代理服务器，开启代理
          // secure: true, // 是否代理https接口
          // rewrite: path => path.replace('', '') // 不用路径重写
        },
        '/job': {
          target: 'http://localhost:8080',
          // target: 'http://192.168.56.1',
          // target: 'https://online.unione.cloud', // 代理的目标地址
          changeOrigin: true // 搭建代理服务器，开启代理
          // secure: true, // 是否代理https接口
          // rewrite: path => path.replace('', '') // 不用路径重写
        },
        '/cms': {
          // target: 'http://localhost:8080',
          target: 'http://192.168.56.1',
          // target: 'https://online.unione.cloud', // 代理的目标地址
          changeOrigin: true // 搭建代理服务器，开启代理
          // secure: true, // 是否代理https接口
          // rewrite: path => path.replace('', '') // 不用路径重写
        }
      }
    }
  }
})
