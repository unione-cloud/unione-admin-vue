<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-flow-tmpl">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer :title="drawer.title" :width="750" v-model:visible="drawer.visible" :placement="drawer.placement"
      class="drawer-form" :mask-closable="false">
      <unione-form :form="drawer.form" ref="form"></unione-form>

      <template #footer>
        <div class="btns">
          <a-button type="primary" @click="drawer.tosave">保存</a-button>
          <a-button @click="drawer.visible = false">取消</a-button>
        </div>
      </template>
    </a-drawer>
    <Editor ref="editor"></Editor>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useDialog } from 'unione-base-vue'
import { Convertor } from 'unione-form-vue'
import { useRouter, type Router } from 'vue-router'
import Editor from './editor.vue'

const dialog = useDialog()
const stsConvert = new Convertor({ types: 'dict', dictName: 'FLOWLITEPUBLISHSTS' })
const router: Router = useRouter()

const page = ref()
const editor = ref()
const define = ref({
  storage: {
    ctx: 'flow',
    controller: '/api/tmpl'
  },
  fields: [
    {
      title: '应用名称',
      name: 'appName',
      isQuery: true
    },
    {
      title: '流程标题',
      name: 'title',
      isQuery: true
    },
    {
      title: '流程编码',
      name: 'sn',
      isQuery: true
    },
    {
      title: '流程版本',
      name: 'vers'
    },
    {
      title: '流程分类',
      name: 'category',
      convert: {
        types: 'dict',
        dictName: 'FLOWLITECATEGORY'
      },
      isQuery: true
    },
    {
      title: '流程状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'FLOWLITEPUBLISHSTS'
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
    width: 260,
    btns: [
      'view',
      {
        name: 'status',
        title: '状态',
        widget: 'dropdown',
        items: [
          {
            name: 'sts-2',
            title: '发布',
            disabled: ({ row }: any) => {
              return row.status == 2
            }
          },
          {
            name: 'sts-3',
            title: '下架',
            disabled: ({ row }: any) => {
              return row.status != 2
            }
          },
        ]
      },
      {
        name: 'vers',
        title: '版本管理'
      },
    ],
    count: 3,
    more: {
      layout: 'vertical'
    }
  }
})

async function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'add') {
    editor.value.open()
  }
  if (btn.name == 'edit') {
    editor.value.open(row)
  }
  if (btn.name == 'vers') {
    //
  }
  if (btn.name.startsWith('sts-')) {
    const status = btn.name.split('-')[1]
    const stsLable = await stsConvert.convert(status)
    dialog.confirm({
      content: '确定要设置应用状态为：' + stsLable,
      onOk: () => {
        page.value
          .storage()
          .request({
            url: '/status',
            data: { id: row.id, status }
          })
          .then(() => {
            page.value.reload()
          })
      }
    })
  }
}

const form = ref() //form ref obj
const drawer = ref({
  title: '流程版本',
  placement: 'right',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '应用类别',
        name: 'category',
        control: 'unione-radio-box',
        value: 'app',
        convert: {
          types: 'dict',
          dictName: 'APPCATEGORY'
        },
      },
      {
        title: '应用名称',
        name: 'name',
        required: true
      },
      {
        title: '应用编码',
        name: 'sn',
        required: true
      },
      {
        title: '应用类型',
        name: 'types',
        control: 'unione-select-box',
        convert: {
          types: 'dict',
          dictName: 'APPTYPES'
        },
        event: {
          visible: (value: any, ctx: any) => {
            return ctx.category == 'app'
          }
        }
      },
      {
        title: '微应用',
        name: 'isMp',
        control: 'unione-select-box',
        value: '0',
        convert: {
          types: 'dict',
          dictName: 'TUREORFALSE'
        },
        event: {
          visible: (value: any, ctx: any) => {
            return ctx.category == 'app'
          }
        }
      },
      {
        title: '应用URL',
        name: 'url',
        event: {
          visible: (value: any, ctx: any) => {
            return ctx.category == 'app'
          }
        }
      },
      {
        title: '首页URL',
        name: 'welcome',
        event: {
          visible: (value: any, ctx: any) => {
            return ctx.category == 'app'
          }
        }
      },
      {
        title: '显示顺序',
        name: 'ordered',
        value: 0,
        control: 'a-input-number',
        required: true
      },
      {
        title: '版本号',
        name: 'versNo',
        value: '0.0.1',
        required: true
      },
      {
        title: '版本说明',
        name: 'versDesc',
        control: 'unione-rich-text',
        value: '{}'
      },
      {
        title: '字体图标',
        name: 'icon',
        control: 'unione-icon-select'
      },
      {
        title: '图片图标(小)',
        name: 'picMix'
      },
      {
        title: '图片图标(中)',
        name: 'picMid'
      },
      {
        title: '图片图标(大)',
        name: 'picMax'
      },
      {
        title: '模版应用',
        name: 'isTmpl',
        control: 'unione-switch-box',
        value: 0,
        convert: {
          types: 'dict',
          dictName: 'TUREORFALSE'
        },
        event: {
          visible: (value: any, ctx: any) => {
            return ctx.category == 'app'
          }
        }
      },
      {
        title: '平台应用',
        name: 'isPlatform',
        control: 'unione-switch-box',
        value: 0,
        convert: {
          types: 'dict',
          dictName: 'TUREORFALSE'
        },
        event: {
          visible: (value: any, ctx: any) => {
            return ctx.category == 'app'
          }
        }
      },
      {
        title: '应用状态',
        name: 'status',
        control: 'unione-select-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'APPSTATUS'
        }
      },
      {
        title: '备注',
        control: 'a-textarea',
        name: 'descs'
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
