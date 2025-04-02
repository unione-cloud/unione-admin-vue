<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <unione-page-tree
    ref="page"
    v-bind="unionePage"
    class="unione-system-resource-assign"
    @btnClick="btnClick"
    @treeClick="treeClick"
  >
    <template #form-warp>
      <a-tabs
        class="target-tabs"
        v-model:activeKey="targetType"
        size="small"
        type="card"
        tabPosition="top"
      >
        <a-tab-pane v-for="type in targetList" :key="type.value" :tab="type.title">
          <unione-page-list v-bind="type.list"></unione-page-list>
        </a-tab-pane>
      </a-tabs>
    </template>
  </unione-page-tree>

  <!-- 用户选择组件 -->
  <UserSelect
    v-model:visible="userSelectVisible"
    position="left"
    targetType="group"
    :targetValue="currentGroup?.id"
    @ok="handelOk"
  ></UserSelect>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { axios } from 'unione-base-vue'

const page = ref() // pageTree dom ref obj
const member = ref() // member dom ref obj
const unionePage = ref<any>({
  storage: {
    controller: '/api/system/group'
  },
  opts: false,
  setting: {
    tree: {
      labelField: 'name'
    },
    form: {
      showColumn: 1,
      labelWidth: 4
    }
  },
  event: {
    createNode: (node: any, parent: any, params: any) => {
      node.isLeaf = 1
    }
  }
})

function btnClick({ btn, event }: any) {
  if (btn.name == 'member') {
    //
  }
}
function treeClick({ keys, event }: any) {
  console.log('tree click', keys, event)
  if (event.node.id?.startsWith('new_')) {
    return
  }
  currentGroup.value = event.node
  member.value?.setParams({ groupId: currentGroup.value.id })
}

const targetType = ref('organ')
const targetList = ref<any>([
  {
    title: '机构',
    value: 'organ',
    list: {
      storage: {
        controller: '/api/system/organ'
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
        controller: '/api/system/post'
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
        controller: '/api/system/group'
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

const userSelectVisible = ref(false)
const currentGroup = ref<any>(null)
// 选择用户
function handelOk(event: any) {
  console.log('handel user selected', event)
  axios
    .admin({
      url: '/api/system/groupMember/save',
      method: 'post',
      data: {
        groupId: event.targetValue,
        users: event.list
      }
    })
    .then((res: any) => {
      member.value.reload()
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
