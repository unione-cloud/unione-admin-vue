import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserPrincipal, LoginData } from './typing'
import constant from '@/config/constant'
import axios from '@/utils/axios'
import router from '@/router'
import { Modal } from 'ant-design-vue'

export const useSessionStore = defineStore('unione-session', () => {
  // store entry
  const principal = ref<UserPrincipal>({})
  const storage: any = ref({})

  /////////////////////
  // store function

  //是否已登录
  function isLogin() {
    if (!principal.value || !principal.value.id) {
      getPrincipal()
    }
    return !!principal.value.id
  }

  // 登录
  function doLogin(data: LoginData) {
    return new Promise((resovle, reject) => {
      axios
        .admin({
          url: '/api/security/login',
          method: 'post',
          data
        })
        .then((res: any) => {
          if (res.success) {
            principal.value = res.principal
            setStorage(constant.ACCESS_USER_INFO, JSON.stringify(res.principal))
            setStorage(constant.ACCESS_TOKEN, res.token)
            resovle(res)
          } else {
            reject(res)
          }
        })
        .catch((err: any) => {
          reject(err)
        })
    })
  }

  // 退出登录
  function doLogout() {
    Modal.confirm({
      title: '确认信息',
      content: '确定要退出系统么?',
      onOk: () => {
        // 调用接口，注销登录

        delStorage(constant.ACCESS_TOKEN)
        delStorage(constant.ACCESS_USER_INFO)
        router.push('/login')
      }
    })
  }

  /**
   * 获取会话令牌
   * @returns
   */
  function getToken() {
    return getStorage(constant.ACCESS_TOKEN)
  }

  // 保存会话存储
  function setStorage(key: string, value: string) {
    storage[key] = value
    sessionStorage.setItem(key, value)
  }

  // 获取会话存储
  function getStorage(key: string) {
    if (storage[key]) {
      return storage[key]
    }
    storage[key] = sessionStorage.getItem(key)
    return storage[key]
  }

  // 删除会话存储
  function delStorage(key: string) {
    delete storage[key]
    return sessionStorage.removeItem(key)
  }

  function getPrincipal() {
    if (!principal.value || !principal.value.id) {
      const info = getStorage(constant.ACCESS_USER_INFO) || '{}'
      principal.value = JSON.parse(info)
    }
    return principal.value
  }

  return { getPrincipal, doLogin, doLogout, isLogin, getToken, setStorage, getStorage, delStorage }
})
