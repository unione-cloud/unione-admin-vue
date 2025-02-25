<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <unione-page-tree v-bind="unionePage" class="unione-system-post" @btnClick="btnClick">
    <template #form-warp v-if="memberVisible">
      <unione-page-list v-bind="defineMember" @btnClick="memberClick"></unione-page-list>
    </template>
  </unione-page-tree>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
  btns:[{
    name:'member',
    title:'成员管理',
  }],
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
    }
  }
})

function btnClick({btn,event}:any){
  if(btn.name == 'member'){
    memberVisible.value = true
  }
}

function memberClick({btn,event}:any){
  if(btn.name =='back'){
    memberVisible.value = false
  }
}
const memberVisible=ref(false)
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
  queryBtns:[{
    name:'back',
    title:'返回',
    index:4
  }],
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


</script>

<style scoped lang="less"></style>
