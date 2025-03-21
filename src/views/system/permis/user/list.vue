<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-user-permis">
    <unione-page-list ref="page" v-bind="define" @btnClick="btnClick"></unione-page-list>

    <a-drawer
      :title="drawer.title"
      :width="900"
      v-model:visible="drawer.visible"
      :placement="drawer.placement"
      class="drawer-form"
    >
      <div class="warp">
        <a-row>
          <a-col :span="16">
            <unione-page-list
              ref="rolelist"
              v-bind="defineRoleList"
              @btnClick="btnClick"
            ></unione-page-list>
          </a-col>
          <a-col :span="8">
            <a-list size="small" bordered :data-source="hadRoleList">
              <template #renderItem="{ item }">
                <a-list-item>{{ item }}</a-list-item>
              </template>
              <template #header>
                <div>已有角色</div>
              </template>
            </a-list>
            <a-list size="small" bordered :data-source="addRoleList" style="margin-top: 10px">
              <template #renderItem="{ item }">
                <a-list-item>{{ item }}</a-list-item>
              </template>
              <template #header>
                <div>新增角色</div>
              </template>
            </a-list>
            <a-list size="small" bordered :data-source="delRoleList" style="margin-top: 10px">
              <template #renderItem="{ item }">
                <a-list-item>{{ item }}</a-list-item>
              </template>
              <template #header>
                <div>删除角色</div>
              </template>
            </a-list>
          </a-col>
        </a-row>
      </div>

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
    drawer.value.visible = true
    drawer.value.title = '角色分配'
    drawer.value.placement = 'right'
    drawer.value.row = row
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

const defineRoleList = ref({
  storage: {
    controller: '/api/system/role'
  },
  fields: [
    {
      title: '类型',
      name: 'types',
      control: 'unione-select-box',
      value: 0,
      convert: {
        types: 'dict',
        dictName: 'ROLETYPE'
      }
    },
    {
      title: '名称',
      name: 'name'
    },
    {
      title: '编码',
      name: 'sn'
    }
  ],
  leftBtns: false,
  rightBtns: false,
  queryBtns: [
    {
      name: 'assignBatch',
      title: '批量分配',
      type: 'primary',
      icon: 'PlusOutlined'
    }
  ],
  operation: {
    title: '操作',
    width: 90,
    btns: [
      'view',
      'edit',
      'delete',
      {
        name: 'assign',
        title: '分配'
      }
    ],
    count: 4
  }
})

const hadRoleList = ref<Array<any>>([])
const addRoleList = ref<Array<any>>([])
const delRoleList = ref<Array<any>>([])
const drawer = ref({
  title: '新增用户',
  placement: 'left',
  visible: false,
  row: {},
  tosave: () => {}
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
