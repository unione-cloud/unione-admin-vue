<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-config">
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
      title="配置管理"
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
    controller: '/api/system/configDefine'
  },
  params: {
    pid: -1
  },
  fields: [
    {
      title: '应用名称',
      name: 'appName',
      isQuery: true
    },

    {
      title: '配置标题',
      name: 'title',
      isQuery: true
    },
    {
      title: '配置类型',
      name: 'types',
      convert: {
        types: 'dict',
        dictName: 'IUCONFTYPE'
      },
      isQuery: true
    },
    {
      title: '配置name',
      name: 'name',
      isQuery: true
    },
    {
      title: '配置value',
      name: 'valueDefault'
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
    drawer.value.title = '新增配置'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑配置'
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
      pid: row.id
    }
  }
  if (btn.name == 'status') {
    setStatus(row.id, row.status == 1 ? 0 : 1)
  }
}

function setStatus(id: string, status: number) {
  dialog.confirm({
    content: '确定要' + (status == 1 ? '启用' : '停用') + '该配置么?',
    onOk: () => {
      axios.admin
        .request({
          url: '/api/system/configDefine/status',
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
  title: '新增配置',
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
        title: '配置类型',
        name: 'types',
        control: 'unione-select-box',
        value: '0',
        convert: {
          types: 'dict',
          dictName: 'IUCONFTYPE'
        }
      },
      {
        title: '配置标题',
        name: 'title',
        props: {
          required: true
        }
      },
      {
        title: '配置name',
        name: 'name',
        props: {
          required: true
        }
      },
      {
        title: '配置value',
        name: 'valueDefault'
      },
      {
        title: '显示顺序',
        name: 'ordered',
        value: 1,
        control: 'a-input-number'
      },
      {
        title: '配置状态',
        name: 'status',
        control: 'unione-switch-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'USEORNOT'
        }
      },
      {
        title: '配置说明',
        name: 'descs',
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
      data.ordered = data.ordered || 0
      data.appId = -1
      data = {
        ...drawer.value.row,
        ...data,
        pid: -1
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

// 配置项管理
const manage = ref<any>({
  visible: false,
  target: {},
  params: {},
  page: {
    storage: {
      controller: '/api/system/configDefine'
    },
    fields: [
      {
        title: '配置编码',
        name: 'sn',
        view: 'html',
        event: {
          showFormat: (value: string, ctx: any) => {
            if (!value) {
              return '--'
            }
            return value.substring(0, value.lastIndexOf('.')) + '.' + ctx.form.name
          }
        }
      },
      {
        title: '配置类型',
        name: 'types',
        control: 'unione-select-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'IUCONFTYPE'
        }
      },
      {
        title: '配置标题',
        name: 'title',
        props: {
          required: true
        }
      },
      {
        title: '配置name',
        name: 'name',
        props: {
          required: true
        }
      },
      {
        title: '配置value',
        name: 'valueDefault'
      },
      {
        title: '显示顺序',
        name: 'ordered',
        value: 1,
        control: 'a-input-number'
      },
      {
        title: '配置状态',
        name: 'status',
        control: 'unione-switch-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'USEORNOT'
        }
      },
      {
        title: '配置说明',
        name: 'descs',
        control: 'a-textarea'
      }
    ],
    setting: {
      form: {
        showColumn: 1,
        labelWidth: 4
      }
    },
    event: {
      createNode: (node: any, parent: any, params: any) => {
        if (parent) {
          node.pid = parent.id
          node.types = parent.types
        } else {
          node.pid = manage.value.target.id
          node.types = manage.value.target.types
        }
        node.appId = manage.value.target.appId || -1
        node.appName = manage.value.target.appName
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
