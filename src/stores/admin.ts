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

  const menuMap = ref<any>({})
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

  // 构建菜单树
  function buildMenu(items: Array<MenuItem>) {
    const menus: any = []
    if (items && items.length > 0) {
      items.forEach((item) => {
        const menu: any = {
          key: item.sid,
          label: item.name,
          title: item.title,
          icon: item.meta?.icon,
          path: item.path
        }
        menuMap.value[menu.key] = menu
        if (item.children && item.children.length) {
          menu.children = buildMenu(item.children)
        }
        menus.push(menu)
      })
    }
    return menus
  }

  // 加载Admin 菜单
  function loadMenu() {
    // 加载菜单
    menuData.value = local

    // 构建路由
    const routes = buildRoute(menuData.value)
    routes.forEach((route: any) => {
      router.addRoute('root', route)
    })

    // 构建菜单
    const menus = buildMenu(menuData.value)
    if (view.value.layout == 'topmenu') {
      topMenu.value = menus
    } else if (view.value.layout == 'sidemenu') {
      sideMenu.value = menus
    } else if (view.value.layout == 'topside') {
      topMenu.value = []
      menus.forEach((menu: any) => {
        topMenu.value.push({
          key: menu.key,
          label: menu.label,
          title: menu.title,
          icon: menu.icon
        })
      })
    }
  }

  /**
   * top菜单点击事件
   * @param item
   * @returns
   */
  function topMenuClick(key: string) {
    const menu = menuMap.value[key]
    console.log('topMenuClick', menu)
    if (!menu) {
      return
    }
    if (view.value.layout == 'topside') {
      sideMenu.value = menu.children
      if (!menu.children || !menu.children.length) {
        router.push(menu.path)
      }
    }
  }

  // 设置view
  function setView(setting: ViewSetting) {
    view.value = { ...view.value, ...setting }
  }

  return { menuData, sideMenu, topMenu, loadMenu, topMenuClick, view, setView }
})
