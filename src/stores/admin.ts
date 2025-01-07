import { ref, h, watch } from 'vue'
import { defineStore, getActivePinia } from 'pinia'
import type { MenuItem, ViewSetting } from './typing'
import config from '@/config/settings'
import { local } from '@/router'
import { useSession } from 'unione-base-vue'
import { useRouter } from 'vue-router'

/**
 * Admin Store
 */
export const useAdminStore = defineStore('unione-admin', () => {
  // 菜单数据集合
  const menuData = ref<Array<MenuItem>>([])
  const menuMap = ref<any>({})
  const topMenu = ref<any>({
    selectedKeys: [],
    openKeys: [],
    list: []
  })
  const sideMenu = ref<any>({
    collapsed: false,
    selectedKeys: [],
    openKeys: [],
    list: []
  })
  // view配置
  const view = ref<ViewSetting>({ ...config.view })
  const router = useRouter()

  // 构建路由
  function buildRoute(items: Array<MenuItem>) {
    const routes: any = []
    if (items && items.length > 0) {
      items.forEach((item) => {
        const route: any = {
          name: item.sid,
          title: item.title,
          path: item.path,
          meta: {
            ...(item.meta || {}),
            url: item.url
          },
          props: item.props,
          component: item.component
        }
        // if (item.url && item.url.startsWith('@')) {
        //   route.component = () => import('' + item.url)
        //   // route.component = () => import('@/views/HomeView.vue')
        // }
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
          label: item.title,
          // icon: item.meta?.icon,
          path: item.path
        }
        if (typeof menu.icon === 'string') {
          menu.icon = () => h(menu.icon)
        }
        menuMap.value[menu.key] = menu
        menuMap.value[menu.path] = menu
        if (item.children && item.children.length) {
          menu.children = buildMenu(item.children)
          menu.children.forEach((child: any) => {
            child.parent = menu.key
          })
        }

        if (!item.hidden) {
          menus.push(menu)
        }
      })
    }
    return menus
  }

  // 加载Admin 菜单
  function loadMenu(to?: any) {
    return new Promise((resolve, reject) => {
      // 加载菜单
      //menuData.value = local
      const menuList: Array<MenuItem> = local

      // 构建路由
      const routes = buildRoute(menuList)
      routes.forEach((route: any) => {
        router.addRoute('root', route)
      })

      // 构建菜单
      const menus = buildMenu(menuList)
      if (view.value.layout == 'topmenu') {
        topMenu.value.list = menus
      } else if (view.value.layout == 'sidemenu') {
        sideMenu.value.list = menus
      } else if (view.value.layout == 'topside') {
        topMenu.value.list = []
        menus.forEach((menu: any) => {
          topMenu.value.list.push({
            key: menu.key,
            label: menu.label,
            title: menu.title,
            icon: menu.icon,
            path: menu.path
          })
        })
      }
      // 构建菜单 END

      if (!to) {
        //自动打开第一个页面
        const firstTopMenu = topMenu.value.list[0]
        if (firstTopMenu) {
          topMenu.value.selectedKeys.push(firstTopMenu.key)
          topMenuClick(firstTopMenu.key)
        } else {
          const firstSideMenu = sideMenu.value.list[0]
          if (firstSideMenu) {
            sideMenu.value.selectedKeys.push(firstSideMenu.key)
            sideMenuClick(firstSideMenu.key)
          }
        }
        //自动打开第一个页面 END
      } else {
        const menu = menuMap.value[to.path]
        if (menu) {
          if (view.value.layout == 'topside') {
            let parent = menuMap.value[menu.parent]
            if (parent) {
              sideMenu.value.selectedKeys = [menu.key]
              sideMenu.value.openKeys = []
              while (menuMap.value[parent.parent]) {
                sideMenu.value.openKeys.push(parent.key)
                parent = menuMap.value[parent.parent]
              }
              sideMenu.value.list = parent.children || []
            } else {
              sideMenu.value.list = menu.children || []
            }
          }
        }
        router.push({ path: to.path, query: to.query, params: to.params })
      }

      resolve(menuList)
    })
  }
  // 加载Admin 菜单END

  function initRoute(to?: any) {
    return new Promise((resolve, reject) => {
      if (!menuMap.value || !Object.keys(menuMap.value).length) {
        // 如果菜单信息为空，则加载菜单
        loadMenu(to).then((menuList: any) => {
          menuData.value = menuList
          reject(true)
        })
      } else {
        resolve(true)
      }
    })
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
      sideMenu.value.selectedKeys = []
      sideMenu.value.openKeys = []
      sideMenu.value.list = menu.children
      if (!menu.children || !menu.children.length) {
        router.push(menu.path)
      } else {
        const openSubMenu = (m: any) => {
          if (!m.children || !m.children.length) {
            router.push(m.path)
            sideMenu.value.selectedKeys.push(m.key)
          } else {
            sideMenu.value.openKeys.push(m.key)
            openSubMenu(m.children[0])
          }
        }
        openSubMenu(menu.children[0])
      }
    }
  }

  /**
   * side菜单点击事件
   * @param key
   * @returns
   */
  function sideMenuClick(key: string) {
    const menu = menuMap.value[key]
    console.log('sideMenuClick', menu)
    if (!menu) {
      return
    }
    router.push(menu.path)
  }

  // 设置view
  function setView(setting: ViewSetting) {
    view.value = { ...view.value, ...setting }
  }

  const session = useSession()
  function isLogin() {
    return session.isLogin()
  }

  return {
    menuData,
    sideMenu,
    topMenu,
    initRoute,
    topMenuClick,
    sideMenuClick,
    view,
    setView,
    isLogin
  }
})
