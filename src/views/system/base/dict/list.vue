<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-dict">
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

    <a-drawer
      title="字典管理"
      :width="850"
      v-model:visible="manage.visible"
      placement="right"
      class="drawer-form"
    >
      <unione-page-tree v-bind="manage.page" :params="manage.params"></unione-page-tree>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { axios, useDialog } from 'unione-base-vue'
const dialog = useDialog()

const page = ref()
const define = ref({
  storage: {
    controller: '/api/system/dict'
  },
  params: {
    parentId: -1
  },
  fields: [
    {
      title: '应用名称',
      name: 'appName',
      isQuery: true
    },
    {
      title: '字典名称',
      name: 'dictName',
      isQuery: true
    },
    {
      title: '字典标题',
      name: 'dictValue',
      isQuery: true
    },
    {
      title: '字典类型',
      name: 'dictType',
      convert: {
        types: 'option',
        options: [
          { value: 0, label: '平台' },
          { value: 1, label: '租户' },
          { value: 2, label: '机构' }
        ]
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
    width: 240,
    btns: [
      {
        name: 'view',
        visible: false
      },
      {
        name: 'manage',
        title: '管理'
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

function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'add') {
    drawer.value.visible = true
    drawer.value.title = '新增字典'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑字典'
    drawer.value.placement = 'right'
    drawer.value.row = row
    nextTick(() => {
      form.value.setValue(row)
    })
  }
  if (btn.name == 'manage') {
    manage.value.visible = true
    manage.value.target = row
    manage.value.params = {
      dictName: row.dictName
    }
  }
  if (btn.name == 'status') {
    setStatus(row.id, row.status == 1 ? 0 : 1)
  }
}

function setStatus(id: string, status: number) {
  dialog.confirm({
    content: '确定要' + (status == 1 ? '启用' : '停用') + '该字典么?',
    onOk: () => {
      axios.admin
        .request({
          url: '/api/system/dict/status',
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
  title: '新增字典',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '应用名称',
        name: 'appName',
        props: {
          required: true
        }
      },
      {
        title: '字典名称',
        name: 'dictName',
        props: {
          required: true
        },
        event: {
          visible: (value: string, ctx: any) => {
            return !ctx.id
          }
        }
      },
      {
        title: '字典标题',
        name: 'dictValue',
        props: {
          required: true
        }
      },
      {
        title: '字典类型',
        name: 'dictType',
        control: 'unione-select-box',
        value: 2,
        convert: {
          types: 'option',
          options: [
            { value: 0, label: '平台' },
            { value: 1, label: '租户' },
            { value: 2, label: '机构' }
          ]
        }
      },
      {
        title: '显示方式',
        name: 'showType',
        control: 'unione-select-box',
        value: 'text',
        convert: {
          types: 'option',
          options: [
            { value: 'text', label: '文本' },
            { value: 'tag', label: '标签' }
          ]
        }
      },
      {
        title: '显示顺序',
        name: 'ordered',
        value: 1,
        control: 'a-input-number'
      },
      {
        title: '字典状态',
        name: 'status',
        control: 'unione-switch-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'USEORNOT'
        }
      }
    ],
    setting: {
      showColumn: 1,
      labelWidth: 5
    }
  },
  tosave: () => {
    form.value.validate().then((data: any) => {
      const type = data.showType || 'text'
      delete data.showType
      data.ordered = data.ordered || 0

      data = {
        ...drawer.value.row,
        ...data,
        dictKey: data.dictName,
        parentId: -1,
        isLeaf: 0,
        dictShow: JSON.stringify({ type })
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

// 字典项管理
const manage = ref<any>({
  visible: false,
  target: {},
  params: {},
  page: {
    storage: {
      controller: '/api/system/dict'
    },
    fields: [
      {
        title: '应用名称',
        name: 'appName',
        event: {
          visible: {
            enable: true,
            scriptText: 'return ctx.parentId==-1'
          }
        }
      },
      {
        title: '字典类型',
        name: 'dictType',
        control: 'unione-select-box',
        value: 0,
        convert: {
          types: 'option',
          options: [
            { value: 0, label: '平台' },
            { value: 1, label: '租户' },
            { value: 2, label: '机构' }
          ]
        },
        event: {
          visible: {
            enable: true,
            scriptText: 'return ctx.parentId==-1'
          }
        }
      },
      {
        title: '字典名称',
        name: 'dictName',
        event: {
          visible: {
            enable: true,
            scriptText: 'return ctx.parentId==-1'
          }
        }
      },
      {
        title: '字典key',
        name: 'dictKey',
        event: {
          visible: {
            enable: true,
            scriptText: 'return ctx.parentId!=-1'
          }
        }
      },
      {
        title: '字典Value',
        name: 'dictValue',
        event: {
          title: {
            enable: true,
            scriptText: "return ctx.parentId==-1?'字典标题':'字典Value'"
          }
        }
      },
      {
        title: '显示顺序',
        name: 'ordered',
        control: 'a-input-number'
      },
      {
        title: '字典状态',
        name: 'status',
        control: 'unione-switch-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'USEORNOT'
        }
      }
    ],
    setting: {
      tree: {
        labelField: 'dictValue'
      },
      form: {
        showColumn: 1,
        labelWidth: 4
      }
    },
    event: {
      preSave: (data: any) => {
        if (data.parentId == -1) {
          data.dictKey = data.dictName
        }
      },
      createNode: (node: any, parent: any, params: any) => {
        if (parent) {
          node.appName = parent.appName
          node.dictName = parent.dictName
          node.dictType = parent.dictType
        } else {
          node.parentId = manage.value.target.id
          node.appName = manage.value.target.appName
          node.dictType = manage.value.target.dictType
          node.dictName = manage.value.target.dictName
        }
      }
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
}
</style>
