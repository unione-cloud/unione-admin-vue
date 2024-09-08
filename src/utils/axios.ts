import axios from 'axios'
import constant from '@/config/constant'
import config from '@/config/settings'
import { useSessionStore } from '@/stores/session'

let session: any = null
const service: any = {}
const err = (error: any) => {
  if (error.response) {
    if (error.response.status === 403) {
      console.log('error:403')
    }
    if (error.response.status === 402) {
      console.log('error:402')
    }
    if (error.response.status === 401) {
      console.log('error:401')
    }
  }
  return Promise.reject(error)
}

// 注册rest axios服务
const axiosServers: any = config.axios
Object.keys(axiosServers).forEach((key) => {
  const serverAxios = axios.create({
    baseURL: axiosServers[key], // api base_url
    timeout: 60000 // 请求超时时间
  })

  // request interceptor
  serverAxios.interceptors.request.use((config) => {
    if (!session) {
      session = useSessionStore()
    }
    const token = session.getToken()
    if (token) {
      config.headers[constant.ACCESS_TOKEN] = token
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

export default service
