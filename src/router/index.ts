import { createRouter, createWebHistory } from 'vue-router'
import type { MenuItem } from '../stores/typing'
import { UnionePageView } from 'unione-form-vue'
import { useAdminStore } from '@/stores/admin'

export const local: Array<MenuItem> = [
  {
    sid: 'home',
    title: '首页',
    path: '/home',
    component: () => import('@/views/home.vue')
  },
  {
    sid: '10000',
    title: '表单页面',
    path: '/form',
    meta: {
      icon: 'MailOutlined'
    },
    children: [
      {
        sid: '100001000',
        title: '用户管理',
        path: '/form/organ/user',
        component: UnionePageView,
        meta: {
          psn: 'udemo'
        }
      },
      {
        sid: '100001001',
        title: '数据定义',
        path: '/form/data/define',
        component: () => import('@/views/demo/dms.vue')
      }
    ]
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
      redirect: '/home',
      component: () => import('@/layouts/basicLayout.vue'),
      children: [
        {
          path: '/home',
          name: 'home',
          component: () => import('@/views/home.vue')
        }
      ]
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

//路由守卫
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

  const admin = useAdminStore()
  if (!admin.isLogin()) {
    next({ path: '/login' })
  }
  admin.initRoute(to).then(() => {
    next()
  })
})

export default router
