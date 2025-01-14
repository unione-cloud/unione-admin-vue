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
    width: 130,
    btns: [
      {
        name: 'view',
        visible: false
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
const dataList = ref<any>({
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
  const keywords = dataList.value.keywords
  unione.api.sysOrgUser
    .find({
      page: dataList.value.pagination.current,
      pageSize: dataList.value.pagination.pageSize,
      body: { ...dataList.value.params },
      keywords,
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
function toQuery({ params, keywords }: any) {
  dataList.value.pagination.current = 1
  dataList.value.params = params
  dataList.value.keywords = keywords
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
    drawer.value.title = '编辑用户'
    drawer.value.placement = 'right'
    drawer.value.row = row
    nextTick(() => {
      form.value.setValue(row)
    })
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
        title: '所属机构',
        name: 'orgId',
        required: true,
        control: 'unione-select-box',
        convert: {
          types: 'local',
          url: '/api/system/organ/find',
          labelField: 'name',
          search: true
        }
      },
      {
        title: '用户类型',
        name: 'userType',
        control: 'unione-select-box',
        value: 2,
        convert: {
          types: 'dict',
          dictName: 'USERTYPE'
        }
      },
      {
        title: '用户帐号',
        name: 'username',
        required: true
      },
      {
        title: '用户密码',
        name: 'pwdText',
        control: 'unione-pwd-box',
        required: true,
        event: {
          visible: (value: any, ctx: any) => {
            return !ctx.id
          }
        }
      },
      {
        title: '用户姓名',
        name: 'realName',
        required: true
      },
      {
        title: '用户性别',
        name: 'sex',
        control: 'unione-switch-box',
        value: 2,
        convert: {
          types: 'dict',
          dictName: 'SEX'
        }
      },
      {
        title: '出生日期',
        name: 'birthday',
        control: 'a-date-picker',
        props: {
          placeholder: '',
          valueFormat: 'YYYY-MM-DD'
        }
      },
      {
        title: '手机号码',
        name: 'tel',
        required: true
      },
      {
        title: '邮箱地址',
        name: 'email'
      },
      {
        title: 'QQ号码',
        name: 'qq'
      },
      {
        title: '用户状态',
        name: 'status',
        control: 'unione-select-box',
        value: 1,
        convert: {
          types: 'dict',
          dictName: 'USERSTATUS'
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
      unione.api.sysOrgUser.save(data).then(() => {
        drawer.value.visible = false
        toQuery()
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
