<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="unione-page form-page data-define-edit">
    <unione-section title="基础信息" type="line">
      <unione-form :form="formBase" ref="formBaseObj"></unione-form>
    </unione-section>

    <unione-section
      class="page-setting-section"
      title="页面配置"
      :type="pageSettingOpen && 'line'"
      :location="pageSettingOpen ? 'left' : 'right'"
      reactive
      v-model="pageSettingOpen"
    >
      <unione-form :form="pageSetting" ref="pageSettingObj"></unione-form>
    </unione-section>

    <a-tabs>
      <a-tab-pane key="field-mange">
        <template #tab> <OrderedListOutlined />字段管理 </template>
        <DataFieldMange v-model="dataValue.configs.fields"></DataFieldMange>
      </a-tab-pane>
      <a-tab-pane key="field-setting">
        <template #tab> <ToolOutlined />字段设置 </template>
        <DataFieldSetting v-model="dataValue.configs.fields"></DataFieldSetting>
      </a-tab-pane>
      <a-tab-pane key="field-fkeys">
        <template #tab> <ApiOutlined />外键设置 </template>
        <DataFieldFKeys v-model="dataValue.configs.fields"></DataFieldFKeys>
      </a-tab-pane>
      <a-tab-pane key="data-filter">
        <template #tab> <FunnelPlotOutlined />数据过滤 </template>
        <DataFilters v-model="dataValue.configs.filters"></DataFilters>
      </a-tab-pane>
    </a-tabs>

    <div class="actions">
      <a-button type="primary" @click="toSave" :loading="loading">保存</a-button>
      <a-button danger @click="toRelease" :loading="loading" v-if="dataValue.id">发布</a-button>
      <a-button @click="goback">返回</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Router, RouteLocationNormalizedLoaded } from 'vue-router'
import { computed, inject, onMounted, ref } from 'vue'
import DataFieldMange from './components/dataFieldMange.vue'
import DataFieldSetting from './components/dataFieldSetting.vue'
import DataFieldFKeys from './components/dataFieldFKeys.vue'
import DataFilters from './components/dataFilters.vue'
import api from './api'
import { message } from 'ant-design-vue'
import { useDialog } from 'unione-base-vue'
const dialog = useDialog()
const route: any | RouteLocationNormalizedLoaded = inject('route') //useRoute()
const router: any = inject('router')

const formBaseObj = ref()
const formBase = ref({
  isPrimary: false,
  fields: [
    {
      title: '数据类型',
      name: 'category',
      control: 'unione-select-box',
      value: 'sql',
      convert: {
        types: 'dict',
        dictName: 'DATACATEGORY'
      }
    },
    {
      title: '数据源',
      name: 'dsId',
      control: 'unione-select-box',
      convert: {
        types: 'local',
        url: '/api/data/source/find',
        search: true
      },
      props: {
        required: true
      }
    },
    {
      title: '自定义',
      name: 'isCustom',
      control: 'unione-switch-box',
      value: 0,
      convert: {
        types: 'dict',
        dictName: 'TUREORFALSE'
      }
    },
    {
      title: '数据标题',
      name: 'title',
      dataLen: 10,
      props: {
        required: true
      }
    },
    {
      title: '数据名称',
      name: 'name',
      props: {
        required: true
      },
      rules: {
        whitespace: true
      }
    },
    {
      title: '数据编码',
      name: 'sn',
      dataLen: 50
    },
    {
      title: '描述',
      name: 'descs',
      control: 'a-textarea',
      view: {
        width: 3
      }
    }
  ],
  setting: {
    showColumn: 2,
    labelWidth: 6
  }
})

const pageSettingObj = ref()
const pageSetting = ref({
  isPrimary: false,
  fields: [
    {
      title: '列表模版',
      name: 'listTmpl',
      control: 'unione-select-box',
      value: 'normal',
      convert: {
        types: 'option',
        options: [{ value: 'normal', label: '标准' }]
      },
      props: {
        required: true
      }
    },
    {
      title: '表单风格',
      name: 'showColumn',
      control: 'unione-select-box',
      value: 2,
      convert: {
        types: 'option',
        options: [
          { value: 1, label: '一列' },
          { value: 2, label: '二列' },
          { value: 3, label: '三列' }
        ]
      },
      props: {
        required: true
      }
    },
    {
      title: '标题宽度',
      name: 'labelWidth',
      control: 'a-input-number',
      value: 9,
      rule: {
        rangeMin: 1,
        rangeMax: 24
      },
      props: {
        required: true
      }
    }
  ],
  setting: {
    showColumn: 2,
    labelWidth: 6
  }
})

const dataValue = ref<any>({
  configs: {
    fields: [],
    filters: []
  }
})

/**
 * 保存数据定义
 */
const loading = ref(false)
function goback() {
  router.back()
}
function toRelease() {
  dialog.confirm({
    content: '确定要发布当前数据么？',
    onOk: () => {
      api.release([dataValue.value.id]).then((result: any) => {
        if (result.success) {
          dialog.success({
            title: '发布成功',
            content: result.body
          })
          loadData(dataValue.value.id)
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
async function toSave() {
  const formBase = await formBaseObj.value.validate()
  const formData = { ...dataValue.value, ...formBase }
  formData.configs.show = await pageSettingObj.value.getValue()

  console.log('formData', formData)
  message.loading({ content: '提交中...' })
  loading.value = true
  api
    .save(formData)
    .then((result: any) => {
      message.destroy()
      if (result.success) {
        dataValue.value = result.body
        formBaseObj.value.setValue(result.body)
        pageSettingObj.value.setValue(result.body.configs?.show || {})
        message.success('保存成功！')
      } else {
        message.error(result.message)
      }
    })
    .finally(() => {
      loading.value = false
    })
}
const pageSettingOpen = ref(false)

onMounted(() => {
  if (route.query.id) {
    loadData(route.query.id)
  }
})

/**
 * 加载数据定义
 * @param id
 */
function loadData(id: any) {
  message.loading({ content: '加载中...' })
  api.detail(id).then((result: any) => {
    if (result.success) {
      dataValue.value = result.body
      formBaseObj.value.setValue(result.body)
      pageSettingObj.value.setValue(result.body.configs?.show || {})

      message.destroy()
    } else {
      message.error(result.message)
    }
  })
}
</script>

<style scoped lang="less">
.data-define-edit {
  overflow-y: auto;
  height: 100%;

  :deep(.page-setting-section) {
    .title {
      font-size: 14px;
    }
    .reactive {
      font-size: 12px;
    }
    &.open {
      .type {
        margin-top: 6px !important;
      }
    }
    &.close {
      .title {
        color: #00bd7e;
      }
      .reactive {
        color: #00bd7e;
      }
    }
  }

  .actions {
    width: 100%;
    bottom: 10px;
    text-align: center;
    .ant-btn {
      margin: 15px 10px;
    }
  }
}
</style>
