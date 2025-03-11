<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <unione-page-tree
    v-bind="unionePage"
    class="unione-system-post"
    ref="page"
    @btnClick="btnClick"
    @treeClick="treeClick"
  >
    <template #form-warp v-if="memberVisible">
      <unione-page-list
        v-bind="defineMember"
        :params="{ postId: currentPost.id }"
        @btnClick="memberClick"
        ref="member"
      ></unione-page-list>
    </template>
  </unione-page-tree>

  <!-- 用户选择组件 -->
  <UserSelect
    v-model:visible="userSelectVisible"
    position="left"
    targetType="post"
    :targetValue="currentPost?.id"
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
    controller: '/api/system/post'
  },
  fields: [
    {
      title: '岗位名称',
      name: 'name',
      required: true
    },
    {
      title: '岗位类型',
      name: 'types',
      control: 'unione-select-box',
      value: 9,
      convert: {
        types: 'dict',
        dictName: 'POSTTYPES'
      }
    },
    {
      title: '岗位图标',
      name: 'iconFont'
    },
    {
      title: '岗位图片',
      name: 'iconPic'
    },
    {
      title: '显示顺序',
      name: 'ordered',
      control: 'a-input-number'
    },
    {
      title: '岗位状态',
      name: 'status',
      control: 'unione-switch-box',
      value: 1,
      convert: {
        types: 'dict',
        dictName: 'USEORNOT'
      }
    },
    {
      title: '岗位职责',
      name: 'duty',
      control: 'a-textarea'
    },
    {
      title: '岗位描述',
      name: 'descs',
      control: 'a-textarea'
    }
  ],
  btns: [
    {
      name: 'member',
      title: '成员管理'
    }
  ],
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
      if (parent) {
        node.level = parent.level + 1
        node.types = parent.types
      } else {
        node.level = 0
      }
      node.isLeaf = 1
      node.ordered = 0
      memberVisible.value = false
    }
  }
})

function btnClick({ btn, event }: any) {
  if (btn.name == 'member') {
    memberVisible.value = true
  }
}
function treeClick({ keys, event }: any) {
  console.log('tree click', keys, event)
  if (event.node.id?.startsWith('new_')) {
    return
  }
  currentPost.value = event.node
  member.value?.setParams({ postId: currentPost.value.id })
}
function memberClick({ btn, event }: any) {
  if (btn.name == 'back') {
    memberVisible.value = false
  }
  if (btn.name == 'add') {
    userSelectVisible.value = true
  }
}
const memberVisible = ref(false)
const userSelectVisible = ref(false)
const currentPost = ref<any>(null)
const defineMember = ref({
  storage: {
    controller: '/api/system/userPost'
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
      title: '成员姓名',
      name: 'realName'
    },
    {
      title: '成员状态',
      name: 'status',
      control: 'unione-switch-box',
      defaultValue: 1,
      convert: {
        types: 'dict',
        dictName: 'MENBERSTATUS'
      },
      isQuery: true
    },
    {
      title: '成员性别',
      name: 'sex',
      control: 'unione-switch-box',
      value: 1,
      convert: {
        types: 'dict',
        dictName: 'SEX'
      }
    },
    {
      title: '加入时间',
      name: 'timeJoin'
    },
    {
      title: '加入时间',
      name: 'timeLeave'
    }
  ],
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
// 选择用户
function handelOk(event: any) {
  console.log('handel user selected', event)
  axios
    .admin({
      url: '/api/system/userPost/save',
      method: 'post',
      data: {
        postId: event.targetValue,
        users: event.userList
      }
    })
    .then((res: any) => {
      member.value.reload()
    })
}
</script>

<style scoped lang="less"></style>
