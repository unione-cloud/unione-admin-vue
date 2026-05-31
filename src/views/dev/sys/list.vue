<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-sys">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer :title="drawer.title" :width="750" v-model:visible="drawer.visible" :placement="drawer.placement"
      class="system-sys-drawer-form" :mask-closable="false">
      <unione-form class="drawer-form" :form="drawer.form" ref="form"></unione-form>

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
import { useDialog } from 'unione-base-vue'
import { Convertor } from 'unione-form-vue'
import { useRouter, type Router } from 'vue-router'

const dialog = useDialog()
const stsConvert = new Convertor({ types: 'dict', dictName: 'APPSTATUS' })
const router: Router = useRouter()

const page = ref()
const define = ref({
  storage: {
    controller: '/api/system/sys'
  },
  fields: [
    {
      title: '系统名称',
      name: 'name',
    },
    {
      title: '系统简称',
      name: 'alias',
    },
    {
      title: '全局',
      name: 'isGlobal',
      convert: {
        types: 'dict',
        dictName: 'TUREORFALSE'
      }
    },
    {
      title: '类型',
      name: 'types',
      convert: {
        types: 'dict',
        dictName: 'APPTYPES'
      },
      isQuery: true
    },
    {
      title: '系统ctx',
      name: 'ctx',
    },
    {
      title: '版本号',
      name: 'versNo',
    },
    {
      title: '系统主题',
      name: 'themeName',
    },
    {
      title: '显示顺序',
      name: 'ordered',
      sort: {
        enable: true,
        defoult: true,
        asc: true
      }
    },
    {
      title: '状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'SYSSTATUS'
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
    width: 280,
    btns: [
      {
        name: 'view',
        title: '预览',
      },
      {
        name: 'design',
        title: '设计',
      },
      {
        name: 'status',
        title: '状态',
        widget: 'dropdown',
        items: [
          {
            name: 'sts-2',
            title: '内测',
            disabled: ({ row }: any) => {
              console.log('=====内测====', row)
              return row.status == 2
            }
          },
          {
            name: 'sts-3',
            title: '发布',
            disabled: ({ row }: any) => {
              return row.status == 3
            }
          },
          {
            name: 'sts-4',
            title: '撤销',
            disabled: ({ row }: any) => {
              return row.status == 4
            }
          }
        ]
      },
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
    drawer.value.title = '新增系统'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑系统'
    drawer.value.placement = 'right'
    drawer.value.row = row
    nextTick(() => {
      form.value.setValue(row)
    })
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
  title: '新增系统',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '系统名称',
        name: 'name',
        required: true
      },
      {
        title: '系统简称',
        name: 'alias',
      },
      {
        title: '系统类型',
        name: 'types',
        control: 'unione-select-box',
        value: 'pc',
        convert: {
          types: 'dict',
          dictName: 'APPTYPES'
        },
      },
      {
        title: '系统ctx',
        name: 'ctx',
        required: true
      },
      {
        title: '系统logo大',
        name: 'logoLarge',
        control: 'unione-upload-box',
        props: {
          accept: 'image/*',
          listType: 'picture-card',
          limit: 1,
          valueType: 'string',
          bucket: 'system'
        }
      },
      {
        title: '系统logo小',
        name: 'logoSmall',
        control: 'unione-upload-box',
        props: {
          accept: 'image/*',
          listType: 'picture-card',
          limit: 1,
          valueType: 'string',
          bucket: 'system'
        }
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
        title: '系统配置',
        name: 'configs',
        control: 'unione-code-editor',
        props: {
          lang: 'json'
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
.system-sys-drawer-form {

  .btns {
    text-align: center;

    :deep(.ant-btn) {
      margin: 5px 10px;
    }
  }

  .drawer-form {
    :deep(.unione-code-editor) {
      max-height: 400px;
      overflow-y: auto;
    }
  }

}
</style>
