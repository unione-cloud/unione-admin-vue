<template>
  <div class="flow-data-bind">
    <div class="btns">
      <a-button type="primary" size="small" @click="toReload()" class="btn-reload">
        <template #icon>
          <ReloadOutlined style="transform: scale(0.95);" />
        </template>
      </a-button>
      <a-button type="primary" size="small" @click="toAdd()" class="btn-add">
        <template #icon>
          <PlusOutlined style="transform: scale(0.95);" />
        </template>
      </a-button>
    </div>
    <div class="field-item" style="background-color: #f5f5f5;">
      <div class="field-item-info">
        <div class="field-item-main">
          <span class="field-item-title">目标字段</span>
          <span class="field-item-equle">=</span>
          <span class="field-item-bind">绑定字段</span>
        </div>
      </div>
      <div class="field-item-actions" style="width:24px;"></div>
    </div>
    <template v-if="modelValue">
      <div class="field-item" v-for="(param, i) in modelValue" :key="i">
        <div class="field-item-info">
          <div class="field-item-main">
            <span class="field-item-title" :title="param.title + '(' + param.name + ')'">{{ param.title }}({{ param.name
            }})</span>
            <span class="field-item-equle">=</span>
            <span class="field-item-bind" @click="dataBind.toBind(param)">{{ param.bindTitle || '未绑定' }}</span>
          </div>
        </div>
        <div class="field-item-actions">
          <a-button type="text" danger size="small" @click="remove(i)" title="删除">
            <template #icon>
              <DeleteOutlined />
            </template>
          </a-button>
        </div>
      </div>
    </template>
    <div class="field-item" v-if="addBind.visible">
      <div class="field-item-info">
        <div class="field-item-main">
          <a-select v-model:value="addBind.field" placeholder="请选择目标字段" :options="addBind.options()" />
        </div>
      </div>
      <div class="field-item-actions">
        <a-button type="text" size="small" @click="addBind.ok" title="确定">
          <template #icon>
            <SaveOutlined />
          </template>
        </a-button>
        <a-button type="text" danger size="small" @click="addBind.cancel" title="取消">
          <template #icon>
            <DeleteOutlined />
          </template>
        </a-button>
      </div>
    </div>

    <div v-if="!modelValue?.length" class="empty-tip">
      暂无参数，请先绑定数据对象
    </div>

    <flow-var-select title="绑定字段" :scope="scope" v-model:visible="dataBind.visible" @ok="dataBind.handleBind"
      :target="dataBind.field" />
  </div>
</template>
<script setup lang="ts">
import { DeleteOutlined } from '@ant-design/icons-vue'
import { inject, onMounted, ref, watch } from 'vue'
import { loadFormDataModelById } from '../lib/flowUtil'
import { axios, useDialog } from 'unione-base-vue'

const props = defineProps({
  scope: {
    type: Array<string>,
    default: () => ['flowVar', 'nodeVar', 'formVar', 'dataNode', 'sysVar', 'expVar']
  },
  dataType: {
    type: String,
    default: 'process'
  },
  formValue: {
    type: Object,
    required: true
  }
})
const dialog = useDialog()
const emit = defineEmits(['change'])
const modelValue = defineModel('value', {
  type: Array<any>,
})

const optionList = ref<any>([])
/**
 * 加载目标字段列表
 */
function loadOptionList() {
  const dataType = props.formValue[props.dataType]
  if (props.dataType == 'form' || dataType == 'form') {
    // 获取数据表单字段
    if (!props.formValue.formSn) {
      return
    }
    loadFormDataModelById(props.formValue.formSn).then((res: any) => {
      optionList.value = []
      if (res) {
        const dataModel = res.filter((item: any) => item.group == 'master')
        if (dataModel[0]?.fields) {
          optionList.value = dataModel[0].fields.map((item: any) => ({
            label: item.title + '(' + item.name + ')',
            value: item.name,
            title: item.title
          }))
        }
      }
    })
  } else if (props.dataType == 'api' || dataType == 'api') {
    // 获取接口字段列表
    optionList.value = []
  } else if (props.dataType == 'subflow' || dataType == 'subflow') {
    if (!props.formValue.flowId) {
      return
    }
    // 获取子流程字段
    axios.flow({
      url: '/api/tmpl/load/flowChart/' + props.formValue.flowId,
      method: 'POST',
    }).then((result: any) => {
      if (result.success && result.body) {
        // 子流程参数
        optionList.value = (result.body.setting?.vars?.global || []).map((item: any) => ({
          label: item.title + '(' + item.name + ')',
          value: item.name,
          title: item.title
        }))
      }
    })
  }
}

const addBind = ref<any>({
  visible: false,
  field: null,
  options: () => {
    const map = modelValue.value?.map((item: any) => item.name)
    return optionList.value.filter((item: any) => !map?.includes(item.name))
  },
  ok: () => {
    if (!addBind.value.field) {
      return
    }
    if (!modelValue.value) {
      modelValue.value = []
    }
    const option = optionList.value.find((item: any) => item.value == addBind.value.field)
    if (!option) {
      return
    }
    modelValue.value.push({
      name: addBind.value.field,
      title: option.title
    })
    addBind.value.field = null
    addBind.value.visible = false
    handleChange()
  },
  cancel: () => {
    addBind.value.visible = false
  }
})
function toAdd() {
  addBind.value.visible = true
  if (!optionList.value?.length) {
    loadOptionList()
  }
}

/**
 * 重新加载数据
 */
function toReload() {
  if (!modelValue.value?.length) {
    doreload()
    return
  }
  dialog.confirm({
    content: '确认重新加载数据吗？',
    onOk: () => {
      doreload()
    }
  })
}
/**
 * 重新加载数据
 */
function doreload() {
  const dataType = props.formValue[props.dataType]
  if (props.dataType == 'form' || dataType == 'form') {
    // 获取数据表单字段
    if (!props.formValue.formSn) {
      return
    }
    loadFormDataModelById(props.formValue.formSn).then((res: any) => {
      modelValue.value = []
      if (res) {
        const dataModel = res.filter((item: any) => item.group == 'master')
        if (dataModel[0]?.fields) {
          modelValue.value = dataModel[0].fields
        }
      }
      handleChange()
    })
  } else if (props.dataType == 'api' || dataType == 'api') {
    // 获取接口字段列表
  } else if (props.dataType == 'subflow' || dataType == 'subflow') {
    if (!props.formValue.flowId) {
      return
    }
    // 获取子流程字段
    axios.flow({
      url: '/api/tmpl/load/flowChart/' + props.formValue.flowId,
      method: 'POST',
    }).then((result: any) => {
      if (result.success && result.body) {
        // 子流程参数
        modelValue.value = result.body.setting?.vars?.global || []
      }
    })
  }
}

// 删除参数
function remove(index: number) {
  try {
    if (modelValue.value && modelValue.value[index]) {
      // 创建新数组，触发响应式更新
      const updatedVars = modelValue.value.filter((_: any, i: number) => i !== index)
      modelValue.value = updatedVars
      handleChange()
    }
  } catch (error) {
    console.error('删除参数失败:', error)
  }
}

const dataBind = ref<any>({
  visible: false,
  field: null,
  toBind: (field: any) => {
    dataBind.value.field = field
    dataBind.value.visible = true
  },
  handleBind: ({ type, table, names, list }: any) => {
    dataBind.value.visible = false
    dataBind.value.field.bindType = type
    dataBind.value.field.bindTitle = list[0].title
    if (table) {
      dataBind.value.field.bindValue = table.dsn + '.' + list[0].name
    } else {
      dataBind.value.field.bindValue = list[0].name
    }
    handleChange()
  }
})

// 数据变更通知
function handleChange() {
  emit('change', modelValue.value)
}

const flowGraph: any = inject('flowGraph')
onMounted(() => {
  if (!modelValue.value) {
    modelValue.value = []
  }
  flowGraph().on('formRef:change', (selected: any) => {
    modelValue.value = []
    optionList.value = []
    if (selected) {
      doreload()
    }
  })
  flowGraph().on('flowRef:change', (selected: any) => {
    modelValue.value = []
    optionList.value = []
    if (selected) {
      doreload()
    }
  })
})

</script>
<style lang="less" scoped>
.flow-data-bind {

  .btns {
    display: flex;
    gap: 4px;
    flex-direction: row;
    justify-content: end;
    margin-bottom: 5px;

    .btn-add {
      cursor: pointer;
      width: 20px;
      height: 20px;
      line-height: 20px;
    }

    .btn-reload {
      cursor: pointer;
      width: 20px;
      height: 20px;
      line-height: 20px;
    }
  }

  .field-item {
    display: flex;
    align-items: center;
    padding: 5px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    margin-bottom: 4px;
    background: #fff;
    transition: all 0.3s;

    &:hover {
      border-color: #1890ff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .title {
      margin-top: 10px;
    }

    .field-item-info {
      flex: 1;
      min-width: 0;
    }

    .field-item-main {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .field-item-title {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 45%;
      font-size: 14px;
    }

    .field-item-equle {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      color: #666;
      width: 20px;
    }

    .field-item-bind {
      background: #f0f5ff;
      color: #1890ff;
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 12px;
      flex-shrink: 0;
      margin-right: 8px;
      width: 40%;
      cursor: pointer;
    }

    .field-item-actions {
      display: flex;
      gap: 2px;
      flex-shrink: 0;
      margin-left: 8px;
    }

    .field-item-actions .ant-btn {
      padding: 2px;
      font-size: 12px;
      width: 24px;
      height: 24px;
      line-height: 1;
    }
  }


  .empty-tip {
    text-align: center;
    padding: 24px;
    color: #999;
    background: #fafafa;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
  }

}
</style>