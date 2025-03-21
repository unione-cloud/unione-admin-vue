<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-role-permis">
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
import { useRouter, type Router } from 'vue-router'

const router: Router = useRouter()
const page = ref()
const define = ref({
  storage: {
    controller: '/api/system/role'
  },
  fields: [
    {
      title: '角色名称',
      name: 'name',
      isQuery: true
    },
    {
      title: '角色编码',
      name: 'sn'
    },
    {
      title: '角色类型',
      name: 'types',
      control: 'unione-select-box',
      value: 0,
      convert: {
        types: 'dict',
        dictName: 'ROLETYPE'
      },
      isQuery: true
    },
    {
      title: '角色状态',
      name: 'status',
      control: 'unione-switch-box',
      value: 1,
      convert: {
        types: 'dict',
        dictName: 'USEORNOT'
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
  leftBtns: false,
  rightBtns: false,
  selection: false,
  operation: {
    title: '操作',
    width: 180,
    btns: [
      'view',
      'edit',
      'delete',
      {
        name: 'userlist',
        title: '用户列表'
      },
      {
        name: 'res-assign',
        title: '资源分配'
      }
    ],
    count: 4
  }
})

function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'add') {
    drawer.value.visible = true
    drawer.value.title = '新增角色'
    drawer.value.placement = 'left'
    drawer.value.row = {}
    nextTick(() => {
      form.value.reset()
    })
  }
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑角色'
    drawer.value.placement = 'right'
    drawer.value.row = row
    nextTick(() => {
      form.value.setValue(row)
    })
  }
  if (btn.name == 'userlist') {
    router.push({ path: '/system/permis/role/users', query: { roleId: row.id } })
  }
}

const form = ref() //form ref obj
const drawer = ref({
  title: '新增角色',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '角色名称',
        name: 'name',
        required: true
      },
      {
        title: '角色编码',
        name: 'sn',
        required: true
      },
      {
        title: '角色类型',
        name: 'types',
        control: 'unione-select-box',
        value: 9,
        convert: {
          types: 'dict',
          dictName: 'ROLETYPE'
        }
      },
      {
        title: '角色状态',
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
