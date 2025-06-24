<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-ums-tmpl">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer
      :title="drawer.title"
      :width="550"
      v-model:visible="drawer.visible"
      :placement="drawer.placement"
      class="drawer-form"
    >
      <unione-form :form="drawer.form" ref="form"></unione-form>

      <div class="btns">
        <a-button type="primary" @click="drawer.tosave">保存</a-button>
        <a-button @click="drawer.visible = false">取消</a-button>
      </div>
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
    controller: '/api/ums/tmpl'
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
      title: '类别',
      name: 'types',
      convert: {
        types: 'dict',
        dictName: 'UMSTMPLTYPE'
      },
      isQuery: true
    },
    {
      title: '通知方式',
      name: 'ways'
    },
    {
      title: '使用级别',
      name: 'usel',
      convert: {
        types: 'dict',
        dictName: 'UMSTMPLUSEL'
      },
      isQuery: true
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
    drawer.value.title = '新增模版'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑模版'
    drawer.value.placement = 'right'
    drawer.value.row = row
    nextTick(() => {
      form.value.setValue(row)
    })
  }
  if (btn.name == 'status') {
    setStatus(row.id, row.status == 1 ? 0 : 1)
  }
}
function setStatus(id: string, status: number) {
  dialog.confirm({
    content: '确定要' + (status == 1 ? '启用' : '停用') + '该模版么?',
    onOk: () => {
      axios.admin
        .request({
          url: '/api/ums/tmpl/status',
          method: 'post',
          data: { id, status }
        })
        .then((res: any) => {
          page.value.reload()
        })
    }
  })
}

const form = ref() //form ref obj
const drawer = ref({
  title: '新增模版',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '标题',
        name: 'title',
        required: true
      },
      {
        title: '编码',
        name: 'sn',
        required: true
      },
      {
        title: '类型',
        name: 'types',
        control: 'unione-radio-box',
        value: 'normal',
        convert: {
          types: 'dict',
          dictName: 'UMSTMPLTYPE'
        }
      },
      {
        title: '使用级别',
        name: 'usel',
        control: 'unione-radio-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'UMSTMPLUSEL'
        }
      },
      {
        title: '通知方式',
        name: 'ways',
        control: 'unione-check-box',
        convert: {
          types: 'dict',
          dictName: 'UMSMESSAGEWAY'
        }
      },
      {
        title: 'html模版',
        name: 'bodyHtml',
        control: 'a-textarea'
      },
      {
        title: 'text模版',
        name: 'bodyText',
        control: 'a-textarea'
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
        title: '显示顺序',
        name: 'ordered',
        control: 'a-input-number',
        value: 1
      },
      {
        title: '备注信息',
        name: 'remark',
        control: 'a-textarea'
      }
    ],
    setting: {
      showColumn: 1,
      labelWidth: 5
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
