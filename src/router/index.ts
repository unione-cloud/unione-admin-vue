import { createRouter, createWebHistory } from 'vue-router'
import type { MenuItem } from '../stores/typing'
import { useAdminStore } from '@/stores/admin'
import { useSessionStore } from '@/stores/session'
let admin: any = null
let session: any = null

import { MailOutlined, DesktopOutlined, AppstoreOutlined } from '@ant-design/icons-vue'

export const local: Array<MenuItem> = [
  {
    sid: 'home',
    title: '首页',
    path: '/home',
    component: () => import('@/views/home.vue')
  },
  {
    sid: '20000',
    title: '系统管理',
    path: '/system',
    meta: {
      icon: 'MailOutlined'
    },
    children: [
      {
        sid: '20000100',
        title: '组织管理',
        path: '/system/organ',
        meta: {
          icon: 'MailOutlined'
        },
        children: [
          {
            sid: '20000100100',
            title: '用户管理',
            path: '/system/organ/user',
            component: () => import('@/views/system/user/list.vue')
          }
        ]
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
      path: '/login',
      name: 'login',
      component: () => import('@/views/login.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/error/404.vue')
    }
  ]
})

const whiteRouteName: Array<string> = ['NotFound', 'login']
router.beforeEach((to, from, next) => {
  // ...
  // 返回 false 以取消导航
  console.log('from', from)
  console.log('to', to)

  // 白名单，直接放行
  if (to.name && whiteRouteName.includes(to.name.toString())) {
    next()
  }

  if (!admin) {
    admin = useAdminStore()
  }
  if (!session) {
    session = useSessionStore()
  }
  if (!session.isLogin()) {
    next('/login')
  }
  admin.initRoute({ key: to.name, path: to.path, query: to.query, params: to.params }).then(() => {
    next()
  })
})

export default router
