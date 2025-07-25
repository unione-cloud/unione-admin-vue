<template>
  <a-badge :count="5" size="small" class="unione-notice">
    <slot name="bell">
      <bell-outlined class="bell" @click="toggle" />
    </slot>
    <draggable-resizable-vue :resizable="false" :z="100">
      <a-card class="notice-panel" v-if="visible" size="small">
        <template #title>
          <bell-outlined class="icon" />通知
          <a-input-search class="search" placeholder="请输入搜索内容" size="small" />
        </template>
        <template #extra>
          <close-outlined @click="toggle" class="icon" />
        </template>
        <a-empty />
      </a-card>
    </draggable-resizable-vue>
  </a-badge>
</template>

<script lang="ts" setup>
import { computed, defineComponent, onMounted, ref, onBeforeUnmount } from 'vue'
import { message } from 'ant-design-vue'
import DraggableResizableVue from 'draggable-resizable-vue3'
defineOptions({
  name: 'NoticeIcon'
})

const visible = ref(false)
function toggle() {
  visible.value = !visible.value
}
</script>

<style lang="less" scoped>
.unione-notice {
  .bell {
    font-size: 18px;
    cursor: pointer;
  }
  :deep(.drv) {
    border: none;
  }

  .notice-panel {
    position: fixed;
    top: 0;
    right: 5px;
    width: 300px;
    height: calc(100vh - 50px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    .icon {
      font-size: 14px;
    }
    .search {
      width: 180px;
    }
  }
}
</style>
