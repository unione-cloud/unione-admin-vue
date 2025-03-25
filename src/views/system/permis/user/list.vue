<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-user-permis">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <RoleSelect v-model:visible="roleSelectVisible" position="right" @ok="handelOk"></RoleSelect>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useRouter, type Router } from 'vue-router'

const router: Router = useRouter()
const page = ref()
const rolelist = ref()

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
  if (btn.name == 'role-assign') {
    roleSelectVisible.value = true
  }
  if (btn.name == 'assignBatch') {
    const selected = rolelist.value.getSelected()
    console.log('selected', selected)
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

const roleSelectVisible = ref(false)
function handelOk(e: any) {
  console.log('role select ok', e)
  roleSelectVisible.value = false
}
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
