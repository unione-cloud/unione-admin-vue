import { h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { MenuItem } from '../stores/typing'
import { useAdminStore } from '@/stores/admin'
let admin: any = null

import {
  PieChartOutlined,
  MailOutlined,
  DesktopOutlined,
  InboxOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue'

export const local: Array<MenuItem> = [
  {
    sid: 'home',
    title: '首页',
    path: '/home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    sid: '200',
    title: '台风',
    path: '/taif',
    url: 'https://wxc.gd121.cn/html/qxfw/typhoon/typhoon2/dist/#/main',
    meta: {
      icon: () => h(DesktopOutlined)
    }
  },
  {
    sid: '10000',
    title: '系统管理',
    path: '/system',
    meta: {
      icon: () => h(MailOutlined)
    },
    children: [
      {
        sid: '10000100',
        title: '组织管理',
        path: '/system/organ',
        meta: {
          icon: () => h(MailOutlined)
        },
        children: [
          {
            sid: '10000100100',
            title: '用户管理',
            path: '/system/organ/user',
            component: () => import('@/views/system/user/list.vue')
          }
        ]
      }
    ]
  },
  {
    sid: 'sub2',
    title: 'Navigation Two',
    path: '/sub2',
    meta: {
      icon: () => h(AppstoreOutlined)
    },
    children: [
      {
        sid: 'sub3',
        title: 'Submenu',
        path: '/sub3',
        children: [
          {
            sid: 'r11',
            title: 'Option 11',
            path: '/sub3.1',
            component: () => import('@/views/HomeView.vue')
          },
          {
            sid: 'r12',
            title: 'Option 12',
            path: '/sub3.2'
          }
        ]
      },
      {
        sid: 'r9',
        title: 'Option 9',
        path: '/sub2.1',
        component: () => import('@/views/HomeView.vue')
      },
      {
        sid: 'r10',
        title: 'Option 10',
        path: '/sub2.2'
      }
    ]
  }
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      component: () => import('@/layouts/basicLayout.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/error/404.vue')
    }
  ]
})

const whiteRouteName = ['NotFound']
router.beforeEach((to, from, next) => {
  // ...
  // 返回 false 以取消导航
  console.log('from', from)
  console.log('to', to)

  // 白名单，直接方行
  if (whiteRouteName.includes(to.name)) {
    next()
  }

  if (!admin) {
    admin = useAdminStore()
  }
  admin.initRoute({ key: to.name, path: to.path }).then(() => {
    next()
  })
})

export default router
