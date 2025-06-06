<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-codetree">
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
    controller: '/api/system/codeTree'
  },
  fields: [
    {
      title: '应用名称',
      name: 'appName',
      isQuery: true
    },
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
      title: '类型',
      name: 'types',
      convert: {
        types: 'dict',
        dictName: 'CODETREETYPE'
      },
      isQuery: true
    },
    {
      title: '长度',
      name: 'lvLen'
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
            name: 'sts-1',
            title: '使用',
            disabled: ({ row }: any) => {
              return row.status == 1
            }
          },
          {
            name: 'sts-0',
            title: '停用',
            disabled: ({ row }: any) => {
              return row.status == 0
            }
          }
        ]
      },
      {
        name: 'lvsn',
        title: '层级编码'
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
    drawer.value.title = '新增层级树'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑层级树'
    drawer.value.placement = 'right'
    drawer.value.row = row
    nextTick(() => {
      form.value.setValue(row)
    })
  }
  if (btn.name == 'lvsn') {
    router.push({ path: '/system/base/ctree/lvsn', query: { treeId: row.id } })
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
  title: '新增',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '应用名称',
        name: 'appName',
        required: true
      },
      {
        title: '树标题',
        name: 'title',
        required: true
      },
      {
        title: '树编码',
        name: 'sn',
        required: true
      },
      {
        title: '类型',
        name: 'types',
        control: 'unione-select-box',
        value: '0',
        convert: {
          types: 'dict',
          dictName: 'CODETREETYPE'
        }
      },
      {
        title: '长度',
        name: 'lvLen',
        value: 3,
        control: 'a-input-number',
        required: true
      },
      {
        title: '状态',
        name: 'status',
        control: 'unione-select-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'USEORNOT'
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
