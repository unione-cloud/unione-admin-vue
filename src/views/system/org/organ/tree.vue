<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <unione-page-tree v-bind="unionePage" class="unione-system-organ"></unione-page-tree>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const unionePage = ref<any>({
  storage: {
    controller: '/api/system/organ'
  },
  fields: [
    {
      title: '机构名称',
      name: 'name',
      required: true
    },
    {
      title: '机构别名',
      name: 'alias'
    },
    {
      title: '机构类型',
      name: 'types',
      control: 'unione-select-box',
      value: 3,
      convert: {
        types: 'dict',
        dictName: 'ORGTYPES'
      }
    },
    {
      title: '机构编码',
      name: 'sn',
      required: true
    },
    {
      title: '机构级别',
      name: 'levels',
      control: 'unione-select-box',
      value: 2,
      convert: {
        types: 'dict',
        dictName: 'ORGLEVELS'
      }
    },
    {
      title: '主营业务',
      name: 'busiMain',
      control: 'a-textarea'
    },
    {
      title: '经营范围',
      name: 'busiScop',
      control: 'a-textarea'
    },
    {
      title: '机构地址',
      name: 'addr'
    },
    {
      title: '联系电话',
      name: 'tel'
    },
    {
      title: '显示顺序',
      name: 'ordered',
      control: 'a-input-number',
      value: 1
    },
    {
      title: '机构状态',
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
</script>

<style scoped lang="less"></style>
