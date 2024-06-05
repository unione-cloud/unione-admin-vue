import { h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { MenuItem } from '../stores/typing'

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
    name: 'home',
    url: '@/views/HomeView.vue'
  },
  {
    sid: 'about',
    title: '关于',
    path: '/about',
    name: 'about',
    url: '@/views/AboutView.vue'
  },
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

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      component: () => import('@/layouts/basicLayout.vue')
    }
  ]
})

export default router
