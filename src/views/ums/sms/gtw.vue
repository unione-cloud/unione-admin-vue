<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-sms-gtw">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer :title="drawer.title" :width="800" v-model:visible="drawer.visible" :placement="drawer.placement"
      class="drawer-form" :mask-closable="false">
      <unione-form :form="drawer.form" ref="form"></unione-form>
      <template #footer>
        <div class="btns">
          <a-button type="primary" @click="drawer.tosave">保存</a-button>
          <a-button @click="drawer.visible = false">取消</a-button>
        </div>
      </template>
    </a-drawer>
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
    controller: '/api/ums/smsGtw'
  },
  fields: [
    {
      title: '标题',
      name: 'title',
      isQuery: true
    },
    {
      title: '编码',
      name: 'sn',
      isQuery: true
    },
    {
      title: 'IP',
      name: 'ip',
    },
    {
      title: '端口',
      name: 'ports',
    },
    {
      title: '地址',
      name: 'url',
    },
    {
      title: '状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'USEORNOT'
      },
      isQuery: true
    },
    {
      title: '创建时间',
      name: 'created'
    },
    {
      title: '修改时间',
      name: 'lastUpdated'
    }
  ],
  operation: {
    title: '操作',
    width: 175,
    btns: [
      {
        name: 'view',
        visible: false
      },
      {
        name: 'status',
        title: '启用',
        event: {
          title: (ctx: any) => {
            if (ctx.row?.status == 1) {
              return '停用'
            }
            return '启用'
          }
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
  console.log('table btn click', btn, event, row)
  if (btn.name == 'add') {
    drawer.value.visible = true
    drawer.value.title = '新增网关'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑网关'
    drawer.value.placement = 'right'
    drawer.value.row = { ...row }
    nextTick(() => {
      form.value.setValue(drawer.value.row)
    })
  }
  if (btn.name == 'status') {
    setStatus(row.id, row.status == 1 ? 0 : 1)
  }
}
function setStatus(id: string, status: number) {
  dialog.confirm({
    content: '确定要' + (status == 1 ? '启用' : '停用') + '该网关么?',
    onOk: () => {
      axios.admin
        .request({
          url: '/api/ums/smsGtw/status',
          method: 'post',
          data: { id, status }
        }, {
          useMessage: true
        })
        .then((res: any) => {
          page.value.reload()
        })
    }
  })
}

const form = ref() //form ref obj
const drawer = ref<any>({
  title: '新增网关',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '编码',
        name: 'sn',
        control: 'unione-random-input',
        required: true,
        event: {
          visible: (value: any, formValue: any) => {
            return !formValue.id
          }
        }
      },
      {
        title: '标题',
        name: 'title',
        required: true
      },
      {
        title: 'IP',
        name: 'ip',
        required: true
      },
      {
        title: '端口',
        name: 'ports',
        control: 'a-input-number',
        required: true
      },
      {
        title: 'URL',
        name: 'url',
        required: true
      },
      {
        title: '显示顺序',
        name: 'ordered',
        control: 'a-input-number',
        value: 1
      },
      {
        title: '状态',
        name: 'status',
        control: 'unione-switch-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'USEORNOT'
        }
      },
      {
        title: '备注信息',
        name: 'descs',
        control: 'a-textarea'
      },
      {
        widget: 'unione-tabs',
        widgets: [
          {
            title: '认证设置',
            widgets: [{
              title: '认证接口',
              name: 'authApi',
              props: {
                tooltip: '/开头,例如:/auth'
              },
            }, {
              title: '认证信息',
              name: 'authInfo',
              control: 'unione-code-editor',
              props: {
                language: 'json'
              },
            },
            {
              title: '认证脚本',
              name: 'authScript',
              control: 'unione-code-editor',
              props: {
                language: 'javascript',
                help: '常用工具包： var DateUtil=Java.type("cn.hutool.core.date.DateUtil");' +
                  'var MD5=Java.type("cn.hutool.crypto.digest.MD5");' +
                  'var HttpUtil = Java.type("cn.hutool.http.HttpUtil");' +
                  'var JsonUtil = Java.type("com.unione.cloud.core.util.JsonUtil");' +
                  'var Map = Java.type("java.util.Map");'
              },
            },]
          },
          {
            title: '发送设置',
            widgets: [{
              title: '发送接口',
              name: 'sendApi',
              props: {
                tooltip: '/开头,例如:/send'
              },
            },
            {
              title: '发送脚本',
              name: 'sendScript',
              control: 'unione-code-editor',
              props: {
                language: 'javascript',
                help: '常用工具包： var DateUtil=Java.type("cn.hutool.core.date.DateUtil");' +
                  'var MD5=Java.type("cn.hutool.crypto.digest.MD5");' +
                  'var HttpUtil = Java.type("cn.hutool.http.HttpUtil");' +
                  'var JsonUtil = Java.type("com.unione.cloud.core.util.JsonUtil");' +
                  'var Map = Java.type("java.util.Map");'
              },
            },]
          },
          {
            title: '收信设置',
            widgets: [{
              title: '收信接口',
              name: 'receiveApi',
              props: {
                tooltip: '/开头,例如:/receive'
              },
            },
            {
              title: '收信脚本',
              name: 'receiveScript',
              control: 'unione-code-editor',
              props: {
                language: 'javascript',
                help: '常用工具包： var DateUtil=Java.type("cn.hutool.core.date.DateUtil");' +
                  'var MD5=Java.type("cn.hutool.crypto.digest.MD5");' +
                  'var HttpUtil = Java.type("cn.hutool.http.HttpUtil");' +
                  'var JsonUtil = Java.type("com.unione.cloud.core.util.JsonUtil");' +
                  'var Map = Java.type("java.util.Map");'
              },
            },
            {
              title: '收信cron',
              name: 'receiveCron',
            },]
          },
          {
            title: '回执设置',
            widgets: [{
              title: '回执接口',
              name: 'receiptApi',
              props: {
                tooltip: '/开头,例如:/receipt'
              },
            },
            {
              title: '回执脚本',
              name: 'receiptScript',
              control: 'unione-code-editor',
              props: {
                language: 'javascript',
                help: '常用工具包： var DateUtil=Java.type("cn.hutool.core.date.DateUtil");' +
                  'var MD5=Java.type("cn.hutool.crypto.digest.MD5");' +
                  'var HttpUtil = Java.type("cn.hutool.http.HttpUtil");' +
                  'var JsonUtil = Java.type("com.unione.cloud.core.util.JsonUtil");' +
                  'var Map = Java.type("java.util.Map");'
              },
            },
            {
              title: '回执cron',
              name: 'receiptCron',
            },]
          },
        ]
      },
    ],
    setting: {
      showColumn: 1,
      labelWidth: 3
    }
  },
  tosave: () => {
    form.value.validate().then((data: any) => {
      data = {
        ...drawer.value.row,
        ...data
      }
      page.value
        .storage()
        .save({ data })
        .then(() => {
          drawer.value.visible = false
          page.value.reload()
        })
    })
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
}
</style>
