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
        <a-tab-pane v-for="type in targetList" :key="type" :tab="type.title"> </a-tab-pane>
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
  fields: [
    {
      title: '分组名称',
      name: 'name',
      required: true
    },
    {
      title: '分组类型',
      name: 'types',
      control: 'unione-select-box',
      value: 9,
      convert: {
        types: 'dict',
        dictName: 'GROUPTYPES'
      }
    },
    {
      title: '分组图标',
      name: 'iconFont'
    },
    {
      title: '分组图片',
      name: 'iconPic'
    },
    {
      title: '显示顺序',
      name: 'ordered',
      control: 'a-input-number',
      value: 1
    },
    {
      title: '分组状态',
      name: 'status',
      control: 'unione-switch-box',
      value: 1,
      convert: {
        types: 'dict',
        dictName: 'USEORNOT'
      }
    },
    {
      title: '分组描述',
      name: 'descs',
      control: 'a-textarea'
    }
  ],
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
    value: 'organ'
  },
  {
    title: '角色',
    value: 'role'
  },
  {
    title: '岗位',
    value: 'post'
  },
  {
    title: '分组',
    value: 'group'
  },
  {
    title: '用户',
    value: 'user'
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
