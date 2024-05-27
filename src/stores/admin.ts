import { ref, h } from 'vue'
import { defineStore } from 'pinia'
import type { MenuItem, ViewSetting } from './typing'
import config from '@/config/settings'

import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  PieChartOutlined,
  MailOutlined,
  DesktopOutlined,
  InboxOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue'

/**
 * Admin Store
 */
export const useAdminStore = defineStore('unione-admin', () => {
  // 菜单数据集合
  const menuData = ref<Array<MenuItem>>([])

  const menuTree = ref<any>([])
  // view配置
  const view = ref<ViewSetting>({ ...config.view })

  // 构建菜单树
  function buildMenu(item?: MenuItem) {
    if (!item) {
      menuTree.value = []
      menuData.value.forEach((item) => {
        const menu = buildMenu(item)
        menuTree.value.push(menu)
      })
    } else {
      const menu: any = {
        key: item.sid,
        label: item.name,
        title: item.title,
        icon: item.meta?.icon
      }

      if (item.children && item.children.length) {
        menu.children = []
        item.children.forEach((i) => {
          const sub = buildMenu(i)
          menu.children.push(sub)
        })
      }

      return menu
    }
  }

  // 加载Admin 菜单
  function loadMenu() {
    menuData.value = [
      {
        sid: '1',
        name: 'Option 1',
        title: 'Option 1',
        path: '/opt1',
        meta: {
          icon: () => h(PieChartOutlined)
        }
      },
      {
        sid: '2',
        name: 'Option 2',
        title: 'Option 2',
        path: '/opt2',
        meta: {
          icon: () => h(DesktopOutlined)
        }
      },
      {
        sid: '3',
        name: 'Option 3',
        title: 'Option 3',
        path: '/opt3',
        meta: {
          icon: () => h(InboxOutlined)
        }
      },
      {
        sid: 'sub1',
        name: 'Navigation One',
        title: 'Navigation One',
        path: '/sub1',
        meta: {
          icon: () => h(MailOutlined)
        },
        children: [
          {
            sid: '5',
            name: 'Option 5',
            title: 'Option 5',
            path: '/sub1.1'
          },
          {
            sid: '6',
            name: 'Option 6',
            title: 'Option 6',
            path: '/sub1.2'
          },
          {
            sid: '7',
            name: 'Option 7',
            title: 'Option 7',
            path: '/sub1.3'
          },
          {
            sid: '8',
            name: 'Option 8',
            title: 'Option 8',
            path: '/sub1.4'
          }
        ]
      },
      {
        sid: 'sub2',
        name: 'Navigation Two',
        title: 'Navigation Two',
        path: '/sub2',
        meta: {
          icon: () => h(AppstoreOutlined)
        },
        children: [
          {
            sid: '9',
            name: 'Option 9',
            title: 'Option 9',
            path: '/sub2.1'
          },
          {
            sid: '10',
            name: 'Option 10',
            title: 'Option 10',
            path: '/sub2.2'
          },
          {
            sid: 'sub3',
            name: 'Submenu',
            title: 'Submenu',
            path: '/sub3',
            children: [
              {
                sid: '11',
                name: 'Option 11',
                title: 'Option 11',
                path: '/sub3.1'
              },
              {
                sid: '12',
                name: 'Option 12',
                title: 'Option 12',
                path: '/sub3.2'
              }
            ]
          }
        ]
      }
    ]

    // 构建菜单树
    buildMenu()
  }

  // 设置view
  function setView(setting: ViewSetting) {
    view.value = { ...view.value, ...setting }
  }

  return { menuData, menuTree, loadMenu, view, setView }
})
