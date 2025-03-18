import { createRouter, createWebHistory } from 'vue-router'
import type { MenuItem } from '../stores/typing'
import {
  UnioneDataDefineList,
  UnioneDataDefineEdit,
  UnionePageForm,
  UnionePageList
} from 'unione-form-vue'
import { useAdminStore } from '@/stores/admin'

export const local: Array<MenuItem> = [
  {
    sid: 'home',
    title: '首页',
    path: '/home',
    component: () => import('@/views/home.vue')
  },
  {
    sid: '1000',
    title: 'unione',
    path: '/unione',
    hidden: true,
    meta: {
      icon: 'MailOutlined'
    },
    children: [
      {
        sid: '1001',
        title: '新增',
        path: '/unione/page/add',
        component: UnionePageForm
      },
      {
        sid: '1002',
        title: '修改',
        path: '/unione/page/edit',
        component: UnionePageForm
      },
      {
        sid: '1003',
        title: '查看',
        path: '/unione/page/view',
        component: UnionePageForm
      },
      {
        sid: '1004',
        title: '列表',
        path: '/unione/page/list',
        component: UnionePageList
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
        title: '数据管理',
        path: '/system/data/manage',
        meta: {
          icon: 'MailOutlined'
        },
        children: [
          {
            sid: '20000100100',
            title: '数据定义',
            path: '/system/data/define/list',
            component: UnioneDataDefineList
          },
          {
            sid: '20000100101',
            title: '数据定义',
            path: '/system/data/define/edit',
            hidden: true,
            component: UnioneDataDefineEdit
          }
        ]
      },
      {
        sid: '20000101',
        title: '基础管理',
        path: '/system/base',
        meta: {
          icon: 'MailOutlined'
        },
        children: [
          {
            sid: '20000101100',
            title: '字典管理',
            path: '/system/base/dict',
            component: () => import('@/views/system/base/dict/list.vue')
          },
          {
            sid: '20000101101',
            title: '应用管理',
            path: '/system/base/apps',
            component: () => import('@/views/system/base/apps/list.vue')
          },
          {
            sid: '2000010110101',
            title: '接口管理',
            path: '/system/base/apps/api',
            hidden: true,
            component: () => import('@/views/system/base/apps/api.vue')
          },
          {
            sid: '2000010110102',
            title: '资源管理',
            path: '/system/base/apps/res',
            hidden: true,
            component: () => import('@/views/system/base/apps/res.vue')
          },
          {
            sid: '20000101102',
            title: '层级树管理',
            path: '/system/base/ctree',
            component: () => import('@/views/system/base/ctree/list.vue')
          },
          {
            sid: '2000010110201',
            title: '层级编码管理',
            path: '/system/base/ctree/lvsn',
            hidden: true,
            component: () => import('@/views/system/base/ctree/lvsn.vue')
          }
        ]
      },
      {
        sid: '20000102',
        title: '组织管理',
        path: '/system/org',
        meta: {
          icon: 'MailOutlined'
        },
        children: [
          {
            sid: '20000102100',
            title: '机构管理',
            path: '/system/org/organ',
            component: () => import('@/views/system/org/organ/tree.vue')
          },
          {
            sid: '20000102101',
            title: '用户管理',
            path: '/system/org/user',
            component: () => import('@/views/system/org/user/list.vue')
          },
          {
            sid: '2000010210101',
            title: '角色列表',
            path: '/system/org/user/rolelist',
            hidden: true,
            component: () => import('@/views/system/org/user/roles.vue')
          },
          {
            sid: '20000102102',
            title: '角色管理',
            path: '/system/org/role',
            component: () => import('@/views/system/org/role/list.vue')
          },
          {
            sid: '2000010210201',
            title: '用户列表',
            path: '/system/org/role/userlist',
            hidden: true,
            component: () => import('@/views/system/org/role/users.vue')
          },
          {
            sid: '20000102103',
            title: '分组管理',
            path: '/system/org/group',
            component: () => import('@/views/system/org/group/tree.vue')
          },
          {
            sid: '20000102104',
            title: '岗位管理',
            path: '/system/org/post',
            component: () => import('@/views/system/org/post/tree.vue')
          }
        ]
      },
      {
        sid: '20000900',
        title: '租户管理',
        path: '/system/tenant',
        meta: {
          icon: 'MailOutlined'
        },
        children: [
          {
            sid: '20000900001',
            title: '租户列表',
            path: '/system/tenant/list',
            component: () => import('@/views/system/tenant/list/index.vue')
          }
        ]
      },
      {
        sid: '20000901',
        title: '运维管理',
        path: '/system/ops',
        meta: {
          icon: 'MailOutlined'
        },
        children: [
          {
            sid: '20000901001',
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
