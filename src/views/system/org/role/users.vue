<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-userlist">
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
    controller: '/api/system/userRole'
  },
  fields: [
    {
      title: '角色名称',
      name: 'roleName'
    },
    {
      title: '角色编码',
      name: 'roleSn'
    },
    {
      title: '机构名称',
      name: 'rogName'
    },
    {
      title: '用户帐号',
      name: 'username'
    },
    {
      title: '用户姓名',
      name: 'realName'
    },
    {
      title: '用户状态',
      name: 'status',
      control: 'unione-switch-box',
      value: 1,
      convert: {
        types: 'dict',
        dictName: 'USEORNOT'
      },
      isQuery: true
    },
    {
      title: '用户性别',
      name: 'sex',
      control: 'unione-switch-box',
      value: 1,
      convert: {
        types: 'dict',
        dictName: 'SEX'
      }
    },
    {
      title: '分配时间',
      name: 'created'
    }
  ],
  leftBtns: false,
  rightBtns: false,
  operation: {
    title: '操作',
    width: 100,
    btns: [
      {
        name: 'view',
        visible: false
      },
      {
        name: 'edit',
        visible: false
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
