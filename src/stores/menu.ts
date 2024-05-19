import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * Admin Menu Store
 */
export const useAdminMenuStore = defineStore('unione-admin-menu', () => {
  const menus = ref([])

  // 加载Admin 菜单
  function loadMenu() {}

  return { menus, loadMenu }
})
