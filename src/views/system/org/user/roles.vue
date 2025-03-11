<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-rolelist">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>
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
      title: '机构名称',
      name: 'orgName'
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
      title: '角色名称',
      name: 'roleName'
    },
    {
      title: '角色编码',
      name: 'roleSn'
    },
    {
      title: '分配时间',
      name: 'created'
    }
  ],
  leftBtns: ['add'],
  rightBtns: false,
  queryBtns: [
    {
      name: 'back',
      title: '返回',
      index: 4
    }
  ],
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

function btnClick({ btn }: any) {
  if (btn.name == 'back') {
    router.back()
  }
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
