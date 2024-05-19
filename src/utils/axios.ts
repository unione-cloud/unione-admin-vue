import Vue from 'vue'
import axios from 'axios'
import constant from '@/config/constant'
import config from '@/config/settings'

const service: any = {}
const err = (error) => {
  if (error.response) {
    const token = Vue.ls.get(constant.ACCESS_TOKEN)
    if (error.response.status === 403) {
      console.log('error:403')
    }
    if (error.response.status === 402) {
      console.log('error:402')
    }
    if (error.response.status === 401) {
      console.log('error:401')
      if (token) {
        Vue.ls.remove(constant.ACCESS_TOKEN)
      }
    }
  }
  return Promise.reject(error)
}

// 注册外部rest axios服务
Object.keys(config.axios).forEach((key) => {
  const serverAxios = axios.create({
    baseURL: config.axios[key], // api base_url
    timeout: 60000 // 请求超时时间
  })

  // request interceptor
  serverAxios.interceptors.request.use((config) => {
    const token = Vue.ss.get(constant.ACCESS_TOKEN)
    if (token) {
      Vue.ck.set(constant.ACCESS_TOKEN, token)
    }
    config.headers['X-Axios-With'] = true
    return config
  }, err)

  // response interceptor
  serverAxios.interceptors.response.use((response) => {
    if (response.status === 402) {
      console.log('error:402')
    }
    return response.data
  }, err)

  service[key] = serverAxios
})

const VueAxios = {
  vm: {},
  // eslint-disable-next-line no-unused-vars
  install(Vue: any, instance: any) {
    if (this.installed) {
      return
    }
    this.installed = true

    if (!instance) {
      // eslint-disable-next-line no-console
      console.error('You have to install axios')
      return
    }

    Vue.axios = instance
    Object.defineProperties(Vue.prototype, {
      axios: {
        get: function get() {
          return instance
        }
      },
      $http: {
        get: function get() {
          return instance
        }
      }
    })
  }
}
const installer = {
  vm: {},
  install(Vue) {
    Vue.use(VueAxios, service)
  }
}

export { installer as VueAxios, service as axios }
