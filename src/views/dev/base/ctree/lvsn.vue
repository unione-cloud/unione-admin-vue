<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list unione-system-codelvsn">
    <unione-page-list ref="page" v-bind="define"></unione-page-list>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const page = ref()
const define = ref({
  storage: {
    controller: '/api/system/codeTree',
    findUrl: '/lvsn'
  },
  fields: [
    {
      title: '应用名称',
      name: 'appName'
    },
    {
      title: '树标题',
      name: 'treeTitle'
    },
    {
      title: '树编码',
      name: 'treeSn'
    },
    {
      title: '类型',
      name: 'lvType',
      convert: {
        types: 'dict',
        dictName: 'CODETREETYPE'
      }
    },
    {
      title: '租户名称',
      name: 'tenantName',
      customRender: (row: any) => {
        if (row.lvType != 1) {
          return '--'
        }
        return row.tenantName || '--'
      }
    },
    {
      title: '机构名称',
      name: 'orgName',
      customRender: (row: any) => {
        if (row.lvType != 2) {
          return '--'
        }
        return row.organName || '--'
      }
    },
    {
      title: '最大层级',
      name: 'currentMaxLv'
    },
    {
      title: '当前编码',
      name: 'currentLvsn'
    },
    {
      title: '创建时间',
      name: 'created'
    },
    {
      title: '修改时间',
      name: 'lastUpdated'
    }
  ],
  leftBtns: false,
  rightBtns: false,
  operation: false
})
</script>

<style scoped lang="less">
.drawer-form {
  .btns {
    text-align: center;

    :deep(.ant-btn) {
      margin: 5px 10px;
    }
  }
}
</style>
