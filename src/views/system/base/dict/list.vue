<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-page-list">
    <UnioneQuery :widget="queryForm" @query="toQuery" @reset="toQuery"></UnioneQuery>
    <UnioneTable
      :widget="tableList"
      :dataList="dataList.data"
      :loading="dataList.loading"
      :pagination="dataList.pagination"
      @change="tableChanged"
      @btnClick="tableBtnClick"
    ></UnioneTable>
  </div>
</template>

<script setup lang="ts">
import { Router } from 'vue-router'
import { computed, inject, onMounted, ref } from 'vue'
import { useDialog, loadConfig } from 'unione-base-vue'
import { message } from 'ant-design-vue'

const config = loadConfig()
const dialog = useDialog()
const unione: any = inject('unione')
const router: any | Router = inject('router') //useRouter()

const queryForm = ref({
  fields: [
    {
      title: '应用名称',
      name: 'appName'
    },
    {
      title: '字典名称',
      name: 'dictName'
    },
    {
      title: '字典类型',
      name: 'dictType'
    }
  ]
})

const tableList = ref({
  leftBtns: [
    {
      visible: false,
      name: 'delBatch'
    }
  ],
  rightBtns: [],
  columns: [
    {
      title: '应用名称',
      name: 'appName'
    },
    {
      title: '字典名称',
      name: 'dictName'
    },
    {
      title: '字典标题',
      name: 'dictValue'
    },
    {
      title: '字典类型',
      name: 'dictType'
    },
    {
      title: '状态',
      name: 'status'
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
  operation: {
    title: '操作',
    width: 250,
    btns: [
      {
        name: 'view',
        visible: false
      },
      {
        name: 'manage',
        title: '管理'
      },
      {
        name: 'subnode',
        title: '创建子级'
      }
    ],
    count: 4,
    more: {
      layout: 'vertical'
    }
  }
})
onMounted(() => {
  loadData()
})
const dataList = ref({
  pagination: {
    total: 0,
    current: 1,
    pageSize: 20
  },
  loading: false,
  params: {},
  data: []
})
function loadData() {
  dataList.value.loading = true
  unione.api.sysBaseDict
    .find({
      page: dataList.value.pagination.current,
      pageSize: dataList.value.pagination.pageSize,
      body: dataList.value.params
    })
    .then((result: any) => {
      dataList.value.data = result.body
      dataList.value.pagination.total = result.total * 1
    })
    .finally(() => {
      dataList.value.loading = false
    })
}
function tableChanged(event: any) {
  dataList.value.pagination.current = event.pagination.current
  dataList.value.pagination.pageSize = event.pagination.pageSize
  loadData()
}
function toQuery(params?: any) {
  dataList.value.pagination.current = 1
  dataList.value.params = params || {}
  loadData()
}
function tableBtnClick({ btn, event, row }: any) {
  console.log('table btn click', btn, event, row)

  if (btn.name == 'add') {
  }
  if (btn.name == 'edit') {
  }
}
</script>

<style scoped lang="less"></style>
