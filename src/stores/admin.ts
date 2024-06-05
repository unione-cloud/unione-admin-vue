import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { MenuItem, ViewSetting } from './typing'
import config from '@/config/settings'
import { router, local } from '@/router'

/**
 * Admin Store
 */
export const useAdminStore = defineStore('unione-admin', () => {
  // 菜单数据集合
  const menuData = ref<Array<MenuItem>>([])

  const topMenu = ref<any>([])
  const sideMenu = ref<any>([])
  // view配置
  const view = ref<ViewSetting>({ ...config.view })

  // 构建路由
  function buildRoute(items: Array<MenuItem>) {
    const routes: any = []
    if (items && items.length > 0) {
      items.forEach((item) => {
        const route: any = {
          name: item.name,
          title: item.title,
          path: item.path
        }
        if (item.url && item.url.startsWith('@')) {
          route.component = () => import(item.url)
        }
        if (item.children && item.children.length) {
          route.children = buildRoute(item.children)
        }
        routes.push(route)
      })
    }
    return routes
  }

  // 加载Admin 菜单
  function loadMenu() {
    // 加载菜单
    menuData.value = local

    // 构建路由
    const routes = buildRoute(menuData.value)
    router.addRoute(routes)

    // 构建菜单
    if (view.value.layout == 'topmenu') {
      topMenu.value = menuData.value
    }
  }

  // 设置view
  function setView(setting: ViewSetting) {
    view.value = { ...view.value, ...setting }
  }

  return { menuData, sideMenu, topMenu, loadMenu, view, setView }
})
