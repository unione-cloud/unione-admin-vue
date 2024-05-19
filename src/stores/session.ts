import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserPrincipal, LoginData } from './typing'
import constant from '@/config/constant'

export const useSessionStore = defineStore('unione-admin-session', () => {
  // store entry
  const principal = ref<UserPrincipal>({
    id: '1',
    username: 'jeking',
    aliasName: '管理员',
    avatar: '/logo.png'
  })
  const storage: any = ref({})

  /////////////////////
  // store function

  //是否已登录
  function isLogin() {
    return !!principal.value.id
  }

  // 登录
  function doLogin(data: LoginData) {}

  // 退出登录
  function doLogout() {
    delStorage(constant.ACCESS_TOKEN)
    delStorage(constant.ACCESS_USER_INFO)
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

  return { principal, doLogin, doLogout, isLogin, setStorage, getStorage, delStorage }
})
