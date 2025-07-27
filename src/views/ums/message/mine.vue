<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-ums-message-mine">
    <unione-notice-view ref="noticeView"></unione-notice-view>
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { axios, useDialog } from 'unione-base-vue'
import { Convertor } from 'unione-form-vue'

const dialog = useDialog()

const page = ref()
const define = ref({
  storage: {
    controller: '/api/ums/message',
    findUrl: '/mine'
  },
  fields: [
    {
      title: '分类',
      name: 'categoryName'
    },
    {
      title: '类别',
      name: 'types',
      convert: {
        types: 'dict',
        dictName: 'UMSTYPES'
      },
      isQuery: true
    },
    {
      title: '标题',
      name: 'title',
      isQuery: true
    },
    {
      title: '优先级',
      name: 'priority',
      convert: {
        types: 'dict',
        dictName: 'UMSMSGPRIORITY'
      },
      isQuery: true
    },
    {
      title: '来源',
      name: 'fromId',
      convert: {
        types: 'dict',
        dictName: 'UMSMSGFROM'
      },
      isQuery: true
    },
    {
      title: '发送时间',
      name: 'created'
    },
    {
      title: '查阅状态',
      name: 'viewSts',
      convert: {
        types: 'dict',
        dictName: 'TUREORFALSE'
      },
      isQuery: true
    },
    {
      title: '确认状态',
      name: 'confirmStatus',
      convert: {
        types: 'option',
        options: [
          {
            label: '已确认',
            value: '1'
          },
          {
            label: '未确认',
            value: '0'
          }
        ]
      },
      isQuery: true
    },
    {
      title: '确认结果',
      name: 'confirmResult',
      convert: {
        types: 'option',
        options: [
          {
            label: '接受',
            value: '1'
          },
          {
            label: '拒绝',
            value: '2'
          }
        ]
      },
      isQuery: true
    }
  ],
  leftBtns: [
    'add',
    'delBatch',
    {
      name: 'removeBatch',
      title: '批量删除',
      icon: 'DeleteOutlined',
      props: {
        danger: true
      }
    }
  ],
  rightBtns: ['impData', 'expData', 'downTmpl', {
    title: '全部设置已读',
    name: 'clear',
    icon: 'EyeOutlined',
    props: {
      danger: true
    }
  }],
  operation: {
    title: '操作',
    width: 125,
    btns: [
      'edit',
      'delete',
      {
        name: 'remove',
        title: '删除',
        props: {
          danger: true
        }
      }
    ],
    count: 4,
    more: {
      layout: 'vertical'
    }
  }
})

const noticeView = ref()
async function btnClick({ btn, event, row, keys }: any) {
  if (btn.name == 'view') {
    noticeView.value.open(row.id)
  }
  if (btn.name == 'remove' || btn.name == 'removeBatch') {
    if (btn.name == 'removeBatch' && (!keys || !keys.length)) {
      dialog.info('请选择要删除的记录')
      return;
    }
    if (!keys || !keys.length) {
      keys = [row.id]
    }

    // 确认删除
    dialog.confirm({
      title: '确认信息',
      content: '请确认是否要删除该记录?',
      onOk: () => {
        axios.admin({
          url: '/api/ums/message/remove',
          method: 'post',
          data: keys
        }).then((res: any) => {
          if (res.success) {
            dialog.success('删除成功')
            page.value.reload()
          } else {
            dialog.error(res.message)
          }
        })
      }
    })
  }
  if (btn.name == 'clear') {
    dialog.confirm({
      title: '确认信息',
      content: '请确认是否要全部设置已读?',
      onOk: () => {
        axios.admin({
          url: '/api/ums/message/clear',
          method: 'post'
        }).then((res: any) => {
          if (res.success) {
            dialog.success('设置成功')
            page.value.reload()
          } else {
            dialog.error(res.message)
          }
        })
      }
    })
  }
}
</script>

<style scoped lang="less">
.unione-ums-message-mine {
  :deep(.unione-notice-view) {
    .notice-panel {
      height: calc(100vh - 95px);
    }
  }
}
</style>
