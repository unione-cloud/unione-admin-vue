<template>
  <div class="flow-data-bind">
    <a-button type="primary" size="small" @click="toadd()" class="btn-add" v-if="model != 'view'">
      <template #icon>
        <PlusOutlined style="transform: scale(0.95);" />
      </template>
    </a-button>

    <div class="field-item" style="background-color: #f5f5f5;">
      <div class="field-item-info">
        <div class="field-item-main">
          <div class="drag-handle">
          </div>
          <span class="field-item-title">字段标题</span>
          <span class="field-item-name">字段名称</span>
          <span class="field-item-index">显示顺序
            <a-tooltip title="待办，已办列表字段显示顺序">
              <QuestionCircleOutlined class="icon" />
            </a-tooltip>
          </span>
          <span class="field-item-convert">数据转换
            <a-tooltip title="字典转换设置">
              <QuestionCircleOutlined class="icon" />
            </a-tooltip>
          </span>
          <span class="field-item-bind">绑定字段</span>
        </div>
      </div>
      <div class="field-item-actions" style="width:50px;" v-if="model != 'view'"></div>
    </div>
    <draggable v-model="busiFields" @end="handleChange" :animation="300" ghost-class="ghost"
      :handle="[model != 'view' && '.drag-handle']">
      <template #item="{ element, index }">
        <div class="field-item" :key="index">
          <div class="field-item-info">
            <div class="field-item-main" v-if="!editField || index !== editIndex">
              <div class="drag-handle">
                <DragOutlined />
              </div>
              <span class="field-item-title" :title="element.title">{{ element.title }}</span>
              <span class="field-item-name" :title="element.name">{{ element.name }}</span>
              <span class="field-item-index">{{ element.index }}</span>
              <span class="field-item-convert">{{ convertTypes[element.convert?.types] || '无' }}</span>
              <span class="field-item-bind" @click="dataBind.toBind(element)" :title="element.bindTitle">{{
                element.bindTitle || '未绑定' }}</span>
            </div>
            <div class="field-item-main" v-if="index == editIndex">
              <div class="drag-handle">
                <DragOutlined />
              </div>
              <a-input class="field-item-title" v-model:value="element.title"></a-input>
              <a-input class="field-item-name" v-model:value="element.name"></a-input>
              <a-input-number class="field-item-index" v-model:value="element.index" :min="-1" :max="99"
                :step="1"></a-input-number>
              <div class="field-item-convert" @click="toEditConvert(element, index)">
                {{ convertTypes[element.convert?.types] || '无' }}
                <div class="field-convert-setting" v-if="editConvert && element.convert">
                  <unione-convert-setting v-model:value="element.convert"></unione-convert-setting>
                  <div class="opts">
                    <a-button size="small" @click.stop="editConvert = false">确定</a-button>
                  </div>
                </div>
              </div>
              <div class="field-item-bind" @click="dataBind.toBind(element)">{{ element.bindTitle || '未绑定' }}</div>
            </div>
          </div>
          <div class="field-item-actions" v-if="model != 'view'">
            <a-button type="text" size="small" @click="toedit(index)" title="编辑" v-if="index !== editIndex">
              <template #icon>
                <FormOutlined />
              </template>
            </a-button>
            <a-button type="text" size="small" @click="tosave" title="保存" v-if="index == editIndex">
              <template #icon>
                <SaveOutlined />
              </template>
            </a-button>
            <a-button type="text" danger size="small" @click="remove(index)" title="删除">
              <template #icon>
                <DeleteOutlined />
              </template>
            </a-button>
          </div>
        </div>
      </template>
    </draggable>
    <div v-if="!modelValue?.length" class="empty-tip">
      暂无业务字段，请点击右上角按钮添加
    </div>

    <flow-var-select title="绑定字段" :scope="scope" v-model:visible="dataBind.visible" @ok="dataBind.handleBind"
      :target="dataBind.field" :flow-chart="flowChart && flowChart()" :multi="dataBind.multi" />

  </div>
</template>
<script setup lang="ts">
import { DeleteOutlined, EditFilled } from '@ant-design/icons-vue'
import { useDialog } from 'unione-base-vue'
import { computed, inject, onMounted, ref, watch } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps({
  scope: {
    type: Array<string>,
    default: () => ['flowVar', 'sysVar', 'formVar']
  },
  engine: {
    type: Object
  }
})
const dialog = useDialog()
const emit = defineEmits(['change'])
const modelValue = defineModel('value', {
  type: String,
  default: '[]'
})
const busiFields = ref<any>([])
watch(() => modelValue.value, (newVal: string) => {
  if (newVal && (!busiFields.value || busiFields.value.length === 0)) {
    busiFields.value = JSON.parse(newVal)
  }
})
const editIndex = ref<number>()
const editField = ref<any>()
const editConvert = ref<boolean>(false)
const convertTypes = ref<any>({
  dict: '字典',
  option: '静态',
  local: '接口'
})

const flowChart = inject<Function>('flowChart')
const model = computed(() => props.engine?.model)

/**
 * 添加业务字段
 */
function toadd() {
  dataBind.value.field = null
  dataBind.value.multi = true
  dataBind.value.visible = true
}

function toedit(index: number) {
  editField.value = busiFields.value[index]
  editIndex.value = index
}

function tosave() {
  editField.value = null
  editIndex.value = -1
}

function toEditConvert(element: any, index: number) {
  editConvert.value = true
  if (!element.convert) {
    element.convert = {
      types: 'dict'
    }
  }
  if (!element.convert.types) {
    element.convert.types = 'dict'
  }
}

// 删除参数
function remove(index: number) {
  try {
    if (busiFields.value && busiFields.value[index]) {
      // 创建新数组，触发响应式更新
      const updatedVars = busiFields.value.filter((_: any, i: number) => i !== index)
      busiFields.value = updatedVars
      handleChange()
    }
  } catch (error) {
    console.error('删除参数失败:', error)
  }
}

const dataBind = ref<any>({
  visible: false,
  field: null,
  multi: false,
  toBind: (field: any) => {
    if (model.value == 'view') {
      return
    }
    dataBind.value.field = field
    dataBind.value.visible = true
    dataBind.value.multi = false
  },
  handleBind: ({ type, table, list }: any) => {
    dataBind.value.visible = false

    if (dataBind.value.field) {
      dataBind.value.field.title = list[0].title
      dataBind.value.field.name = list[0].name
      dataBind.value.field.bindType = type
      dataBind.value.field.bindTitle = list[0].title
      if (table) {
        dataBind.value.field.bindValue = table.dsn + '.' + list[0].name
      } else {
        dataBind.value.field.bindValue = list[0].name
      }
      if (list[0].convert) {
        dataBind.value.field.convert = list[0].convert
      }
    }

    const fnames = busiFields.value.map((b: any) => b.name)
    list.filter((item: any) => !fnames.includes(item.name)).forEach((item: any) => {
      const field = {
        title: item.title,
        name: item.name,
        index: -1,
        bindTitle: item.title,
        bindType: type,
        bindValue: table ? (table.dsn + '.' + item.name) : item.name,
        convert: item.convert || {}
      }
      busiFields.value.push(field)
    })

    handleChange()
  }
})

// 数据变更通知
function handleChange() {
  modelValue.value = JSON.stringify(busiFields.value)
  emit('change', modelValue.value)
}

onMounted(() => {
  if (!modelValue.value) {
    busiFields.value = []
  }
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

    .drag-handle {
      cursor: move;
      color: #999;
      font-size: 14px;
      transition: color 0.3s;
      width: 15px;

      &:hover {
        color: #1890ff;
      }
    }

    .field-item-title {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 30%;
      font-size: 14px;
    }

    .field-item-name {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 20%;
      font-size: 14px;
    }

    .field-item-index {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 15%;
      font-size: 14px;
    }

    .field-item-convert {
      color: #1890ff;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 15%;
      font-size: 14px;
      cursor: pointer;

      .field-convert-setting {
        position: absolute;
        background-color: #FFFFFF;
        border: 1px solid #d9d9d9;
        padding: 5px;
        border-radius: 4px;

        .unione-convert-setting {
          display: flex;
          flex-direction: column;
        }

        .opts {
          text-align: right;
          margin: 5px;
        }
      }
    }

    .field-item-bind {
      background: #f0f5ff;
      color: #1890ff;
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 12px;
      flex-shrink: 0;
      margin-right: 8px;
      width: 20%;
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