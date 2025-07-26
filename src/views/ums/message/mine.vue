<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-ums-message-mine">
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
      title: '接收时间',
      name: 'viewTime'
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
    },
  ],
  leftBtns: ['add', 'delBatch', {
    name: 'removeBatch',
    title: '批量删除',
    icon: 'DeleteOutlined',
    props: {
      danger: true
    }
  }],
  rightBtns: false,
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

async function btnClick({ btn, event, row, keys }: any) {
  if (btn.name == 'view') {
    //
  }
  if (btn.name == 'remove') {
    //
  }
}

</script>

<style scoped lang="less">
.drawer-form {
  .btns {
    text-align: center;

    :deep(.ant-btn) {
      margin: 5px 10px;
    }
  }
}
</style>
