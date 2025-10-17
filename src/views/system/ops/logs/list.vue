<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-logger">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer :title="drawer.title" :width="650" v-model:visible="drawer.visible" :placement="drawer.placement"
      class="drawer-form">
      <unione-form :form="drawer.form" ref="form" class="logger-form"></unione-form>

      <template #footer>
        <div class="btns">
          <a-button @click="drawer.visible = false">关闭</a-button>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

const page = ref()
const define = ref({
  storage: {
    controller: '/api/common/logs'
  },
  fields: [
    {
      title: '应用编码',
      name: 'appSn',
      isQuery: true
    },
    {
      title: '操作类别',
      name: 'types',
      convert: {
        types: 'dict',
        dictName: 'LOGTYPE'
      },
      isQuery: true,
      sort: {
        enable: true,
        multiple: 2
      }
    },
    {
      title: '操作状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'LOGSTATUS'
      },
      isQuery: true,
      sort: {
        enable: true,
        multiple: 2
      }
    },
    {
      title: '操作标题',
      name: 'title',
      isQuery: true
    },
    {
      title: 'IP地址',
      name: 'ip',
      isQuery: true,
      sort: {
        enable: true
      }
    },
    {
      title: '用户账号',
      name: 'userName',
      isQuery: true
    },
    {
      title: '用户机构',
      name: 'orgName'
    },
    {
      title: '租户名称',
      name: 'tenantName'
    },
    {
      title: '开始时间',
      name: 'startTime',
      sort: {
        enable: true,
        defoult: true,
        asc: false,
        multiple: 3
      }
    },
    {
      title: '结束时间',
      name: 'endTime'
    },
    {
      title: '操作ID',
      name: 'actionId',
      isQuery: true,
      sort: {
        enable: true,
        multiple: 1
      }
    },
    {
      title: '请求ID',
      name: 'requestId'
    }
  ],
  leftBtns: false,
  rightBtns: ['downTmpl', 'impData'],
  operation: {
    title: '操作',
    width: 80,
    btns: [
      {
        name: 'edit',
        visible: false
      },
      {
        name: 'delete',
        visible: false
      }
    ],
    count: 2,
    more: {
      layout: 'vertical'
    }
  }
})

function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'view') {
    drawer.value.visible = true
    drawer.value.title = '查看日志'
    drawer.value.placement = 'right'
    drawer.value.row = { ...row }
    if (drawer.value.row.contents) {
      drawer.value.row.contents = drawer.value.row.contents.replace(/\n/g, '<br>')
    }
    nextTick(() => {
      form.value.setValue(drawer.value.row)
    })
  }
}

const form = ref() //form ref obj
const drawer = ref<any>({
  title: '查看日志',
  placement: 'right',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '应用编码',
        name: 'appSn'
      },
      {
        title: '操作类别',
        name: 'types',
        convert: {
          types: 'dict',
          dictName: 'LOGTYPE'
        }
      },
      {
        title: '操作状态',
        name: 'status',
        convert: {
          types: 'dict',
          dictName: 'LOGSTATUS'
        }
      },
      {
        title: '操作标题',
        name: 'title',
        isQuery: true
      },
      {
        title: '操作ID',
        name: 'actionId'
      },
      {
        title: '请求ID',
        name: 'requestId'
      },
      {
        title: 'IP地址',
        name: 'ip'
      },
      {
        title: '用户账号',
        name: 'userName'
      },
      {
        title: '用户机构',
        name: 'orgName'
      },
      {
        title: '租户名称',
        name: 'tenantName'
      },
      {
        title: '开始时间',
        name: 'startTime'
      },
      {
        title: '结束时间',
        name: 'endTime'
      },
      {
        title: '日志内容',
        name: 'contents',
        control: 'a-textarea',
        view: 'html'
      },
      {
        title: '异常信息',
        name: 'errorMessage',
        control: 'a-textarea'
      }
    ],
    model: 'view',
    setting: {
      showColumn: 1,
      labelWidth: 3
    }
  }
})
</script>

<style scoped lang="less">
.drawer-form {
  .btns {
    text-align: center;

    :deep(.ant-btn) {
      margin: 5px 10px;
    }
  }

  .logger-form {
    :deep(.form-item-contents) {
      .ant-form-row {
        display: inline-block;

        .ant-form-item-control {
          display: inline;

          .text-view {
            padding: 5px;
            background-color: #f4f4f4;
          }
        }
      }
    }

    :deep(.form-item-errorMessage, ) {
      .ant-form-row {
        display: inline-block;

        .text-view {
          padding: 5px;
          overflow: scroll;
          background-color: #f4f4f4;
          width: 575px;
        }
      }
    }
  }
}
</style>
