<template>
  <a-dropdown
    class="unione-dropdown unione-dropdown-action"
    placement="bottomRight"
    :trigger="['click']"
    v-model:visible="visible"
    overlayClassName="unione-dropdown-index-container"
  >
    <span :class="['noticeButton', { opened: visible }]">
      <a-badge :count="count" :style="{ boxShadow: 'none' }" class="badge">
        <slot name="bell">
          <bell-outlined class="icon" />
        </slot>
      </a-badge>
    </span>
    <template #overlay>
      <div>
        <a-spin :spinning="loading" :delay="300">
          <slot />
        </a-spin>
      </div>
    </template>
  </a-dropdown>
</template>
<script lang="ts">
import { ref, defineComponent } from 'vue'
import { BellOutlined } from '@ant-design/icons-vue'
export default defineComponent({
  name: 'NoticeDropdown',
  props: {
    count: Number,
    loading: Boolean
  },
  components: {
    BellOutlined
  },
  setup() {
    const visible = ref(false)
    return {
      visible
    }
  }
})
</script>
<style lang="less" scoped>
.popover {
  position: relative;
  width: 336px;
}

.noticeButton {
  display: inline-block;
  cursor: pointer;
  transition: all 0.3s;
}
.icon {
  padding: 4px;
  vertical-align: middle;
}

.badge {
  font-size: 16px;
}

.tabs {
  :deep(.ant-tabs-nav-list) {
    margin: auto;
  }
  :deep(.ant-tabs-nav-scroll) {
    text-align: center;
  }
  :deep(.ant-tabs-bar) {
    margin-bottom: 0;
  }
}
</style>
<style lang="less">
.unione-dropdown-index-container > * {
  position: relative;
  width: 336px;
  // background-color: @popover-bg;
  border-radius: 4px;
  // box-shadow: @shadow-1-down;
}

@media screen and (max-width: 2048) {
  .unione-dropdown-index-container {
    width: 100% !important;
  }
  .unione-dropdown-index-container > * {
    width: 100% !important;
    border-radius: 0 !important;
  }
}
</style>
