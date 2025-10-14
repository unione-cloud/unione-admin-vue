<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <unione-page-left ref="page" v-bind="unionePage" class="unione-ai-setting" @btnClick="btnClick" @select="selected">
    <template #form-warp v-if="modelVisible && currentProvider?.id">
      <unione-page-list v-bind="defineModel" :params="{ providerId: currentProvider.id }" @btnClick="modelClick"
        ref="modelList"></unione-page-list>
      <a-drawer :title="drawer.title" :width="550" v-model:visible="drawer.visible" :placement="drawer.placement"
        class="drawer-form">
        <unione-form :form="drawer.form" ref="form"></unione-form>

        <div class="btns">
          <a-button type="primary" @click="drawer.tosave">保存</a-button>
          <a-button @click="drawer.visible = false">取消</a-button>
        </div>
      </a-drawer>
    </template>

  </unione-page-left>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { axios } from 'unione-base-vue'

const page = ref() // pageTree dom ref obj
const unionePage = ref<any>({
  storage: { controller: '/api/ai/provider', orderBy: 'ordered asc' },
  fields: [
    {
      title: '名称',
      name: 'name',
      control: 'unione-select-box',
      value: 'ollama',
      required: true,
      convert: { types: 'dict', dictName: 'AIPROVIDER' }
    },

    { title: '标题', name: 'title', required: true, },
    { title: '服务地址', name: 'apiUrl', required: true, },
    { title: '接口key', name: 'apiKey', },
    { title: '显示顺序', name: 'ordered', control: 'a-input-number', value: 1 },
    {
      title: '使用级别',
      name: 'useLevel',
      control: 'unione-radio-box',
      value: 1,
      convert: { types: 'dict', dictName: 'USELEVEL' }
    },
    { title: '描述', name: 'descs', control: 'a-textarea' }
  ],
  opts: ['child'],
  btns: [{ name: 'model', title: '模型管理', disabled: ({ formData }: any) => !formData?.id || formData?.id.startsWith('new_') }],
  setting: { tree: { labelField: 'name' }, form: { showColumn: 1, labelWidth: 4 } },
})

function btnClick({ btn, event }: any) {
  console.log('btnClick', btn, event)
  if (btn.name == 'model') {
    modelVisible.value = true
  } else if (btn.name == 'add') {
    modelVisible.value = false
  }
}
function selected({ event, node }: any) {
  if (node.id?.startsWith('new_')) {
    return
  }
  currentProvider.value = node
  modelList.value?.setParams({ providerId: currentProvider.value.id })
}

function modelClick({ btn, event, row }: any) {
  if (btn.name == 'back') {
    modelVisible.value = false
    page.value.$forceUpdate()
  }
  if (btn.name == 'add') {
    drawer.value.title = '新增模型'
    drawer.value.visible = true
  } else if (btn.name == 'edit') {
    drawer.value.title = '编辑模型'
    drawer.value.visible = true
    drawer.value.placement = 'right'
    drawer.value.row = row
    nextTick(() => {
      form.value.setValue(row)
    })
  }
}
const modelVisible = ref(false)
const currentProvider = ref<any>(null)
const defineModel = ref({
  storage: { controller: '/api/ai/model', findParams: [{ name: 'providerId' }] },
  fields: [
    { title: '模型名称', name: 'name' },
    { title: '模型标题', name: 'title' },
    {
      title: '模型分类',
      name: 'category',
      convert: { types: 'dict', dictName: 'AIMODELTYPE' },
      isQuery: true
    },
    { title: '显示顺序', name: 'ordered' },
    {
      title: '使用级别',
      name: 'useLevel',
      convert: { types: 'dict', dictName: 'USELEVEL' }
    },
    { title: '描述', name: 'descs' }
  ],
  queryBtns: [{ name: 'back', title: '返回', index: 4 }],
  operation: {
    title: '操作',
    width: 130,
    btns: ['view'],
    count: 4
  }
})

const modelList = ref() //modelList dom ref obj
const form = ref() //form ref obj
const drawer = ref({
  title: '新增模型',
  placement: 'left',
  visible: false,
  row: {},
  form: {
    fields: [
      {
        title: '模型名称',
        name: 'name',
        required: true
      },
      {
        title: '模型标题',
        name: 'title',
        required: true
      },
      {
        title: '分类',
        name: 'category',
        control: 'unione-select-box',
        value: 'chat',
        convert: {
          types: 'dict',
          dictName: 'AIMODELTYPE'
        }
      },
      { title: '显示顺序', name: 'ordered', control: 'a-input-number', value: 1 },
      {
        title: '使用级别',
        name: 'useLevel',
        control: 'unione-radio-box',
        value: 2,
        convert: {
          types: 'dict',
          dictName: 'USELEVEL'
        }
      },
      {
        title: '备注',
        control: 'a-textarea',
        name: 'descs'
      }
    ],
    setting: {
      showColumn: 1,
      labelWidth: 5
    }
  },
  tosave: () => {
    form.value.validate().then((data: any) => {
      data = {
        ...drawer.value.row,
        ...data
      }
      modelList.value
        .storage()
        .save({ data })
        .then(() => {
          drawer.value.visible = false
          modelList.value?.reload()
        })
    })
  }
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
