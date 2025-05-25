<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-apps">
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
import { useDialog } from 'unione-base-vue'
import { Convertor } from 'unione-form-vue'
import { useRouter, type Router } from 'vue-router'

const dialog = useDialog()
const stsConvert = new Convertor({ types: 'dict', dictName: 'APPSTATUS' })
const router: Router = useRouter()

const page = ref()
const define = ref({
  storage: {
    controller: '/api/system/appInfo'
  },
  fields: [
    {
      title: '应用名称',
      name: 'name',
      isQuery: true
    },
    {
      title: '应用编码',
      name: 'sn',
      isQuery: true
    },
    {
      title: '应用类型',
      name: 'types',
      convert: {
        types: 'dict',
        dictName: 'APPTYPES'
      },
      isQuery: true
    },
    {
      title: '微应用',
      name: 'isMp',
      convert: {
        types: 'dict',
        dictName: 'TUREORFALSE'
      },
      isQuery: true
    },
    {
      title: '应用URL',
      name: 'url'
    },
    {
      title: '首页URL',
      name: 'welcome'
    },
    {
      title: '版本号',
      name: 'versNo'
    },
    {
      title: '版本说明',
      name: 'versDesc'
    },
    {
      title: '字体图标',
      name: 'icon'
    },
    {
      title: '平台应用',
      name: 'isPlatform',
      convert: {
        types: 'dict',
        dictName: 'TUREORFALSE'
      },
      isQuery: true
    },
    {
      title: '状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'APPSTATUS'
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
    width: 200,
    btns: [
      {
        name: 'view',
        visible: false
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
      {
        name: 'api',
        title: '接口管理'
      },
      {
        name: 'res',
        title: '资源管理'
      }
    ],
    count: 2,
    more: {
      layout: 'vertical'
    }
  }
})

async function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'add') {
    drawer.value.visible = true
    drawer.value.title = '新增应用'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑应用'
    drawer.value.placement = 'right'
    drawer.value.row = row
    nextTick(() => {
      form.value.setValue(row)
    })
  }
  if (btn.name == 'api') {
    router.push({ path: '/system/base/apps/api', query: { appId: row.id } })
  }
  if (btn.name == 'res') {
    router.push({ path: '/system/base/apps/res', query: { appId: row.id } })
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
  title: '新增应用',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
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
        }
      },
      {
        title: '应用URL',
        name: 'url',
        required: true
      },
      {
        title: '首页URL',
        name: 'welcome'
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
        value: 1,
        control: 'a-input-number',
        required: true
      },
      {
        title: '版本说明',
        name: 'versDesc',
        control: 'a-textarea'
      },
      {
        title: '字体图标',
        name: 'icon'
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
