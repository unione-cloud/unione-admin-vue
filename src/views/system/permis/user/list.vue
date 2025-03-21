<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-user-permis">
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
    controller: '/api/system/user'
  },
  fields: [
    {
      title: '机构名称',
      name: 'orgName',
      isQuery: true
    },
    {
      title: '用户姓名',
      name: 'realName',
      isQuery: true
    },
    {
      title: '用户帐号',
      name: 'username',
      isQuery: true
    },
    {
      title: '手机号',
      name: 'tel',
      isQuery: true
    },
    {
      title: '性别',
      name: 'sex',
      convert: {
        types: 'dict',
        dictName: 'SEX'
      },
      control: 'unione-select-box',
      isQuery: true
    },
    {
      title: '用户类型',
      name: 'userType',
      convert: {
        types: 'dict',
        dictName: 'USERTYPE'
      },
      isQuery: true
    },
    {
      title: '用户状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'USERSTATUS'
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
        name: 'role-assign',
        title: '角色分配'
      },
      {
        name: 'res-assign',
        title: '资源分配'
      }
    ],
    count: 2,
    more: {
      layout: 'vertical'
    }
  }
})

function btnClick({ btn, event, row, keys }: any) {
  console.log('table btn click', btn, event, row)
  if (btn.name == 'edit') {
    drawer.value.visible = true
    drawer.value.title = '编辑用户'
    drawer.value.placement = 'right'
    drawer.value.row = row
    nextTick(() => {
      form.value.setValue(row)
    })
  }
  if (btn.name == 'rolelist') {
    router.push({
      path: '/system/org/user/rolelist',
      query: {
        userId: row.id
      }
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
