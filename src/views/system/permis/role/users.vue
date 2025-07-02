<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-userlist">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <!-- 用户选择组件 -->
    <UnioneUserSelect
      v-model:visible="userSelectVisible"
      position="left"
      targetType="roleAssign"
      :targetValue="currentRole"
      @ok="handelOk"
    ></UnioneUserSelect>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Router } from 'vue-router'
import { axios, useDialog } from 'unione-base-vue'

const router: Router = useRouter()
const route: any = useRoute()
const dialog = useDialog()

const page = ref()
const define = ref({
  storage: { controller: '/api/system/userRole' },
  fields: [
    { title: '角色名称', name: 'roleName' },
    { title: '角色编码', name: 'roleSn' },
    { title: '机构名称', name: 'orgName' },
    { title: '用户帐号', name: 'username', isQuery: true },
    { title: '用户姓名', name: 'realName', isQuery: true },
    {
      title: '用户状态',
      name: 'status',
      control: 'unione-switch-box',
      defaultValue: 1,
      convert: { types: 'dict', dictName: 'USEORNOT' },
      isQuery: true
    },
    {
      title: '用户性别',
      name: 'sex',
      control: 'unione-switch-box',
      value: 1,
      convert: { types: 'dict', dictName: 'SEX' }
    },
    { title: '分配时间', name: 'created' }
  ],
  rightBtns: false,
  queryBtns: [{ name: 'back', title: '返回', index: 4 }],
  operation: {
    title: '操作',
    width: 100,
    btns: [
      { name: 'view', visible: false },
      { name: 'edit', visible: false }
    ],
    count: 4
  }
})

function btnClick({ btn }: any) {
  if (btn.name == 'back') {
    router.back()
  }
  if (btn.name == 'add') {
    if (currentRole.value) {
      userSelectVisible.value = true
    } else {
      dialog.error('角色ID不能为空')
    }
  }
}

const currentRole = computed(() => {
  return route.params.roleId || route.query.roleId
})
const userSelectVisible = ref(false)
// 选择用户
function handelOk(event: any) {
  console.log('handel user selected', event)
  axios
    .admin({
      url: '/api/system/userRole/save',
      method: 'post',
      data: {
        roleId: event.targetValue,
        users: event.list.map((item: any) => {
          return { id: item.id }
        })
      }
    })
    .then(() => {
      page.value.reload()
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
