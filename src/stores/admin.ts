import { ref, h, computed, nextTick, watch } from 'vue'
import { defineStore } from 'pinia'
import type { MenuItem, ViewSetting, Personal } from './typing'
import { useConfigStore } from '@/config'
import { axios, useDialog, useSession } from 'unione-base-vue'
import { useRouter } from 'vue-router'
import * as Icons from '@ant-design/icons-vue/lib/icons'

/**
 * Admin Store
 */
export const useAdminStore = defineStore('unione-admin', () => {
  const system = ref<any>()
  const configObj = useConfigStore()
  const loading = ref<any>({})
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
  const view = ref<ViewSetting>(configObj.config.view)
  // personal配置
  const personal = ref<Personal>(
    configObj.config.personal || {
      layout: 'topside',
      theme: 'light'
    }
  )
  // const view = computed(() => config.view)
  const router = useRouter()
  const dialog = useDialog()

  const errorDialog = ref<any>(null)

  // 构建路由
  function buildRoute(items: Array<MenuItem>) {
    const routes: any = []
    if (items && items.length > 0) {
      items.forEach((item) => {
        const route: any = {
          name: item.id,
          path: item.path,
          meta: {
            ...(item.meta || {}),
            url: item.url,
            title: item.title
          },
          props: item.props || {}
        }
        if (item.component) {
          route.component = item.component
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
  function buildMenu(items: Array<MenuItem>, parent?: any) {
    const menus: any = []
    if (items && items.length > 0) {
      items.forEach((item) => {
        const menu: any = {
          appId: item.appId,
          key: item.id,
          label: item.title,
          icon: item.meta?.icon,
          path: item.path,
          parent: parent?.key || ''
        }
        if (menu.icon && typeof menu.icon === 'string') {
          // console.log('menu name:' + item.id + ',icon:' + menu.icon)
          const IconComponent = Icons[menu.icon as keyof typeof Icons]
          if (IconComponent) {
            menu.icon = () => h(IconComponent)
          } else {
            // 若找不到对应图标，使用默认图标
            menu.icon = () => h(Icons.UnorderedListOutlined)
            // console.log('menu name:' + item.name + ', 默认图标')
          }
        }
        menuMap.value[menu.key] = menu
        menuMap.value[menu.path] = menu
        if (item.children && item.children.length) {
          menu.children = buildMenu(item.children, menu)
          if (menu.children.length == 0) {
            delete menu.children
          }
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
      const process = (menuList: Array<any>) => {
        // 构建路由
        const routes = buildRoute(menuList)
        routes.forEach((route: any) => {
          router.addRoute('root', route)
        })
        // console.log('router list', router.getRoutes())

        // 构建菜单
        const menus = buildMenu(menuList)
        if (personal.value.layout == 'topmenu') {
          topMenu.value.list = menus
        } else if (personal.value.layout == 'sidemenu') {
          sideMenu.value.list = menus
        } else if (personal.value.layout == 'topside') {
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
            if (personal.value.layout == 'topside') {
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
          if (menuMap.value[to.key]) {
            visitEntry(menuMap.value[to.key])
          }
        }

        resolve(menuList)
      }

      // 加载菜单
      //menuData.value = local
      let menuList: Array<MenuItem> = []
      if (session.getStorage('menuList')) {
        menuList = JSON.parse(session.getStorage('menuList'))
      }
      if (!menuList || !menuList.length) {
        // 加载远程菜单
        axios
          .admin({
            url: '/api/portal/menus/pc',
            method: 'post'
          })
          .then((res: any) => {
            if (res.success) {
              if (res.body?.length) {
                const processMenu = (app: any, menus: Array<any>) => {
                  let mlist: Array<MenuItem> = []
                  if (menus && menus.length) {
                    mlist = menus.map((m: any) => {
                      if (m.configs) {
                        try {
                          const configs = JSON.parse(m.configs)
                          if (configs.meta) {
                            m.meta = configs.meta
                          }
                        } catch (e) {
                          //
                        }
                      }
                      const menu = {
                        id: m.id,
                        appId: app.id,
                        title: m.title,
                        path: '/' + app.sn + m.path,
                        url: m.url,
                        hidden: m.isHide == 1,
                        meta: {
                          icon: m.icon,
                          isExternal: m.isExternal,
                          isHide: m.isHide,
                          isIframe: m.isIframe,
                          ...(m.meta || {})
                        },
                        children: processMenu(app, m.children)
                      }
                      if (!menu.meta.psn && !menu.meta.icon) {
                        menu.meta.icon = 'UnorderedListOutlined'
                      }
                      return menu
                    })
                  }
                  return mlist
                }
                menuList = res.body.map((app: any) => {
                  return {
                    id: app.id,
                    appId: app.id,
                    title: app.name,
                    path: '/' + app.sn,
                    url: app.url,
                    meta: {
                      icon: app.icon || 'UnorderedListOutlined',
                      isMp: app.isMp,
                      versNo: app.versNo,
                      welcome: app.welcome
                    },
                    children: processMenu(app, app.menus)
                  }
                })
                session.setStorage('menuList', JSON.stringify(menuList))
                process(menuList)
              } else {
                if (errorDialog.value) {
                  errorDialog.value.close()
                }
                errorDialog.value = dialog.error({ content: '当前帐号菜单为空' })
              }
            } else {
              dialog.error({
                content: res.message
              })
            }
          })
      } else {
        // console.log('route local', local)
        // console.log('route menuList', menuList)
        process(menuList)
      }
    })
  }
  // 加载Admin 菜单END

  function rebuildMenu() {
    // 构建菜单
    let menuList: Array<MenuItem> = []
    if (session.getStorage('menuList')) {
      menuList = JSON.parse(session.getStorage('menuList'))
    }
    if (!menuList.length) {
      return
    }
    console.log('personal.value.layout:' + personal.value.layout)
    topMenu.value.list = []
    sideMenu.value.list = []
    nextTick(() => {
      const menus = buildMenu(menuList)
      if (personal.value.layout == 'topmenu') {
        topMenu.value.list = menus
      } else if (personal.value.layout == 'sidemenu') {
        sideMenu.value.list = menus
      } else if (personal.value.layout == 'topside') {
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
      topMenu.value = { ...topMenu.value }
      sideMenu.value = { ...sideMenu.value }
    })
    // 构建菜单 END
  }

  watch(
    () => personal.value?.layout,
    (newVal) => {
      rebuildMenu()
    }
  )

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
    if (!menu) {
      return
    }
    if (personal.value?.layout == 'topside') {
      sideMenu.value.selectedKeys = []
      sideMenu.value.openKeys = []
      sideMenu.value.list = menu.children
      if (!menu.children || !menu.children.length) {
        router.push(menu.path)
        visitEntry(menu)
      } else {
        const openSubMenu = (m: any) => {
          if (!m.children || !m.children.length) {
            router.push(m.path)
            visitEntry(menu)
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
    if (!menu) {
      return
    }
    router.push(menu.path)
    visitEntry(menu)
  }

  function visitEntry(menu: any) {
    console.log('visit entry', menu)
    axios.admin({
      url: '/api/common/visit/entry',
      method: 'post',
      data: {
        appId: menu.appId,
        targetType: 'menu',
        targetTitle: menu.label,
        targetId: menu.key,
        targetUrl: menu.path
      }
    })
  }

  /**
   * 加载面包屑
   * @param route
   * @returns
   */
  function loadBreadcrumbList(route: any) {
    const breadcrumbList = []
    let menu: any = menuMap.value[route.name]
    console.log('meun', menu)
    while (menu && menu.key) {
      breadcrumbList.unshift({
        key: menu.key,
        label: menu.label,
        path: menu.path,
        icon: menu.icon,
        redirect: menu.redirect
      })
      menu = menuMap.value[menu.parent]
    }
    return breadcrumbList
  }

  const session = useSession()
  function isLogin() {
    return session.isLogin()
  }

  function logout() {
    session.doLogout().then(() => {
      menuData.value = []
      menuMap.value = {}
      topMenu.value = {
        selectedKeys: [],
        openKeys: [],
        list: []
      }
      sideMenu.value = {
        collapsed: false,
        selectedKeys: [],
        openKeys: [],
        list: []
      }
      session.delStorage('menuList')
      router.push({ path: '/login' })
    })
  }

  function entry() {
    if (system.value) {
      const pathname = location.pathname.split('/')[1]
      if (pathname == system.value.ctx) {
        return
      }
    }
    if (loading.value.system) {
      return
    }

    loading.value.system = true
    axios
      .admin({
        url: '/api/entry',
        method: 'get'
      })
      .then((res: any) => {
        if (res.success) {
          system.value = res.body
          sessionStorage.setItem('systemTitle', system.value?.name || view.value.title)
        } else {
          dialog.error(res.message)
        }
      })
      .finally(() => {
        loading.value.system = false
      })
  }

  return {
    menuData,
    sideMenu,
    topMenu,
    initRoute,
    topMenuClick,
    sideMenuClick,
    view,
    logout,
    isLogin,
    rebuildMenu,
    loadBreadcrumbList,
    system,
    entry
  }
})
