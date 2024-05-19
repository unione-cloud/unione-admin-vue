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
        :items="items"
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
          <a-menu class="unione-header-menu" mode="horizontal" :items="items" />
        </div>

        <div class="unione-header-right">
          <notice-icon class="item" />
          <avatar-dropdown :principal="principal" class="item" />
        </div>
      </a-layout-header>
      <a-layout-content
        :style="{ margin: '10px', padding: '10px', background: '#fff', minHeight: '280px' }"
      >
        Content-currentUser
        {{ principal }}
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import { ref, watch, h } from 'vue'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  PieChartOutlined,
  MailOutlined,
  DesktopOutlined,
  InboxOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue'
import { default as AvatarDropdown } from '@/components/avatar-dropdown.vue'
import { default as NoticeIcon } from '@/components/notice-icon/index.vue'
import { useSessionStore } from '@/stores/session'
const session = useSessionStore()
const principal = session.principal

const state = ref({
  collapsed: false,
  selectedKeys: ['1'],
  openKeys: ['sub1'],
  preOpenKeys: ['sub1']
})

const items = ref([
  {
    key: '1',
    icon: () => h(PieChartOutlined),
    label: 'Option 1',
    title: 'Option 1'
  },
  {
    key: '2',
    icon: () => h(DesktopOutlined),
    label: 'Option 2',
    title: 'Option 2'
  },
  {
    key: '3',
    icon: () => h(InboxOutlined),
    label: 'Option 3',
    title: 'Option 3'
  },
  {
    key: 'sub1',
    icon: () => h(MailOutlined),
    label: 'Navigation One',
    title: 'Navigation One',
    children: [
      {
        key: '5',
        label: 'Option 5',
        title: 'Option 5'
      },
      {
        key: '6',
        label: 'Option 6',
        title: 'Option 6'
      },
      {
        key: '7',
        label: 'Option 7',
        title: 'Option 7'
      },
      {
        key: '8',
        label: 'Option 8',
        title: 'Option 8'
      }
    ]
  },
  {
    key: 'sub2',
    icon: () => h(AppstoreOutlined),
    label: 'Navigation Two',
    title: 'Navigation Two',
    children: [
      {
        key: '9',
        label: 'Option 9',
        title: 'Option 9'
      },
      {
        key: '10',
        label: 'Option 10',
        title: 'Option 10'
      },
      {
        key: 'sub3',
        label: 'Submenu',
        title: 'Submenu',
        children: [
          {
            key: '11',
            label: 'Option 11',
            title: 'Option 11'
          },
          {
            key: '12',
            label: 'Option 12',
            title: 'Option 12'
          }
        ]
      }
    ]
  }
])
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
