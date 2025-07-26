<template>
  <a-badge :count="5" size="small" class="unione-notice">
    <slot name="bell">
      <bell-outlined class="bell" @click="toggle" />
    </slot>
    <draggable-resizable-vue :resizable="false" :z="100">
      <a-card class="notice-panel" v-if="visible" size="small">
        <template #title>
          <bell-outlined class="icon" />
          <unione-select-box :options="umstypeList" size="small" value="-1"></unione-select-box>
          <a-input-search
            class="search"
            v-model:value="keywords"
            placeholder="请输入搜索内容"
            size="small"
            @search="doQuery"
            allowClear
          />
        </template>
        <template #extra>
          <close-outlined @click="toggle" class="icon" />
        </template>
        <a-empty />

        <a-pagination
          ref="paginationDom"
          size="small"
          showLessItems
          :showSizeChanger="false"
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-total="pagination.showtotal"
        />
      </a-card>
    </draggable-resizable-vue>
  </a-badge>
</template>

<script lang="ts" setup>
import { onMounted, ref, nextTick } from 'vue'
import { Convertor } from 'unione-form-vue'
import { useDialog } from 'unione-base-vue'
import { axios } from 'unione-base-vue'
import DraggableResizableVue from 'draggable-resizable-vue3'
defineOptions({
  name: 'NoticeIcon'
})

const dialog = useDialog()
const umstypes = new Convertor({ types: 'dict', dictName: 'UMSTYPES' })
const umstypeList = ref([])
const messageList = ref([])
const visible = ref(false)
const keywords = ref('')

const paginationDom = ref()
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 122220,
  showtotal: (total: any) => `共${total}条`
})

function toggle() {
  visible.value = !visible.value
  nextTick(() => {
    if (paginationDom.value) {
      const totalTextDom = paginationDom.value.$el.querySelector('.ant-pagination-total-text')
      totalTextDom.title = '设置全部已读'
      totalTextDom.onclick = () => {
        dialog.confirm({
          title: '确认设置全部已读？',
          onOk: () => {
            console.log('ok')
          }
        })
      }
    }
  })
}

function doQuery() {
  pagination.value.current = 1
}

onMounted(() => {
  umstypes.load().then((opts: any) => {
    opts.splice(0, 0, { value: '-1', label: '全部' })
    umstypeList.value = opts
  })
})
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
    width: 340px;
    height: calc(100vh - 50px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    .icon {
      font-size: 14px;
    }
    .search {
      width: auto;
    }

    .unione-form-select {
      min-width: 60px;
      :deep(.ant-select-selector) {
        border: none;
        transition: none;
      }
      :deep(.ant-select-selector:hover) {
        border-color: unset;
        box-shadow: none;
      }
    }

    :deep(.ant-pagination) {
      text-align: center;
      position: absolute;
      width: calc(100% - 15px);
      bottom: 5px;

      .ant-pagination-total-text {
        margin-inline-end: 0;
        cursor: pointer;
      }
      .ant-pagination-item {
        min-width: 20px;
        height: 20px;
        margin: 0;
        line-height: 20px;
      }
    }
  }
}
</style>
