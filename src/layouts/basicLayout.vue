<template>
  <a-layout class="unione-basic-layout">
    <a-layout-sider
      v-model:collapsed="sideMenu.collapsed"
      :collapsedWidth="50"
      collapsible
      class="unione-layout-sider"
      v-if="sideMenu.list && sideMenu.list.length"
    >
      <div class="logo-box">
        <div class="logo-title" :style="view.logo.title.css">{{ view.logo.title.text }}</div>
      </div>
      <a-menu
        class="unione-sider-menu"
        v-model:openKeys="sideMenu.openKeys"
        v-model:selectedKeys="sideMenu.selectedKeys"
        mode="inline"
        theme="dark"
        :inline-collapsed="sideMenu.collapsed"
        :items="sideMenu.list"
        @click="({ key }: any) => admin.sideMenuClick(key)"
      ></a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header
        style="background: #fff; padding: 0"
        class="unione-layout-header"
        v-if="(sideMenu.list && sideMenu.list.length) || (topMenu.list && topMenu.list.length)"
      >
        <div class="unione-header-left">
          <div class="logo-box" v-if="!sideMenu.list || !sideMenu.list.length">
            <div class="logo-title" :style="view.logo.title.css">{{ view.logo.title.text }}</div>
          </div>
          <a-menu
            class="unione-header-menu"
            mode="horizontal"
            v-model:openKeys="topMenu.openKeys"
            v-model:selectedKeys="topMenu.selectedKeys"
            :items="topMenu.list"
            @click="({ key }: any) => admin.topMenuClick(key)"
          >
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
        <iframe
          class="unione-iframe-content"
          v-if="$route.meta.url && $route.meta.isIframe == 1"
          :src="$route.meta.url.toString()"
        ></iframe>
        <RouterView v-else :key="$route.name?.toString()"></RouterView>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { computed, h } from 'vue'
import { RouterView } from 'vue-router'
import { default as AvatarDropdown } from '@/components/avatar-dropdown.vue'
import { default as NoticeIcon } from '@/components/notice-icon/index.vue'
import { useSession } from 'unione-base-vue'
import { useAdminStore } from '@/stores/admin'

// 会话对象
const session = useSession()
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
</script>

<style scoped lang="less">
.unione-basic-layout {
  height: 100vh;

  .unione-layout-sider {
    .logo-box {
      height: 64px;
      line-height: 64px;
      overflow: hidden;
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

        /deep/.ant-menu-item {
          top: -3px;
        }
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

    .unione-iframe-content {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
}
</style>
