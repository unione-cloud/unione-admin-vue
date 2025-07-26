<template>
  <a-badge :count="pagination.total" size="small" class="unione-notice">
    <slot name="bell">
      <bell-outlined class="bell" @click="toggle" />
    </slot>
    <draggable-resizable-vue :resizable="false" :z="100">
      <a-card class="notice-panel" v-if="visible" size="small" :bodyStyle="{ padding: 0 }">
        <template #title>
          <bell-outlined class="icon" />
          <unione-select-box :options="umstypeList" size="small" value="-1"></unione-select-box>
          <a-input-search class="search" v-model:value="keywords" placeholder="请输入搜索内容" size="small" @search="doQuery"
            allowClear />
        </template>
        <template #extra>
          <close-outlined @click="toggle" class="icon" />
        </template>
        <a-empty v-if="!messageList || messageList.length == 0">暂无消息</a-empty>

        <a-list class="notice-list" item-layout="horizontal" :data-source="messageList">
          <template #renderItem="{ item, index }">
            <a-list-item>
              <a-list-item-meta>
                <template #title>
                  <div class="msg-index">{{ index + 1 }}、</div>
                  <a href="javascript:;" class="msg-title">{{ item.title }}</a>
                  <span class="msg-time">{{ item.created }}</span>
                </template>
                <template #description>
                  <div class="msg-category">{{ umstypeMap[item.types]?.label }}/{{ umsCategory[item.categoryId]?.title
                  }}
                  </div>
                  <div class="msg-isConfirm" v-if="item.isConfirm == 1">
                    <a-switch v-if="item.confirmType == 1" v-model:checked="item.confirmStatus" :checkedValue="1"
                      checked-children="已确认" un-checked-children="待确认" />
                    <template v-else>
                      <a-switch v-model:checked="item.confirmResult" :checkedValue="1" checked-children="接收"
                        un-checked-children="接收" />
                      <a-switch v-model:checked="item.confirmResult" :checkedValue="2" checked-children="拒绝"
                        un-checked-children="拒绝" />
                    </template>
                  </div>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>

        <a-pagination ref="paginationDom" size="small" showLessItems :showSizeChanger="false"
          v-model:current="pagination.current" v-model:page-size="pagination.pageSize" :total="pagination.total"
          :show-total="pagination.showtotal" />
      </a-card>
    </draggable-resizable-vue>
  </a-badge>
</template>

<script lang="ts" setup>
import { onMounted, ref, nextTick } from 'vue'
import { Convertor } from 'unione-form-vue'
import { useDialog, useSession } from 'unione-base-vue'
import { axios } from 'unione-base-vue'
import DraggableResizableVue from 'draggable-resizable-vue3'
defineOptions({
  name: 'NoticeIcon'
})

const session = useSession()
const dialog = useDialog()
const umsCategory = ref<any>({})
const umstypes = new Convertor({ types: 'dict', dictName: 'UMSTYPES' })
const umstypeList = ref([])
const umstypeMap = ref<any>({})
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
  axios.admin({
    url: '/api/ums/message/mine',
    method: 'post',
    data: {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      keywords: keywords.value,
      body: {
        viewSts: 0
      }
    }
  }).then((res: any) => {
    messageList.value = res.body
    pagination.value.total = res.total
  })
}

function loadUmsCategory() {
  const category = session.getStorage('unione_ums_category')
  if (category) {
    umsCategory.value = JSON.parse(category)
  } else {
    axios.admin({
      url: '/api/ums/category/find',
      method: 'post',
      data: {
        page: 1,
        pageSize: 1000,
        body: {}
      }
    }).then((res: any) => {
      umsCategory.value = {}
      res.body.forEach((item: any) => {
        umsCategory.value[item.id] = item
      })
      session.setStorage('unione_ums_category', JSON.stringify(umsCategory.value))
    })
  }
}

onMounted(() => {
  umstypes.load().then((opts: any) => {
    opts.splice(0, 0, { value: '-1', label: '全部' })
    umstypeList.value = opts
    umstypeMap.value = {}
    opts.forEach((o: any) => {
      umstypeMap.value[o.value] = o
    })
  })

  loadUmsCategory()
  doQuery()
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
    box-shadow: 0 2px 8px #6c6c6c;

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

    .notice-list {
      .msg-index {
        float: left;
        margin-left: -20px;
      }

      .msg-time {
        float: right;
      }

      :deep(.ant-list-item) {
        border-bottom: 1px dashed #e9e9e9;
        cursor: pointer;
      }

      :deep(.ant-list-item:hover) {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .msg-category {
        display: inline-block;
      }

      .msg-isConfirm {
        display: inline-block;
        float: right;
      }
    }
  }
}
</style>
