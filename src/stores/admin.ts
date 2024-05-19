import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { MenuItem, ViewSetting } from './typing'

import config from '@/config/settings'

/**
 * Admin Store
 */
export const useAdminStore = defineStore('unione-admin', () => {
  // 菜单集合
  const menus = ref<Array<MenuItem>>([])
  // view配置
  const view = ref<ViewSetting>({ ...config.view })

  // 加载Admin 菜单
  function loadMenu() {}

  // 设置view
  function setView(setting: ViewSetting) {
    view.value = { ...view.value, ...setting }
  }

  return { menus, loadMenu, view, setView }
})
