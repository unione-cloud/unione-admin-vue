<template>
  <div class="flow-data-bind">
    <a-button type="primary" size="small" @click="toreload()" class="btn-add">
      <template #icon>
        <ReloadOutlined style="transform: scale(0.95);" />
      </template>
    </a-button>
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
    <div v-if="!modelValue?.length" class="empty-tip">
      暂无参数，请先绑定数据对象
    </div>

    <flow-var-select title="绑定字段" :scope="['flowVar', 'nodeVar', 'formVar', 'dataNode', 'sysVar']"
      v-model:visible="dataBind.visible" @ok="dataBind.handleBind" :target="dataBind.field" />
  </div>
</template>
<script setup lang="ts">
import { DeleteOutlined } from '@ant-design/icons-vue'
import { inject, onMounted, ref, watch } from 'vue'
import { loadFormDataModelById } from '../lib/flowUtil'
import { useDialog } from 'unione-base-vue'

const props = defineProps({
  scope: {
    type: Array<string>,
    default: () => ['global', 'local']
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


/**
 * 重新加载数据
 */
function toreload() {
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
  if (dataType == 'form') {
    // 获取数据表单字段
    if (!props.formValue.formId) {
      return
    }
    loadFormDataModelById(props.formValue.formId).then((res: any) => {
      modelValue.value = []
      if (res) {
        const dataModel = res.filter((item: any) => item.group == 'master')
        if (dataModel[0]?.fields) {
          modelValue.value = dataModel[0].fields
        }
      }
      handleChange()
    })
  } else {
    // 获取接口字段列表
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
    dataBind.value.field.bindTitle = list[0].title
    dataBind.value.field.bindValue = list[0].name
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
    if (selected) {
      doreload()
    }
  })
})

</script>
<style lang="less" scoped>
.flow-data-bind {
  .btn-add {
    cursor: pointer;
    margin-top: -20px;
    float: right;
    width: 20px;
    height: 20px;
    line-height: 20px;
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