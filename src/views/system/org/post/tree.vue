<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <unione-page-tree v-bind="unionePage" class="unione-system-post"></unione-page-tree>
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
</script>

<style scoped lang="less"></style>
