<template>
  <draggable-resizable-vue
    :resizable="false"
    :z="100"
    v-if="visible"
    class="unione-notice-view"
    v-model:x="location.x"
    v-model:y="location.y"
  >
    <a-card class="notice-panel" size="small">
      <template #title>
        <bell-outlined class="icon" />
        <span>查看</span>
      </template>
      <template #extra>
        <close-outlined @click="close" class="icon" />
      </template>

      <div class="notice-content">
        <div class="title">
          <span>{{ notice.title || '--' }}</span>
        </div>
        <div class="info">
          <span class="type">
            <UnorderedListOutlined />{{ umstypeMap[notice.types]?.label }}/{{
              umsCategory[notice.categoryId]?.title
            }}
          </span>
          <span class="username" v-if="notice.userName">
            <UserOutlined />{{ notice.userName }}
          </span>
          <span class="time"> <FieldTimeOutlined />{{ notice.created }} </span>
        </div>

        <unione-rich-text
          :value="notice.bodyText"
          model="view"
          :options="{ margins: [0, 0, 0, 0] }"
        ></unione-rich-text>

        <div class="notice-actions">
          <span v-if="notice.isConfirm" class="confirm-tips">当前消息需要确认</span>
          <a-tag
            v-if="notice.confirmType == 1"
            :checked="notice.confirmStatus == 1"
            @click="onConfirmChange(notice)"
            :color="notice.confirmStatus == 1 ? 'success' : ''"
            >{{ notice.confirmStatus == 1 ? '已确认' : '待确认' }}
          </a-tag>
          <template v-else>
            <a-tag
              :checked="notice.confirmResult == 1"
              @click="onConfirmResult(notice, 'accept')"
              :color="notice.confirmResult == 1 ? 'success' : ''"
            >
              接受
            </a-tag>
            <a-tag
              :checked="notice.confirmResult == 2"
              @click="onConfirmResult(notice, 'reject')"
              :color="notice.confirmResult == 2 ? 'error' : ''"
            >
              拒绝
            </a-tag>
          </template>
          <a-button @click="close">关闭</a-button>
        </div>
      </div>
    </a-card>
  </draggable-resizable-vue>
</template>

<script lang="ts" setup>
import { onMounted, ref, nextTick } from 'vue'
import { Convertor } from 'unione-form-vue'
import { useDialog, useSession } from 'unione-base-vue'
import { axios } from 'unione-base-vue'
import DraggableResizableVue from 'draggable-resizable-vue3'

const session = useSession()
const dialog = useDialog()
const umsCategory = ref<any>({})
const umstypes = new Convertor({ types: 'dict', dictName: 'UMSTYPES' })
const umstypeMap = ref<any>({})
const visible = ref(false)
const notice = ref<any>({})
const location = ref({
  x: 0,
  y: 0
})

function close() {
  visible.value = !visible.value
}
function open(id: any) {
  visible.value = true
  location.value.x = window.innerWidth * 0.8
  location.value.y = 0
  loadDetail(id)
}

function loadDetail(id: any) {
  if (typeof id === 'object') {
    notice.value = id
    if (notice.value.bodyText && typeof notice.value.bodyText === 'string') {
      notice.value.bodyText = JSON.parse(notice.value.bodyText)
    }
  } else {
    axios
      .admin({
        url: '/api/ums/message/viwe',
        method: 'post',
        data: {
          id
        }
      })
      .then((res: any) => {
        if (res.success) {
          notice.value = res.body
          if (notice.value.bodyText) {
            notice.value.bodyText = JSON.parse(notice.value.bodyText)
          }
        } else {
          dialog.error(res.message)
        }
      })
  }
}

function onConfirmChange(status: any) {
  console.log('onConfirmChange', status)
  axios
    .admin({
      url: '/api/ums/message/confirm',
      method: 'post',
      data: {
        id: notice.value.mineId,
        messageId: notice.value.id,
        confirmStatus: status ? 1 : 0
      }
    })
    .then((res: any) => {
      if (!res.success) {
        notice.value.confirmStatus = !status
        dialog.error(res.message)
      }
    })
}
function onConfirmResult(notice: any, type: string) {
  if (type == 'accept') {
    notice.confirmResult = 1
  } else {
    notice.confirmResult = 2
  }
  notice.confirmStatus = true
  axios
    .admin({
      url: '/api/ums/message/confirm',
      method: 'post',
      data: {
        id: notice.mineId,
        messageId: notice.id,
        confirmStatus: notice.confirmStatus ? 1 : 0,
        confirmResult: notice.confirmResult
      }
    })
    .then((res: any) => {
      if (!res.success) {
        notice.confirmStatus = !notice.confirmStatus
        notice.confirmResult = 0
        dialog.error(res.message)
      }
    })
}

function loadUmsCategory() {
  const category = session.getStorage('unione_ums_category')
  if (category) {
    umsCategory.value = JSON.parse(category)
  } else {
    axios
      .admin({
        url: '/api/ums/category/find',
        method: 'post',
        data: {
          page: 1,
          pageSize: 1000,
          body: {}
        }
      })
      .then((res: any) => {
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
    umstypeMap.value = {}
    opts.forEach((o: any) => {
      umstypeMap.value[o.value] = o
    })
  })
  loadUmsCategory()
})

defineExpose({
  open,
  close
})
</script>

<style lang="less" scoped>
.unione-notice-view {
  :deep(.drv) {
    border: none;
  }

  .notice-panel {
    position: fixed;
    top: 0;
    right: 5px;
    width: 40vw;
    height: calc(100vh - 50px);
    box-shadow: 0 2px 8px #6c6c6c;

    .icon {
      font-size: 14px;
      margin-right: 5px;
    }

    .notice-content {
      .title {
        font-size: 25px;
        font-weight: bold;
        text-align: center;
        padding: 10px;
      }

      .info {
        text-align: center;
        padding-bottom: 5px;
        color: #9f9f9f;

        .type {
          margin: 0 15px;
        }

        .username {
          margin: 0 15px;
        }

        .time {
          margin: 0 15px;
        }

        :deep(.anticon) {
          margin-right: 5px;
        }
      }
    }

    :deep(.unione-rich-text) {
      border: none;
    }

    .notice-actions {
      position: absolute;
      height: 45px;
      width: 100%;
      line-height: 45px;
      text-align: right;
      bottom: 0;
      right: 0;
      padding-right: 25px;
      border-top: 1px solid #e5e5e5;

      :deep(.ant-tag) {
        cursor: pointer;
      }

      .confirm-tips {
        color: #6c6c6c;
        margin-right: 10px;
      }
    }
  }
}
</style>
