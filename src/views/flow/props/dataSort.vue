<template>
  <div class="flow-field-list">
    <a-button type="primary" size="small" @click="toAdd()" class="btn-add">
      <template #icon>
        <PlusOutlined style="transform: scale(0.95);" />
      </template>
    </a-button>
    <template v-if="modelValue">
      <draggable v-model="modelValue" @end="handleChange" :animation="300" ghost-class="ghost" handle=".drag-handle">
        <template #item="{ element, index }">
          <div class="field-item" :key="element.name">
            <div class="field-item-info">
              <div class="field-item-main">
                <div class="drag-handle">
                  <DragOutlined />
                </div>
                <span class="field-item-title">{{ element.title || '未命名参数' }}</span>
                <span class="field-item-name">{{ element.name || '无名参数' }}</span>
                <span class="field-item-sort" @click="changeSort(element)">{{ element.direction == 'asc' ? '升序' : '降序'
                }}</span>
              </div>
            </div>
            <div class="field-item-actions">
              <a-button type="text" danger size="small" @click="remove(index)" title="删除">
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>
            </div>
          </div>
        </template>
      </draggable>
      <div class="add-sort" v-if="optAdd.visible">
        <a-select v-model:value="optAdd.item.name" :options="fieldOptions" placeholder="请选择字段"
          @select="optAdd.select"></a-select>
        <a-switch v-model:checked="optAdd.item.direction" checked-value="asc" un-checked-value="desc"
          checked-children="升序" un-checked-children="降序" />
        <a-button size="small" @click="optAdd.save" class="btn-save">
          <template #icon>
            <SaveOutlined />
          </template>
        </a-button>
      </div>
    </template>
    <div v-if="!modelValue?.length" class="empty-tip">
      暂无排序字段
    </div>
  </div>
</template>
<script setup lang="ts">
import { DeleteOutlined } from '@ant-design/icons-vue'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { loadFormDataModelById } from '../lib/flowUtil'
import { useDialog } from 'unione-base-vue'
import draggable from 'vuedraggable'

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
const dataFields = ref<any[]>([])
const fieldOptions = computed(() => {
  const options: any = []
  if (dataFields.value?.length) {
    const map: any = modelValue.value?.map((item: any) => item.name)
    dataFields.value.filter((item: any) => !map.includes(item.name))
      .forEach((item: any) => {
        options.push({
          label: item.title,
          value: item.name
        })
      })
  }
  return options;
})
const optAdd = ref<any>({
  visible: false,
  item: {
    name: '',
    title: '',
    direction: 'asc'
  },
  select: (v: any, option: any) => {
    optAdd.value.item.title = option.label
  },
  save: () => {
    if (!optAdd.value.item.name) {
      dialog.error('请选择字段')
      return
    }
    if (!modelValue.value) {
      modelValue.value = []
    }
    modelValue.value.push({ ...optAdd.value.item })
    optAdd.value.visible = false
    optAdd.value.item.name = ''
    optAdd.value.item.title = ''
    optAdd.value.item.direction = 'asc'
    modelValue.value = [...modelValue.value]
    handleChange()
  }
})

/**
 * 重新加载数据
 */
function toAdd() {
  doreload()
  optAdd.value.visible = true
  optAdd.value.item.name = ''
  optAdd.value.item.title = ''
  optAdd.value.item.direction = 'asc'
}
function changeSort(item: any) {
  item.direction = item.direction == 'asc' ? 'desc' : 'asc'
  handleChange()
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
      dataFields.value = []
      if (res) {
        const dataModel = res.filter((item: any) => item.group == 'master')
        if (dataModel[0]?.fields) {
          dataFields.value = dataModel[0].fields
        }
      }
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
    handleChange()
  })
})

</script>
<style lang="less" scoped>
.flow-field-list {
  .btn-add {
    cursor: pointer;
    margin-top: -20px;
    float: right;
    width: 20px;
    height: 20px;
    line-height: 20px;
  }

  .ghost {
    opacity: 0.5;
    background: #c8ebfb;
  }

  .drag-handle {
    cursor: move;
    color: #999;
    margin-right: 8px;
    font-size: 14px;
    transition: color 0.3s;

    &:hover {
      color: #1890ff;
    }
  }

  .add-sort {
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 30px;

    :deep(.ant-select) {
      width: calc(100% - 100px);
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

    .field-item-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      color: #666;
      width: 40%;
    }

    .field-item-sort {
      background: #f0f5ff;
      color: #1890ff;
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 12px;
      flex-shrink: 0;
      margin-right: 8px;
      width: 80px;
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