<template>
  <a-layout class="unione-basic-layout">
    <a-layout-sider
      v-model:collapsed="state.collapsed"
      :collapsedWidth="50"
      collapsible
      class="unione-layout-sider"
      v-if="sideMenu && sideMenu.length"
    >
      <div class="logo" />
      <a-menu
        class="unione-sider-menu"
        v-model:openKeys="state.openKeys"
        v-model:selectedKeys="state.selectedKeys"
        mode="inline"
        theme="dark"
        :inline-collapsed="state.collapsed"
        :items="sideMenu"
      ></a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header
        style="background: #fff; padding: 0"
        class="unione-layout-header"
        v-if="(sideMenu && sideMenu.length) || (topMenu && topMenu.length)"
      >
        <div class="unione-header-left">
          <div class="logo-box" v-if="!sideMenu || !sideMenu.length" />
          <a-menu
            class="unione-header-menu"
            mode="horizontal"
            :items="topMenu"
            @click="({ key }) => admin.topMenuClick(key)"
          />
        </div>

        <div class="unione-header-right">
          <notice-icon class="item" />
          <avatar-dropdown :principal="principal" class="item" />
        </div>
      </a-layout-header>
      <a-layout-content
        :style="{ margin: '10px', padding: '10px', background: '#fff', minHeight: '280px' }"
      >
        Content-view
        <RouterView></RouterView>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { RouterView } from 'vue-router'
import { default as AvatarDropdown } from '@/components/avatar-dropdown.vue'
import { default as NoticeIcon } from '@/components/notice-icon/index.vue'
import { useSessionStore } from '@/stores/session'
import { useAdminStore } from '@/stores/admin'

// 会话对象
const session = useSessionStore()
const principal = session.principal

// Admin对象
const admin = useAdminStore()
admin.loadMenu()
const sideMenu = computed(() => {
  return admin.sideMenu
})
const topMenu = computed(() => {
  return admin.topMenu
})
const view = computed(() => {
  return admin.view
})

console.log('=============', sideMenu)

const state = ref({
  collapsed: false,
  selectedKeys: ['1'],
  openKeys: ['sub1'],
  preOpenKeys: ['sub1']
})

watch(
  () => state.value.openKeys,
  (_val, oldVal) => {
    state.value.preOpenKeys = oldVal
  }
)
</script>

<style scoped lang="less">
.unione-basic-layout {
  height: 100vh;

  .unione-layout-sider {
    .logo {
      height: 32px;
      background: rgba(255, 255, 255, 0.3);
      margin: 16px;
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
}
</style>
