<template>
  <a-layout :class="['unione-basic-layout', theme]">
    <template v-if="!isIframe">
      <a-layout-sider v-model:collapsed="sideMenu.collapsed" :collapsedWidth="50" collapsible
        class="unione-layout-sider" v-if="sideMenu.list && sideMenu.list.length" :theme="theme">
        <div :class="['logo-box', sideMenu.collapsed ? 'collapsed' : 'expanded']">
          <div class="logo-title" :style="logoTitleCss">
            {{ sideMenu.collapsed ? logoTitleSide : logoTitleText }}
          </div>
        </div>
        <a-menu class="unione-sider-menu" v-model:openKeys="sideMenu.openKeys"
          v-model:selectedKeys="sideMenu.selectedKeys" mode="inline" :theme="theme"
          :inline-collapsed="sideMenu.collapsed" :items="sideMenu.list"
          @click="({ key }: any) => admin.sideMenuClick(key)"></a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-header style="background: #fff; padding: 0" class="unione-layout-header"
          v-if="(sideMenu.list && sideMenu.list.length) || (topMenu.list && topMenu.list.length)">
          <div class="unione-header-left">
            <div class="logo-box expanded" v-if="!sideMenu.list || !sideMenu.list.length">
              <div class="logo-title" :style="logoTitleCss">
                {{ sideMenu.collapsed ? logoTitleSide : logoTitleText }}
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
            :is="viewComponent" :key="$route.path" />
          <RouterView v-else :key="$route.name?.toString()"></RouterView>
        </a-layout-content>
      </a-layout>
    </template>
    <template v-if="isIframe">
      <a-layout-content class="unione-layout-content">
        <iframe class="unione-iframe-content" v-if="$route.meta.url && $route.meta.isIframe == 1"
          :src="$route.meta.url.toString()"></iframe>
        <component class="unione-page-content" v-else-if="$route.meta.isIframe != 1 && viewComponent"
          :is="viewComponent" :key="$route.path" />
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
import { useConfigStore } from '@/config'

const instance = getCurrentInstance()
const app = computed<any>(() => {
  return instance?.appContext?.app
})

// 会话对象
const session = useSession()
const route = useRoute()
const configStore = useConfigStore()

const principal = computed(() => {
  return session.getPrincipal()
})

const theme = computed(() => {
  return configStore.config.personal?.theme || 'dark'
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
const logoTitleText = computed(() => {
  const logo = admin.system?.configs?.logo
  if (logo && Object.keys(logo).includes('title')) {
    return logo.text
  }
  return view.value.logo.title.text
})
const logoTitleSide = computed(() => {
  const logo = admin.system?.configs?.logo
  if (logo && Object.keys(logo).includes('side')) {
    return logo.side
  }
  return view.value.logo.title.side
})
const logoTitleCss = computed(() => {
  let style: any = { ...(view.value.logo.title.css || {}) }
  const logo = admin.system?.configs?.logo
  if (logo && Object.keys(logo).includes('css')) {
    style = { ...logo.css }
  }
  if (admin.system) {
    if (sideMenu.value.collapsed) {
      if (admin.system.logoSmall && !logoTitleSide.value) {
        style.backgroundImage = 'url(' + configStore.config.axios.admin + '/api/common/store/preview/public/' + admin.system.logoSmall + ')'
      }
    } else {
      if (admin.system.logoLarge) {
        style.backgroundImage = 'url(' + configStore.config.axios.admin + '/api/common/store/preview/public/' + admin.system.logoLarge + ')'
      }
    }
  }
  return style
})

const viewComponent = computed(() => {
  if (route.meta.isIframe != 1 && route.meta.url) {
    if (route.meta.url.toString().startsWith('@')) {
      // return pageComponents[route.meta.url.toString().replace('@', '')]
      let pageName = route.meta.url.toString().replace('@', '')
      //@ts-ignore
      if (route.query?.psn?.endsWith(':form') && pageName == 'UnionePageList') {
        pageName = 'UnionePageForm'
        //@ts-ignore
      } else if (route.query?.psn?.endsWith(':view') && pageName == 'UnionePageList') {
        pageName = 'UnionePageView'
      }
      const component = app.value?.component(pageName)
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
    let url = route.meta.url.toString()
    if (url.indexOf('?') == -1) {
      url += '?isIframe=1'
    } else {
      url += '&isIframe=1'
    }
    if (url.indexOf('{accessToken}') != -1) {
      url = url.replace('{accessToken}', session.getToken())
    }
    return url
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
  return route.query.isIframe?.toString() === '1' || route.query.isIframe?.toString() === 'true'
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
        background-size: 100% 100%;
      }

      &.expanded {
        .logo-title {
          background-image: url('/logo.png');
        }
      }
    }

    &.ant-layout-sider-collapsed {
      .logo-title {
        background-color: #1890ff;
        display: flex;
        align-items: center;
        justify-content: center;
        width: auto !important;
      }

      .unione-sider-menu {
        :deep(.ant-menu-item-icon) {
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
          color: #FFFFFF;
          position: absolute;
          background-size: 100% 100%;
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

      :deep(.item) {
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
      height: calc(100% - 20px);
      border: none;
    }

    .unione-page-content {
      width: 100%;
      height: calc(100% - 20px);
    }
  }

  &.dark {
    .logo-box {
      &.expanded {
        .logo-title {
          background-image: url('/logo.png');
        }
      }
    }
  }

  &.light {
    .logo-box {
      .logo-title {
        border-bottom: 1px solid #f5f5f5;
        background-color: #ffffff;
      }

      &.expanded {
        .logo-title {
          background-image: url('/logo_light.png');
        }
      }
    }
  }

}
</style>