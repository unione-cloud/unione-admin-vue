<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <unione-page-tree
    ref="page"
    v-bind="unionePage"
    class="unione-system-resource-assign"
    @treeClick="treeClick"
  >
    <template #form-warp>
      <a-tabs
        class="target-tabs"
        v-model:activeKey="targetType"
        size="small"
        type="card"
        tabPosition="top"
        @change="onTabChanged"
      >
        <a-tab-pane v-for="type in targetList" :key="type.value" :tab="type.title">
          <unione-page-list
            :ref="type.value + 'List'"
            v-bind="type.list"
            :params="{ targetId: -1 }"
            @btnClick="(e: any) => btnClick(type.value, e)"
          ></unione-page-list>
        </a-tab-pane>
      </a-tabs>
    </template>
  </unione-page-tree>

  <!-- 用户选择组件 -->
  <UserSelect
    v-model:visible="userSelectVisible"
    position="left"
    targetType="group"
    :targetValue="currentRes?.id"
    @ok="handelUserOk"
  ></UserSelect>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { axios, useDialog } from 'unione-base-vue'

const dialog = useDialog()
const page = ref() // pageTree dom ref obj
const organList = ref() // organ dom ref obj
const roleList = ref() // role dom ref obj
const postList = ref() // post dom ref obj
const groupList = ref() // group dom ref obj
const userList = ref() // user dom ref obj

const unionePage = ref<any>({
  storage: {
    controller: '/api/system/resource',
    findUrl: '/tree/view',
    findParams: []
  },
  opts: false,
  setting: {
    tree: {
      labelField: 'title',
      async: false
    }
  }
})

function treeClick({ keys, event }: any) {
  currentRes.value = event.node
  onTabChanged()
}
function onTabChanged() {
  nextTick(() => {
    if (!currentRes.value) {
      return
    }
    if (targetType.value === 'group') {
      groupList.value[0].setParams({ targetId: currentRes.value.id })
    }
    if (targetType.value === 'user') {
      userList.value[0].setParams({ targetId: currentRes.value.id })
    }
    if (targetType.value === 'organ') {
      organList.value[0].setParams({ targetId: currentRes.value.id })
    }
    if (targetType.value === 'role') {
      roleList.value[0].setParams({ targetId: currentRes.value.id })
    }
    if (targetType.value === 'post') {
      postList.value[0].setParams({ targetId: currentRes.value.id })
    }
  })
}
function btnClick(type: string, { btn }: any) {
  console.log('btnClick', type, btn)
  if (type === 'user') {
    if (btn.name === 'add') {
      if (!currentRes.value) {
        dialog.warning({
          title: '提示信息',
          content: '请选择资源后再进行用户添加'
        })
        return
      }
      userSelectVisible.value = true
    }
  }
}

const targetType = ref('organ')
const targetList = ref<any>([
  {
    title: '机构',
    value: 'organ',
    list: {
      storage: {
        controller: '/api/system/organPermis'
      },
      fields: [
        {
          title: '机构名称',
          name: 'name',
          isQuery: true
        },
        {
          title: '机构编码',
          name: 'sn'
        },
        {
          title: '机构类型',
          name: 'types',
          control: 'unione-select-box',
          value: 0,
          convert: {
            types: 'dict',
            dictName: 'ORGTYPES'
          },
          isQuery: true
        },
        {
          title: '机构状态',
          name: 'status',
          control: 'unione-switch-box',
          value: 1,
          convert: {
            types: 'dict',
            dictName: 'USEORNOT'
          },
          isQuery: true
        }
      ],
      leftBtns: ['delBatch'],
      operation: {
        title: '操作',
        width: 90,
        btns: ['view', 'edit']
      }
    }
  },
  {
    title: '角色',
    value: 'role',
    list: {
      storage: {
        controller: '/api/system/rolePermis'
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
          },
          isQuery: true
        }
      ],
      leftBtns: ['delBatch'],
      operation: {
        title: '操作',
        width: 90,
        btns: ['view', 'edit']
      }
    }
  },
  {
    title: '岗位',
    value: 'post',
    list: {
      storage: {
        controller: '/api/system/postPermis'
      },
      fields: [
        {
          title: '岗位名称',
          name: 'name',
          isQuery: true
        },
        {
          title: '岗位编码',
          name: 'sn'
        },
        {
          title: '岗位类型',
          name: 'types',
          control: 'unione-select-box',
          value: 0,
          convert: {
            types: 'dict',
            dictName: 'POSTTYPES'
          },
          isQuery: true
        },
        {
          title: '岗位状态',
          name: 'status',
          control: 'unione-switch-box',
          value: 1,
          convert: {
            types: 'dict',
            dictName: 'USEORNOT'
          },
          isQuery: true
        }
      ],
      leftBtns: ['delBatch'],
      operation: {
        title: '操作',
        width: 90,
        btns: ['view', 'edit']
      }
    }
  },
  {
    title: '分组',
    value: 'group',
    list: {
      storage: {
        controller: '/api/system/groupPermis'
      },
      fields: [
        {
          title: '分组名称',
          name: 'name',
          isQuery: true
        },
        {
          title: '分组编码',
          name: 'sn'
        },
        {
          title: '分组类型',
          name: 'types',
          control: 'unione-select-box',
          value: 0,
          convert: {
            types: 'dict',
            dictName: 'GROUPTYPES'
          },
          isQuery: true
        },
        {
          title: '分组状态',
          name: 'status',
          control: 'unione-switch-box',
          value: 1,
          convert: {
            types: 'dict',
            dictName: 'USEORNOT'
          },
          isQuery: true
        }
      ],
      leftBtns: ['delBatch'],
      operation: {
        title: '操作',
        width: 90,
        btns: ['view', 'edit']
      }
    }
  },
  {
    title: '用户',
    value: 'user',
    list: {
      storage: {
        controller: '/api/system/userPermis'
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
          title: '用户账号',
          name: 'username'
        },
        {
          title: '用户类型',
          name: 'userType',
          control: 'unione-select-box',
          value: 0,
          convert: {
            types: 'dict',
            dictName: 'USERTYPE'
          },
          isQuery: true
        },
        {
          title: '用户状态',
          name: 'status',
          control: 'unione-switch-box',
          value: 1,
          convert: {
            types: 'dict',
            dictName: 'USERSTATUS'
          },
          isQuery: true
        }
      ],
      leftBtns: ['delBatch'],
      operation: {
        title: '操作',
        width: 90,
        btns: ['view', 'edit']
      }
    }
  }
])
function loadTargetData() {}

const currentRes = ref<any>(null)
const userSelectVisible = ref(false)
// 选择用户
function handelUserOk(event: any) {
  console.log('handel user selected', event)
  axios
    .admin({
      url: '/api/system/userPermis/save',
      method: 'post',
      data: {
        appId: currentRes.value.appId,
        resId: currentRes.value.id,
        resType: currentRes.value.ntype,
        addPermis: event.list.map((u: any) => {
          return { userId: u.id }
        })
      }
    })
    .then((res: any) => {
      if (res.success) {
        userList.value[0].reload()
      }
    })
}
</script>

<style scoped lang="less">
.target-tabs {
  :deep(.ant-tabs-nav) {
    margin-left: 5px;
  }
}
</style>
