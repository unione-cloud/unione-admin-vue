<template>
  <div class="flow-data-filter">
    <a-button type="primary" size="small" @click="toAdd()" class="btn-add">
      <template #icon>
        <PlusOutlined style="transform: scale(0.95);" />
      </template>
    </a-button>
    <template v-if="modelValue">
      <draggable v-model="modelValue" @end="handleChange" :animation="300" ghost-class="ghost" handle=".drag-handle">
        <template #item="{ element, index }">
          <div class="filter-item" :key="index">
            <div class="field-opts">
              <a-switch v-model:checked="element.fun" checked-value="AND" un-checked-value="OR" checked-children="AND"
                un-checked-children="OR"></a-switch>
              <div>
                <a-button size="small" @click="toEdit(element, index)" class="btn-save"
                  v-if="!editObj || editObj.index != index">
                  <template #icon>
                    <FormOutlined />
                  </template>
                </a-button>
                <template v-else>
                  <a-button size="small" @click="editObj.cancel" class="btn-cancel">
                    <template #icon>
                      <CloseOutlined />
                    </template>
                  </a-button>
                  <a-button size="small" @click="editObj.save" class="btn-save">
                    <template #icon>
                      <SaveOutlined />
                    </template>
                  </a-button>
                </template>
                <a-button size="small" @click="remove(index)" class="btn-delete">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </div>
            </div>
            <div class="field-box">
              <span class="box-item field-label">过滤字段:</span>
              <template v-if="!editObj || editObj.index != index">
                <div class="box-item field-list">{{ element.title }}</div>
                <div class="box-item field-action">{{optAdd.actions.find((item: any) => item.value ==
                  element.action)?.label}}</div>
              </template>
              <template v-else>
                <a-select class="box-item field-list" v-model:value="element.name" :options="dataFields"
                  placeholder="请选择字段" @select="editObj.selectField"></a-select>
                <a-select class="box-item field-action" v-model:value="element.action" :options="optAdd.actions"
                  placeholder="请选择操作"></a-select>
              </template>
            </div>
            <div class="field-box">
              <span class="box-item field-label">条件字段:</span>
              <template v-if="!editObj || editObj.index != index">
                <div class="box-item field-list">{{optAdd.paramTypes.find((item: any) => item.value ==
                  element.paramType)?.label}}</div>
                <div class="box-item field-action">{{ element.paramTitle }}</div>
              </template>
              <template v-else>
                <a-select class="box-item field-list" v-model:value="element.paramType" :options="optAdd.paramTypes"
                  placeholder="请选择数据来源" @select="optAdd.select"></a-select>
                <a-select class="box-item field-action" v-model:value="element.paramValue"
                  :options="optAdd.paramFields[element.paramType]" placeholder="请选择数据字段" @select="editObj.selectParam"
                  v-if="['sysVar', 'flowVar', 'dataNode'].includes(element.paramType)"></a-select>
                <a-tree-select class="box-item field-action" v-else v-model:value="optAdd.item.paramValue"
                  placeholder="请选择数据字段" :treeLine="{ showLine: true }"
                  :tree-data="optAdd.paramFields[optAdd.item.paramType]" @select="optAdd.selectParam">
                </a-tree-select>
              </template>
            </div>
          </div>
        </template>
      </draggable>
      <div class="filter-item add" v-if="optAdd.visible">
        <div class="field-opts">
          <a-switch v-model:checked="optAdd.item.fun" checked-value="AND" un-checked-value="OR" checked-children="AND"
            un-checked-children="OR"></a-switch>
          <div>
            <a-button size="small" @click="optAdd.cancel" class="btn-cancel">
              <template #icon>
                <CloseOutlined />
              </template>
            </a-button>
            <a-button size="small" @click="optAdd.save" class="btn-save">
              <template #icon>
                <SaveOutlined />
              </template>
            </a-button>
          </div>
        </div>
        <div class="field-box">
          <span class="box-item field-label">过滤字段:</span>
          <a-select class="box-item field-list" v-model:value="optAdd.item.name" :options="dataFields"
            placeholder="请选择字段" @select="optAdd.selectField"></a-select>
          <a-select class="box-item field-action" v-model:value="optAdd.item.action" :options="optAdd.actions"
            placeholder="请选择操作"></a-select>
        </div>
        <div class="field-box">
          <span class="box-item field-label">条件字段:</span>
          <a-select class="box-item field-list" v-model:value="optAdd.item.paramType" :options="optAdd.paramTypes"
            placeholder="请选择数据来源" @select="optAdd.select"></a-select>
          <a-select class="box-item field-action" v-model:value="optAdd.item.paramValue"
            :options="optAdd.paramFields[optAdd.item.paramType]" placeholder="请选择数据字段" @select="optAdd.selectParam"
            v-if="['sysVar', 'flowVar', 'dataNode'].includes(optAdd.item.paramType)"></a-select>
          <a-tree-select class="box-item field-action" v-else v-model:value="optAdd.item.paramValue"
            placeholder="请选择数据字段" :treeLine="{ showLine: true }" :tree-data="optAdd.paramFields[optAdd.item.paramType]"
            @select="optAdd.selectParam">
          </a-tree-select>
        </div>
      </div>
    </template>
    <div v-if="!modelValue?.length && !optAdd.visible" class="empty-tip">
      {{ emptyTip }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { DeleteOutlined } from '@ant-design/icons-vue'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { loadFormDataModelById, loadFormDataModels, loadNodeVar, loadPreLoadDataNode } from '../lib/flowUtil'
import { useDialog } from 'unione-base-vue'
import draggable from 'vuedraggable'
import { useConfigStore } from '@/config'

const config = useConfigStore()
const props = defineProps({
  emptyTip: {
    type: String,
    default: '暂无过滤条件'
  },
  scope: {
    type: Array<string>,
    default: () => ['flowVar', 'nodeVar', 'formVar', 'dataNode', 'sysVar']   // formVar:表单变量，dataNode：数据节点,sysVar:系统变量
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
const optAdd = ref<any>({
  visible: false,
  paramTypes: [{
    label: '流程变量',
    value: 'flowVar'
  }, {
    label: '节点变量',
    value: 'nodeVar'
  }, {
    label: '表单字段',
    value: 'formVar'
  }, {
    label: '数据节点',
    value: 'dataNode'
  }, {
    label: '系统变量',
    value: 'sysVar'
  }],
  paramFields: {
    sysVar: config.config.flow.systemFieldList.map((f: any) => {
      return {
        ...f,
        title: f.label,
        name: f.value,
      }
    })
  },
  actions: [{
    label: '精确查询',
    value: 'EQ'
  }, {
    label: '小余等于',
    value: 'LT'
  }, {
    label: '大于等于',
    value: 'GT'
  }, {
    label: '模糊查询',
    value: 'LIKE'
  }, {
    label: '左模糊',
    value: 'LIKEL'
  }, {
    label: '右模糊',
    value: 'LIKER'
  }, {
    label: 'IN查询',
    value: 'IN'
  }, {
    label: 'NOT IN',
    value: 'NIN'
  }],
  item: {
    fun: 'AND',
    title: '',
    name: '',
    action: 'EQ',
    paramType: 'flowVar',
    paramValue: ''
  },
  selectField: (v: any, option: any) => {
    optAdd.value.item.title = option.label
  },
  selectParam: (v: any, option: any) => {
    optAdd.value.item.paramTitle = option.title
  },
  cancel: () => {
    optAdd.value.visible = false
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
    modelValue.value = [...modelValue.value]
    handleChange()
  }
})

const editObj = ref<any>({
  field: null,
  index: null,
  selectField: (v: any, option: any) => {
    editObj.value.field.title = option.label
  },
  selectParam: (v: any, option: any) => {
    editObj.value.field.paramTitle = option.title
  },
  cancel: () => {
    editObj.value.field = null
    editObj.value.index = null
  },
  save: () => {
    editObj.value.field = null
    editObj.value.index = null
  },
})
function toEdit(item: any, index: number) {
  loadVars()
  editObj.value.field = item
  editObj.value.index = index
}
/**
 * 重新加载数据
 */
function toAdd() {
  loadVars()
  doreload()
  optAdd.value.visible = true
  optAdd.value.item = {
    fun: 'AND',
    title: '',
    name: '',
    action: 'EQ',
    paramType: 'flowVar',
    paramValue: ''
  }

}

const flowGraph: any = inject('flowGraph')
const activeNode: any = inject('activeNode')
function loadVars() {

  //加载流程变量
  const flowChart = flowGraph().getJson()
  if (props.scope.includes('flowVar')) {
    const flowVars = flowChart.setting?.vars || []
    optAdd.value.paramFields.flowVar = []
    if (flowVars?.global) {
      optAdd.value.paramFields.flowVar = flowVars.global.map((item: any) => {
        return {
          ...item,
          label: item.title,
          value: item.name
        }
      })
    }
  }

  const currNode = activeNode()
  //加载节点变量
  if (props.scope.includes('nodeVar')) {
    optAdd.value.paramFields.nodeVar = []
    loadNodeVar(flowChart, currNode).then((vars: any) => {
      if (!vars.local) {
        vars.local = []
      }
      if (!vars.global) {
        vars.global = []
      }
      optAdd.value.paramFields.nodeVar = [{
        label: '全局变量',
        value: 'global',
        selectable: false,
        children: vars.global.map((item: any) => {
          return {
            ...item,
            label: item.title,
            value: item.name,
          }
        })
      }, {
        label: '局部变量',
        value: 'local',
        selectable: false,
        children: vars.local.map((item: any) => {
          return {
            ...item,
            label: item.title,
            value: item.name,
          }
        })
      }]
    })
  }

  // 加载表单数据模型
  if (props.scope.includes('formVar')) {
    loadFormDataModels(flowGraph(), currNode).then((models: any) => {
      optAdd.value.paramFields.formVar = []
      if (models?.length) {
        optAdd.value.paramFields.formVar = models.filter((item: any) => item.group != 'sub').map((item: any) => {
          return {
            title: item.title,
            value: item.dsn,
            selectable: false,
            children: item.fields.map((f: any) => {
              return {
                ...f,
                value: f.name
              }
            })
          }
        })
      }
    })
  }

  //加载数据节点变量
  if (props.scope.includes('dataNode')) {
    optAdd.value.paramFields.dataNode = []
    loadPreLoadDataNode(flowChart, currNode).then((node: any) => {
      if (node.data?.process == 'form' && node.data?.formId) {
        loadFormDataModelById(node.data.formId).then((models: any) => {
          const master = models.filter((m: any) => m.group == 'master')[0]
          if (master) {
            optAdd.value.paramFields.dataNode = master.fields.map((f: any) => {
              return {
                ...f,
                label: f.title,
                value: f.name
              }
            })
          }
        })
      }
    })
  }

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
          dataFields.value = dataModel[0].fields.map((f: any) => {
            return {
              ...f,
              label: f.title,
              value: f.name
            }
          })
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
.flow-data-filter {
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

  .filter-item {
    display: flex;
    flex-direction: column;
    align-items: start;
    line-height: 30px;
    border: 1px solid #d9d9d9;
    padding: 5px;
    margin-bottom: 5px;

    &.add {
      border: 1px dashed #d9d9d9;
    }

    .field-opts {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .btn-cancel {
        margin-right: 5px;
      }

      .btn-delete {
        margin-left: 5px;
      }
    }

    .field-box {
      width: 100%;
      display: flex;

      .field-label {
        width: 60px;
      }

      .field-list {
        width: calc(50% - 35px);
        margin: 0 5px;
      }

      .field-action {
        width: calc(50% - 35px);
      }
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