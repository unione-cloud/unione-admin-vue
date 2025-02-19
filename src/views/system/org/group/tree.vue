<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <unione-page-tree v-bind="unionePage" class="unione-system-group" :btns="[{name:'submit',visible:false}]"></unione-page-tree>
</template>

<script setup lang="ts">
import {ref } from 'vue'

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
      name: 'iconFont',
    },
    {
      title: '分组图片',
      name: 'iconPic',
    },
    {
      title: '显示顺序',
      name: 'ordered',
      control: 'a-input-number'
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
      } else {
        node.level = 0
      }
      node.isLeaf = 1
      node.ordered = 0
    }
  }
})
</script>

<style scoped lang="less"></style>
