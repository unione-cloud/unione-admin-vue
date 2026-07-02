import { createRouter, createWebHistory } from 'vue-router'
import type { MenuItem } from '../stores/typing'
import {
  UnioneDataSourceList,
  UnioneDataDefineList,
  UnioneDataDefineEdit,
  UnionePageForm,
  UnionePageList
} from 'unione-form-vue'
import { useAdminStore } from '@/stores/admin'
import { setDocumentTitle } from '@/utils/domUtil'

export const local: Array<MenuItem> = []

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
          meta: {
            title: '首页'
          },
          name: 'home',
          component: () => import('@/views/home.vue')
        },
        {
          path: '/ucenter',
          name: 'ucenter',
          component: () => import('@/views/portal/ucenter/index.vue')
        },
        {
          name: 'data',
          path: '/data',
          meta: {
            icon: 'MailOutlined'
          },
          children: [
            {
              name: 'dataSource',
              path: '/data/source/list',
              component: UnioneDataSourceList
            },
            {
              name: 'dataAdd',
              path: '/data/page/add',
              component: UnionePageForm
            },
            {
              name: 'dataEdit',
              path: '/data/page/edit',
              component: UnionePageForm
            },
            {
              name: 'dataView',
              path: '/data/page/view',
              component: UnionePageForm
            },
            {
              name: 'dataList',
              path: '/data/page/list',
              component: UnionePageList
            },
            {
              name: 'dataListAdd',
              path: '/data/page/list/add',
              component: UnionePageForm
            },
            {
              name: 'dataListEdit',
              path: '/data/page/list/edit',
              component: UnionePageForm
            },
            {
              name: 'dataListView',
              path: '/data/page/list/view',
              component: UnionePageForm
            }
          ]
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
router.beforeEach((to: any, from: any, next) => {
  // ...
  // 返回 false 以取消导航
  console.log('from', from)
  console.log('to', to)

  // 白名单，直接放行
  if (to.name && whiteRouteName.includes(to.name.toString())) {
    next()
  }

  const admin = useAdminStore()
  const systemTitle = sessionStorage.getItem('systemTitle') || 'Unione Cloud'
  setDocumentTitle((to.meta?.title || to.title) + '-' + systemTitle)

  admin.entry()
  if (!admin.isLogin()) {
    next({ path: '/login' })
  } else {
    admin.initRoute(to).then(() => {
      next()
    })
  }
})

export default router
