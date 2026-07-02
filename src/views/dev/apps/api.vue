<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <unione-page-tree v-bind="unionePage" class="unione-system-api"></unione-page-tree>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const unionePage = ref<any>({
  storage: {
    controller: '/api/system/apiInfo',
    orderBy: 'ordered asc'
  },
  fields: [
    {
      title: '接口标题',
      name: 'title',
      required: true
    },
    {
      title: '接口名称',
      name: 'name',
      required: true
    },
    {
      title: '接口URL',
      name: 'url',
      required: true
    },
    {
      title: '请求方式',
      name: 'method',
      control: 'unione-select-box',
      value: 'POST',
      convert: {
        types: 'dict',
        dictName: 'REQUESTMETHOD'
      }
    },
    {
      title: '请求参数',
      name: 'params'
    },
    {
      title: '接口响应',
      name: 'response'
    },
    {
      title: '显示顺序',
      name: 'ordered',
      value: 0,
      control: 'a-input-number'
    },
    {
      title: '是否授权',
      name: 'isNeedPermis',
      control: 'unione-switch-box',
      value: 1,
      convert: {
        types: 'dict',
        dictName: 'TUREORFALSE'
      }
    },
    {
      title: '接口状态',
      name: 'status',
      control: 'unione-switch-box',
      value: 1,
      convert: {
        types: 'dict',
        dictName: 'USEORNOT'
      }
    },
    {
      title: '备注',
      name: 'descs',
      control: 'a-textarea'
    }
  ],
  setting: {
    tree: {
      labelField: 'title'
    },
    form: {
      showColumn: 1,
      labelWidth: 4
    }
  },
  event: {
    createNode: (node: any, parent: any, params: any) => {
      node.isLeaf = 1
      node.ordered = 0
    }
  }
})
</script>

<style scoped lang="less"></style>
