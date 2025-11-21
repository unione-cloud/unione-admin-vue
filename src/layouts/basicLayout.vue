<template>
  <a-layout class="unione-basic-layout">
    <template v-if="!isIframe">
      <a-layout-sider v-model:collapsed="sideMenu.collapsed" :collapsedWidth="50" collapsible
        class="unione-layout-sider" v-if="sideMenu.list && sideMenu.list.length">
        <div class="logo-box">
          <div class="logo-title" :style="view.logo.title.css">
            {{ sideMenu.collapsed ? view.logo.title.side : view.logo.title.text }}
          </div>
        </div>
        <a-menu class="unione-sider-menu" v-model:openKeys="sideMenu.openKeys"
          v-model:selectedKeys="sideMenu.selectedKeys" mode="inline" theme="dark" :inline-collapsed="sideMenu.collapsed"
          :items="sideMenu.list" @click="({ key }: any) => admin.sideMenuClick(key)"></a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-header style="background: #fff; padding: 0" class="unione-layout-header"
          v-if="(sideMenu.list && sideMenu.list.length) || (topMenu.list && topMenu.list.length)">
          <div class="unione-header-left">
            <div class="logo-box" v-if="!sideMenu.list || !sideMenu.list.length">
              <div class="logo-title" :style="view.logo.title.css">
                {{ sideMenu.collapsed ? view.logo.title.side : view.logo.title.text }}
              </div>
            </div>
            <a-menu class="unione-header-menu" mode="horizontal" v-model:openKeys="topMenu.openKeys"
              v-model:selectedKeys="topMenu.selectedKeys" :items="topMenu.list"
              v-if="topMenu.list && topMenu.list.length" @click="({ key }: any) => admin.topMenuClick(key)">
              <!-- <a-menu-item v-for="menu in topMenu.list" :key="menu.key">
                <component #icon v-if="menu.icon" :is="menu.icon"></component>
                {{ menu.label }}
              </a-menu-item> -->
            </a-menu>
          </div>

          <div class="unione-header-right">
            <notice-icon class="item" />
            <avatar-dropdown :principal="principal" class="item" />
          </div>
        </a-layout-header>
        <a-layout-content class="unione-layout-content">
          <unione-breadcrumb />
          <iframe class="unione-iframe-content" v-if="iframeUrl" :src="iframeUrl"></iframe>
          <component class="unione-page-content" v-else-if="$route.meta.isIframe != 1 && viewComponent"
            :is="viewComponent" />
          <RouterView v-else :key="$route.name?.toString()"></RouterView>
        </a-layout-content>
      </a-layout>
    </template>
    <template v-if="isIframe">
      <a-layout-content class="unione-layout-content">
        <iframe class="unione-iframe-content" v-if="$route.meta.url && $route.meta.isIframe == 1"
          :src="$route.meta.url.toString()"></iframe>
        <component class="unione-page-content" v-else-if="$route.meta.isIframe != 1 && viewComponent"
          :is="viewComponent" />
        <RouterView v-else :key="$route.name?.toString()"></RouterView>
      </a-layout-content>
    </template>
  </a-layout>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, getCurrentInstance } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { default as AvatarDropdown } from '@/components/avatar/avatar-dropdown.vue'
import { default as NoticeIcon } from '@/components/notice-icon/index.vue'
import { useSession } from 'unione-base-vue'
import { useAdminStore } from '@/stores/admin'

const instance = getCurrentInstance()
const app = computed<any>(() => {
  return instance?.appContext?.app
})

// 会话对象
const session = useSession()
const route = useRoute()

const principal = computed(() => {
  return session.getPrincipal()
})

// Admin对象
const admin = useAdminStore()
const sideMenu = computed(() => {
  if (admin.sideMenu.collapsed) {
    document.body.classList.add('side-menu-collapsed')
  } else {
    document.body.classList.remove('side-menu-collapsed')
  }
  return admin.sideMenu
})
const topMenu = computed(() => {
  return admin.topMenu
})
const view: any = computed(() => {
  return admin.view
})

const viewComponent = computed(() => {
  if (route.meta.isIframe != 1 && route.meta.url) {
    if (route.meta.url.toString().startsWith('@')) {
      // return pageComponents[route.meta.url.toString().replace('@', '')]
      const component = app.value?.component(route.meta.url.toString().replace('@', ''))
      if (component) {
        return component
      }
    }

    // 生产环境安全的动态导入方式 - 使用import.meta.glob预加载所有视图组件
    const fullPath = `../views${route.meta.url}.vue`;
    // 预加载views目录下所有.vue文件，{ eager: false }保持懒加载特性
    const modules: any = import.meta.glob('../views/**/*.vue', { eager: false });

    if (modules[fullPath]) {
      return defineAsyncComponent(modules[fullPath]);
    }

    // 组件未找到时的错误处理
    console.error(`动态组件加载失败: 未找到组件文件 ${fullPath}`);
    return defineAsyncComponent(() => import('../views/error/404.vue')); // 可选: 加载404组件
  }
  return null
})

const iframeUrl = computed<string>(() => {
  if (route.meta.isIframe == 1 && route.meta.url) {
    if (route.meta.url.toString().indexOf('?') == -1) {
      return route.meta.url.toString() + '?isIframe=1'
    }
    return route.meta.url.toString() + '&isIframe=1'
  }
  return ''
})
const isIframe = computed(() => {
  const envMode = import.meta.env.MODE;
  if (envMode === 'dev') {
    // 开发环境: 默认非iframe，可通过URL参数强制开启
    return route.query.isIframe?.toString() === '1';
  }
  // 生产环境: 严格依赖URL参数
  return route.query.isIframe?.toString() === '1' || route.meta.isIframe == 1 || route.query.isIframe?.toString() === 'true' || route.meta.isIframe == true;
})
</script>

<style scoped lang="less">
.unione-basic-layout {
  height: 100vh;

  .unione-layout-sider {
    .logo-box {
      height: 64px;
      line-height: 64px;
      overflow: hidden;
      cursor: pointer;

      .logo-title {
        color: #ffffff;
      }
    }

    &.ant-layout-sider-collapsed {
      .logo {
        margin: 5px;
      }

      .unione-sider-menu {
        /deep/.ant-menu-item-icon {
          font-size: 20px;
        }
      }
    }
  }

  .unione-layout-header {
    .unione-header-left {
      float: left;
      height: 100%;
      width: calc(100% - 140px);

      .logo-box {
        height: 100%;
        width: 200px;
        background: rgba(0, 0, 0, 0.88);
        display: inline-block;

        .logo-title {
          color: #ffffff;
          position: absolute;
        }
      }

      .trigger {
        font-size: 18px;
        line-height: 64px;
        padding: 0 15px;
        cursor: pointer;
        transition: color 0.3s;
      }

      .trigger:hover {
        color: #1890ff;
      }

      .unione-header-menu {
        display: inline-flex;
      }
    }

    .unione-header-right {
      float: right;

      /deep/.item {
        margin: 0 10px;
      }
    }
  }

  .unione-layout-content {
    margin: 10px;
    // padding: 10px;
    background: #ffffff;
    height: 100%;
    overflow: hidden;
    border-radius: 4px;

    .unione-iframe-content {
      width: 100%;
      height: 100%;
      border: none;
    }

    .unione-page-content {
      width: 100%;
      height: 100%;
    }
  }
}
</style>