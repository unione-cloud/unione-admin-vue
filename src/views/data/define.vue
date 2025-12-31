<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page unione-list-page data-define-list">
    <UnioneQuery :widget="queryForm" @query="toQuery" @reset="toQuery"></UnioneQuery>
    <UnioneTable :widget="tableList" :dataList="dataList.data" :loading="dataList.loading"
      :pagination="dataList.pagination" @change="tableChanged" @btnClick="tableBtnClick"></UnioneTable>

    <unione-data-table-selector ref="dataTableSelectorRef" opt="define" :hidden="true" @select="handelTableSelect"
      :title="tableOptName == 'impFromDb' ? '从数据库导入' : '代码生成'" position="left">
    </unione-data-table-selector>

    <a-modal title="代码生成" v-model:open="genCodeInfo.visible" @ok="genCodeInfo.ok" class="gen-code-modal">
      <a-form-item label="包名称" required :labelCol="{ span: 4 }" style="margin-top: 20px;">
        <a-input v-model:value="genCodeInfo.data.packageName" placeholder="请输入包名称..." />
      </a-form-item>
      <a-form-item label="模块名称" required :labelCol="{ span: 4 }">
        <a-input v-model:value="genCodeInfo.data.moduleName" placeholder="请输入模块名称..." />
      </a-form-item>
      <div class="tips">
        代码生成数据库实体类和接口类<br>
        <span style="font-weight: bold;">实体类规范：</span>包名称.模块名称.model.数据库表名称(驼峰变换).java<br>
        <span style="font-weight: bold;">接口类规范：</span>包名称.模块名称.api.数据库表名称(驼峰变换)Controller.java<br>
      </div>
    </a-modal>

    <ResRelease :targetType="drawerRes.targetType" :targetId="drawerRes.targetId" :targetSn="drawerRes.targetSn"
      :title="drawerRes.title" :iconFont="drawerRes.iconFont" v-model:visible="drawerRes.visible"></ResRelease>
  </div>
</template>

<script setup lang="ts">
import { useConfigStore } from '@/config'
import { message } from 'ant-design-vue'
import { axios, useDialog } from 'unione-base-vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ResRelease from '@/components/res-release/index.vue'
import api from './api'

const config = useConfigStore().config
const dialog = useDialog()
const router = useRouter()

const queryForm = ref({
  fields: [
    {
      title: '状态',
      name: 'status',
      control: 'unione-select-box',
      convert: {
        types: 'dict',
        dictName: 'PUBLISHSTATUS'
      }
    },
    {
      title: '类别',
      name: 'category',
      control: 'unione-select-box',
      convert: {
        types: 'dict',
        dictName: 'DATACATEGORY'
      }
    }, {
      title: '应用名称',
      name: 'appName',
    },
    {
      title: '数据源',
      name: 'dsName',
    },
  ]
})

const tableList = ref({
  leftBtns: [
    {
      visible: false,
      name: 'delBatch'
    },
    {
      title: '从数据库导入',
      icon: 'FunnelPlotOutlined',
      name: 'impFromDb',
      props: {
        danger: true,
        ghost: true
      }
    },
    {
      title: '代码生成',
      icon: 'CodeOutlined',
      name: 'genCode'
    }
  ],
  rightBtns: [
    {
      visible: false,
      name: 'downTmpl'
    }
  ],
  columns: [
    {
      title: '应用名称',
      name: 'appName',
    },
    {
      title: '数据源',
      name: 'dsName',
    },
    {
      title: '数据类别',
      name: 'category',
    },
    {
      title: '数据标题',
      name: 'title',
    },
    {
      title: '数据名称',
      name: 'name',
    },
    {
      title: '数据编码',
      name: 'sn',
    },
    {
      title: '版本',
      name: 'vers',
    },
    {
      title: '发布时间',
      name: 'publishDate',
    },
    {
      title: '创建时间',
      name: 'created',
    },
    {
      title: '状态',
      name: 'status',
      convert: {
        types: 'dict',
        dictName: 'PUBLISHSTATUS'
      }
    }
  ],
  operation: {
    title: '操作',
    width: 250,
    btns: [
      {
        title: '预览',
        name: 'view'
      },
      {
        title: '发布',
        name: 'release',
        props: {
          ghost: true,
          type: 'primary'
        }
      },
      {
        title: '版本管理',
        name: 'vers'
      },
      {
        title: '配置管理',
        name: 'configs'
      },
      {
        title: '权限管理',
        name: 'permis'
      },
      {
        title: '权限分配',
        name: 'auth'
      },
      {
        name: 'menu',
        title: '菜单管理',
      },
      {
        title: '复制',
        name: 'copy'
      }
    ],
    count: 3,
    more: {
      layout: 'vertical'
    }
  },
})
onMounted(() => {
  loadData()
})
const dataList = ref<any>({
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
  api
    .find({
      page: dataList.value.pagination.current,
      pageSize: dataList.value.pagination.pageSize,
      body: { ...dataList.value.params, types: 'setting' },
      keywords: dataList.value.keywords
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
function toQuery({ params, keywords }: any) {
  dataList.value.pagination.current = 1
  dataList.value.params = params
  dataList.value.keywords = keywords
  loadData()
}
function tableBtnClick({ btn, event, row, rows }: any) {
  console.log('table btn click', btn, event, row)

  if (btn.name == 'add' || btn.name == 'edit') {
    router.push({
      path: '/dev/data/define/edit',
      query: row ? { id: row.id } : {}
    })
  }
  if (btn.name == 'impFromDb') {
    dataTableSelectorRef.value.open()
    tableOptName.value = 'impFromDb'
  }
  if (btn.name == 'release') {
    toRelease(row)
  }
  if (btn.name == 'view') {
    router.push({
      path: config.listPageUrl,
      query: {
        psn: row.sn + ':list',
        model: 'preview'
      }
    })
  }
  if (btn.name == 'genCode') {
    //代码生成
    dataTableSelectorRef.value.open()
    tableOptName.value = 'genCode'
  }
  if (btn.name == 'delete') {
    axios.form({
      url: '/api/data/define/delete',
      method: 'post',
      data: [row.id]
    }).then((res: any) => {
      if (res.success) {
        loadData()
      } else {
        dialog.error({
          content: '删除失败',
        })
      }
    })
  }

  if (btn.name == 'menu') {
    drawerRes.value.targetType = 'form'
    drawerRes.value.targetId = row.id
    drawerRes.value.targetSn = row.sn
    drawerRes.value.title = row.title
    drawerRes.value.iconFont = row.iconFont
    drawerRes.value.visible = true
  }
}

const drawerRes = ref({
  visible: false,
  targetType: '',
  targetId: '',
  targetSn: '',
  title: '',
  iconFont: ''
})

function toRelease(row: any) {
  dialog.confirm({
    content: '确定要发布当前数据么？',
    onOk: () => {
      api.release([row.id]).then((result: any) => {
        if (result.success) {
          dialog.success({
            title: '发布成功',
            content: result.body
          })
          loadData()
        } else {
          dialog.error({
            title: '发布失败',
            content: result.body
          })
        }
      })
    }
  })
}
const dataTableSelectorRef = ref()
const tableOptName = ref('impFromDb')
function handelTableSelect(e: any) {
  console.log('table select', e)
  if (tableOptName.value == 'impFromDb') {
    toImportTable(e)
  } else {
    genCodeInfo.value.data.dsId = e.dsId
    genCodeInfo.value.data.tables = e.keys
    genCodeInfo.value.visible = true
  }
}
function toImportTable(selected: any) {
  dialog.confirm({
    content: '确定导入选中的' + selected.keys.length + '条记录么？',
    onOk: () => {
      message.loading('数据导入中...')
      api.impFromDb({
        dsId: selected.dsId,
        tables: selected.keys.join()
      })
        .then((result: any) => {
          message.destroy()
          if (result.success) {
            dialog.success({
              content: result.message
            })
            dataList.value.pagination.current = 1
            loadData()
          } else {
            dialog.error({
              context: result.message
            })
          }
        })
    }
  })
}

const genCodeInfo = ref<any>({
  visible: false,
  data: {
    packageName: 'com.unione.cloud.xxx',
    moduleName: '',
    dsId: null,
    tables: []
  },
  ok: () => {
    if (!genCodeInfo.value.data.packageName) {
      dialog.error({
        content: '请输入包名！'
      })
      return
    }
    if (!genCodeInfo.value.data.moduleName) {
      dialog.error({
        content: '请输入模块名！'
      })
      return
    }
    message.loading('代码生成中...')
    api
      .genCode(genCodeInfo.value.data)
      .then((response: any) => {
        message.destroy()
        const url = window.URL.createObjectURL(response.data)
        const link = document.createElement('a')
        link.href = url
        link.download = 'gencode-' + new Date().getTime() + '.zip'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      })
  }
})

</script>

<style scoped lang="less">
.gen-code-modal {
  .ant-form-item {
    margin-bottom: 5px !important;
  }

  .tips {
    font-size: 12px;
    color: #999;
    margin: 10px;
  }
}
</style>
