<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-user">
    <UnioneQuery :widget="queryForm" @query="toQuery" @reset="toQuery"></UnioneQuery>
    <UnioneTable
      ref="unioneTable"
      :widget="tableList"
      :dataList="dataList.data"
      :loading="dataList.loading"
      :pagination="dataList.pagination"
      @change="tableChanged"
      @btnClick="tableBtnClick"
    ></UnioneTable>

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
import { inject, nextTick, onMounted, ref } from 'vue'
import { useDialog, loadConfig } from 'unione-base-vue'

const config = loadConfig()
const dialog = useDialog()
const unione: any = inject('unione')

// dom ref
const unioneTable = ref()

// query form
const queryForm = ref({
  fields: [
    {
      title: '用户姓名',
      name: 'realName'
    },
    {
      title: '用户帐号',
      name: 'username'
    },
    {
      title: '手机号',
      name: 'tel'
    },
    {
      title: '用户类型',
      name: 'userType'
    },
    {
      title: '用户状态',
      name: 'status'
    }
  ]
})

const tableList = ref({
  columns: [
    {
      title: '机构名称',
      name: 'orgName'
    },
    {
      title: '用户姓名',
      name: 'realName'
    },
    {
      title: '用户帐号',
      name: 'username'
    },
    {
      title: '手机号',
      name: 'tel'
    },
    {
      title: '性别',
      name: 'sex',
      convert: {
        types: 'dict',
        dictName: 'SEX'
      }
    },
    {
      title: '用户类型',
      name: 'userType',
      convert: {
        types: 'dict',
        dictName: 'USERTYPE'
      }
    },
    {
      title: '用户状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'USERSTATUS'
      }
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
onMounted(() => {
  loadData()
})
const dataList = ref({
  pagination: {
    total: 0,
    current: 1,
    pageSize: 10
  },
  loading: false,
  params: {},
  sorts: [{ name: 'created', asc: false }],
  data: []
})
function loadData() {
  dataList.value.loading = true
  unione.api.sysOrgUser
    .find({
      page: dataList.value.pagination.current,
      pageSize: dataList.value.pagination.pageSize,
      body: { ...dataList.value.params, parentId: -1 },
      sorts: dataList.value.sorts
    })
    .then((result: any) => {
      dataList.value.data = result.body
      dataList.value.pagination.total = result.total * 1
    })
    .finally(() => {
      dataList.value.loading = false
    })
}
function tableChanged(event: any) {
  dataList.value.pagination.current = event.pagination.current
  dataList.value.pagination.pageSize = event.pagination.pageSize
  loadData()
}
function toQuery(params?: any) {
  dataList.value.pagination.current = 1
  dataList.value.params = params || {}
  loadData()
}
function tableBtnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'delete') {
    unione.api.sysOrgUser.delete([row.id]).then(() => {
      toQuery()
    })
  }
  if (btn.name == 'delBatch') {
    unione.api.sysOrgUser.delete(keys).then(() => {
      unioneTable.value.clearSelected()
      toQuery()
    })
  }
  if (btn.name == 'status') {
    unione.api.sysOrgUser.setStatus(row.id, row.status == 1 ? 0 : 1).then(() => {
      toQuery()
    })
  }
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
}

const form = ref() //form ref obj
const drawer = ref({
  title: '新增用户',
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
      unione.api.sysOrgUser.save(data).then(() => {
        drawer.value.visible = false
        toQuery()
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
        labelWidth: 4,
        valueWidth: 15
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
