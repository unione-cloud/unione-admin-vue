<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-role-permis">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <UnioneResSelect v-model:visible="resSelectVisible" targetType="role" :targetValue="targetObj?.id" position="right"
      @ok="handelResOk"></UnioneResSelect>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useRouter, type Router } from 'vue-router'
import { axios, useDialog } from 'unione-base-vue'
import { context } from 'ant-design-vue/es/vc-image/src/PreviewGroup'

const dialog = useDialog()
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
  if (btn.name == 'res-assign') {
    resSelectVisible.value = true
    targetObj.value = row
  }
  if (btn.name == 'userlist') {
    router.push({ path: '/system/permis/role/users', query: { roleId: row.id } })
  }
}
const targetObj = ref<any>(null)
const resSelectVisible = ref(false)
function handelResOk(e: any) {
  console.log('res select ok', e)
  const resList = e.list.map((item: any) => {
    return { ...item, roleId: targetObj.value.id }
  })
  axios
    .admin({
      url: `/api/system/rolePermis/save`,
      method: 'post',
      data: { roleId: targetObj.value.id, addPermis: resList }
    })
    .then((res: any) => {
      if (res.success) {
        dialog.success({ content: '资源分配成功:' + res.message })
        resSelectVisible.value = false
      } else {
        dialog.error({ content: '资源分配成功:' + res.message })
      }
    })
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
