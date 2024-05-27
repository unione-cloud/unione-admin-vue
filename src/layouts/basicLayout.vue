<template>
  <a-layout class="unione-basic-layout">
    <a-layout-sider
      v-model:collapsed="state.collapsed"
      :collapsedWidth="50"
      collapsible
      class="unione-layout-sider"
    >
      <div class="logo" />
      <a-menu
        class="unione-sider-menu"
        v-model:openKeys="state.openKeys"
        v-model:selectedKeys="state.selectedKeys"
        mode="inline"
        theme="dark"
        :inline-collapsed="state.collapsed"
        :items="menuTree"
      ></a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0" class="unione-layout-header">
        <div class="unione-header-left">
          <menu-unfold-outlined
            v-if="state.collapsed"
            class="trigger"
            @click="() => (state.collapsed = !state.collapsed)"
          />
          <menu-fold-outlined
            v-else
            class="trigger"
            @click="() => (state.collapsed = !state.collapsed)"
          />
          <a-menu class="unione-header-menu" mode="horizontal" :items="menuTree" />
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
        {{ view }}
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
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
const menuTree = admin.menuTree
const view = admin.view

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
      width: calc(100% - 140px);

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
        display: inline-block;

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
