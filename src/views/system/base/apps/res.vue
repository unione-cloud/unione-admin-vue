<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <unione-page-tree v-bind="unionePage" class="unione-system-res"></unione-page-tree>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const unionePage = ref<any>({
  storage: {
    controller: '/api/system/resource'
  },
  fields: [
    {
      title: '资源标题',
      name: 'title',
      required: true
    },
    {
      title: '资源名称',
      name: 'name',
      required: true
    },
    {
      title: '资源别名',
      name: 'alias'
    },
    {
      title: '资源类型',
      name: 'types',
      control: 'unione-select-box',
      value: 'menu',
      convert: {
        types: 'dict',
        dictName: 'SYSRESTYPE'
      }
    },
    {
      title: '连接URL',
      name: 'url',
      required: false,
      event: {
        title: (value: any, formData: any) => {
          if (formData.types == 'menu') {
            return '菜单URL'
          }
        },
        required: (value: any, formData: any) => {
          return formData.types == 'menu'
        }
      }
    },
    {
      title: '显示顺序',
      name: 'ordered',
      value: 0,
      control: 'a-input-number'
    },
    {
      title: '字体图标',
      name: 'icon'
    },
    {
      title: '图片图标(小)',
      name: 'picMix'
    },
    {
      title: '图片图标(中)',
      name: 'picMid'
    },
    {
      title: '图片图标(大)',
      name: 'picMax'
    },
    {
      title: 'iframe打开',
      name: 'isIframe',
      control: 'unione-switch-box',
      value: 0,
      convert: {
        types: 'dict',
        dictName: 'TUREORFALSE'
      },
      event: {
        visible: (value: any, formData: any) => {
          return !!formData.url
        }
      }
    },
    {
      title: '外部链接',
      name: 'isExternal',
      control: 'unione-switch-box',
      value: 0,
      convert: {
        types: 'dict',
        dictName: 'TUREORFALSE'
      },
      event: {
        visible: (value: any, formData: any) => {
          return !!formData.url
        }
      }
    },
    {
      title: '是否隐藏',
      name: 'isHide',
      control: 'unione-switch-box',
      value: 0,
      convert: {
        types: 'dict',
        dictName: 'TUREORFALSE'
      },
      event: {
        visible: (value: any, formData: any) => {
          return !!formData.url
        }
      }
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
      title: '资源状态',
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
    btnVisible: (btn: any, node: any) => {
      if (btn.name == 'child') {
        return node.types == 'menu'
      }
      return true
    },
    createNode: (node: any, parent: any, params: any) => {
      node.isLeaf = 1
      node.ordered = 0
      node.configs = '{}'
    }
  }
})
</script>

<style scoped lang="less"></style>
