import { ref, h, computed, nextTick } from 'vue'
import { defineStore } from 'pinia'
import type { MenuItem, ViewSetting } from './typing'
import config from '@/config/settings'
import { axios, useDialog, useSession } from 'unione-base-vue'
import { useRouter } from 'vue-router'
import * as Icons from '@ant-design/icons-vue/lib/icons'

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
  const view = ref<ViewSetting>(config.view)
  // const view = computed(() => config.view)
  const router = useRouter()
  const dialog = useDialog()

  // 构建路由
  function buildRoute(items: Array<MenuItem>) {
    const routes: any = []
    if (items && items.length > 0) {
      items.forEach((item) => {
        const route: any = {
          name: item.id,
          title: item.title,
          path: item.path,
          meta: {
            ...(item.meta || {}),
            url: item.url
          },
          props: item.props || {},
          component: item.component
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
          key: item.id,
          label: item.title,
          icon: item.meta?.icon || 'UnorderedListOutlined',
          path: item.path
        }
        if (menu.icon && typeof menu.icon === 'string') {
          console.log('menu name:' + item.id + ',icon:' + menu.icon)
          const IconComponent = Icons[menu.icon as keyof typeof Icons]
          if (IconComponent) {
            menu.icon = () => h(IconComponent)
          } else {
            // 若找不到对应图标，使用默认图标
            menu.icon = () => h(Icons.UnorderedListOutlined)
            console.log('menu name:' + item.name + ', 默认图标')
          }
        }
        menuMap.value[menu.key] = menu
        menuMap.value[menu.path] = menu
        if (item.children && item.children.length) {
          menu.children = buildMenu(item.children)
          menu.children.forEach((child: any) => {
            child.parent = menu.key
          })
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
        console.log('router list', router.getRoutes())

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
                      return {
                        id: m.id,
                        title: m.title,
                        path: '/' + app.sn + m.path,
                        url: m.url,
                        hidden: m.isHide == 1,
                        meta: {
                          icon: m.icon || 'UnorderedListOutlined',
                          isExternal: m.isExternal,
                          isHide: m.isHide,
                          isIframe: m.isIframe
                        },
                        children: processMenu(app, m.children)
                      }
                    })
                  }
                  return mlist
                }
                menuList = res.body.map((app: any) => {
                  return {
                    id: app.id,
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
                dialog.error({ content: '当前张菜单为空' })
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
    console.log('view.value.layout:' + view.value.layout)
    topMenu.value.list = []
    sideMenu.value.list = []
    nextTick(() => {
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
      topMenu.value = { ...topMenu.value }
      sideMenu.value = { ...sideMenu.value }
    })
    // 构建菜单 END
  }

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
    isLogin,
    rebuildMenu
  }
})
