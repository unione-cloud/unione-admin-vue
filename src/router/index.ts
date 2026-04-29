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

export const local: Array<MenuItem> = [
  {
    id: 'home',
    title: '首页',
    path: '/home',
    component: () => import('@/views/home.vue')
  },
  {
    id: '1000',
    title: 'unione',
    path: '/unione',
    hidden: true,
    meta: {
      icon: 'MailOutlined'
    },
    children: [
      {
        id: '1001',
        title: '新增',
        path: '/unione/page/add',
        component: UnionePageForm
      },
      {
        id: '1002',
        title: '修改',
        path: '/unione/page/edit',
        component: UnionePageForm
      },
      {
        id: '1003',
        title: '查看',
        path: '/unione/page/view',
        component: UnionePageForm
      },
      {
        id: '1004',
        title: '列表',
        path: '/unione/page/list',
        component: UnionePageList
      }
    ]
  },
  {
    id: '20000',
    title: '系统管理',
    path: '/system',
    meta: {
      icon: 'MailOutlined'
    },
    children: [
      {
        id: '20000100',
        title: '数据管理',
        path: '/system/data/manage',
        meta: {
          icon: 'MailOutlined'
        },
        children: [
          {
            id: '20000100100',
            title: '数据定义',
            path: '/system/data/define/list',
            component: UnioneDataDefineList
          },
          {
            id: '20000100101',
            title: '数据定义',
            path: '/system/data/define/edit',
            hidden: true,
            component: UnioneDataDefineEdit
          }
        ]
      },
      {
        id: '20000101',
        title: '基础管理',
        path: '/system/base',
        meta: {
          icon: 'MailOutlined'
        },
        children: [
          {
            id: '20000101100',
            title: '字典管理',
            path: '/system/base/dict',
            component: () => import('@/views/system/base/dict/list.vue')
          },
          {
            id: '20000101101',
            title: '应用管理',
            path: '/system/base/apps',
            component: () => import('@/views/system/base/apps/list.vue')
          },
          {
            id: '2000010110101',
            title: '接口管理',
            path: '/system/base/apps/api',
            hidden: true,
            component: () => import('@/views/system/base/apps/api.vue')
          },
          {
            id: '2000010110102',
            title: '资源管理',
            path: '/system/base/apps/res',
            hidden: true,
            component: () => import('@/views/system/base/apps/res.vue')
          },
          {
            id: '20000101102',
            title: '层级树管理',
            path: '/system/base/ctree',
            component: () => import('@/views/system/base/ctree/list.vue')
          },
          {
            id: '2000010110201',
            title: '层级编码管理',
            path: '/system/base/ctree/lvsn',
            hidden: true,
            component: () => import('@/views/system/base/ctree/lvsn.vue')
          }
        ]
      },
      {
        id: '20000102',
        title: '组织管理',
        path: '/system/org',
        meta: {
          icon: 'MailOutlined'
        },
        children: [
          {
            id: '20000102100',
            title: '机构管理',
            path: '/system/org/organ',
            component: () => import('@/views/system/org/organ/tree.vue')
          },
          {
            id: '20000102101',
            title: '用户管理',
            path: '/system/org/user',
            component: () => import('@/views/system/org/user/list.vue')
          },
          {
            id: '2000010210101',
            title: '角色列表',
            path: '/system/org/user/rolelist',
            hidden: true,
            component: () => import('@/views/system/org/user/roles.vue')
          },
          {
            id: '20000102102',
            title: '角色管理',
            path: '/system/org/role',
            component: () => import('@/views/system/org/role/list.vue')
          },
          {
            id: '2000010210201',
            title: '用户列表',
            path: '/system/org/role/userlist',
            hidden: true,
            component: () => import('@/views/system/org/role/users.vue')
          },
          {
            id: '20000102103',
            title: '分组管理',
            path: '/system/org/group',
            component: () => import('@/views/system/org/group/tree.vue')
          },
          {
            id: '20000102104',
            title: '岗位管理',
            path: '/system/org/post',
            component: () => import('@/views/system/org/post/tree.vue')
          }
        ]
      },
      {
        id: '20000103',
        title: '权限管理',
        path: '/system/permis',
        meta: {
          icon: 'MailOutlined'
        },
        children: [
          {
            id: '20000103001',
            title: '用户权限',
            path: '/system/permis/user',
            component: () => import('@/views/system/permis/user/list.vue')
          },
          {
            id: '20000103002',
            title: '角色权限',
            path: '/system/permis/role',
            component: () => import('@/views/system/permis/role/list.vue')
          },
          {
            id: '20000103003',
            title: '用户列表',
            path: '/system/permis/role/users',
            hidden: true,
            component: () => import('@/views/system/permis/role/users.vue')
          },
          {
            id: '20000103004',
            title: '资源分配',
            path: '/system/permis/resa',
            component: () => import('@/views/system/permis/resa/tree.vue')
          }
        ]
      },
      {
        id: '20000900',
        title: '租户管理',
        path: '/system/tenant',
        meta: {
          icon: 'MailOutlined'
        },
        children: [
          {
            id: '20000900001',
            title: '租户列表',
            path: '/system/tenant/list',
            component: () => import('@/views/system/tenant/list/index.vue')
          }
        ]
      },
      {
        id: '20000901',
        title: '运维管理',
        path: '/system/ops',
        meta: {
          icon: 'MailOutlined'
        },
        children: [
          {
            id: '20000901001',
            title: '日志管理',
            path: '/system/ops/logs',
            component: () => import('@/views/system/ops/logs/list.vue')
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
  const systemTitle = sessionStorage.getItem('systemTitle') || 'Unione Cloud'
  setDocumentTitle(to.meta?.title + '-' + systemTitle)

  admin.entry().then(() => {
    if (!admin.isLogin()) {
      next({ path: '/login' })
    } else {
      admin.initRoute(to).then(() => {
        next()
      })
    }
  })
})

export default router
