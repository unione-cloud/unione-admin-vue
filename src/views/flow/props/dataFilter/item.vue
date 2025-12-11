<template>
  <div class="filter-item">
    <div class="field-opts">
      <a-switch v-model:checked="modelValue.fun" checked-value="AND" un-checked-value="OR" checked-children="AND"
        un-checked-children="OR" @change="handelChange"></a-switch>
      <div>
        <template v-if="!modelValue.edit">
          <a-button size="small" @click="toEdit()" class="btn-edit">
            <template #icon>
              <FormOutlined />
            </template>
          </a-button>
          <a-button size="small" @click="toAdd()" class="btn-addc">
            <template #icon>
              <PlusOutlined />
            </template>
          </a-button>
        </template>
        <template v-else>
          <a-button size="small" @click="toCancel" class="btn-cancel">
            <template #icon>
              <CloseOutlined />
            </template>
          </a-button>
          <a-button size="small" @click="toSave" class="btn-save">
            <template #icon>
              <SaveOutlined />
            </template>
          </a-button>
        </template>
        <a-button size="small" @click="toRemove" class="btn-delete">
          <template #icon>
            <DeleteOutlined />
          </template>
        </a-button>
      </div>
    </div>
    <div class="field-box" v-if="!modelValue.children?.length">
      <span class="box-item field-label">过滤字段:</span>
      <template v-if="!modelValue.edit">
        <div class="box-item field-list">{{ modelValue.title }}</div>
        <div class="box-item field-action">{{actions.find((item: any) => item.value ==
          modelValue.action)?.label}}</div>
      </template>
      <template v-else>
        <a-select class="box-item field-list" v-model:value="modelValue.name" :options="dataFields" placeholder="请选择字段"
          @select="selectField"></a-select>
        <a-select class="box-item field-action" v-model:value="modelValue.action" :options="actions" placeholder="请选择操作"
          @change="handelChange"></a-select>
      </template>
    </div>
    <div class="field-box" v-if="!modelValue.children?.length">
      <span class="box-item field-label">条件字段:</span>
      <template v-if="!modelValue.edit">
        <div class="box-item field-list">{{paramTypes.find((item: any) => item.value ==
          modelValue.paramType)?.label}}</div>
        <div class="box-item field-action">{{ modelValue.paramTitle }}</div>
      </template>
      <template v-else>
        <a-select class="box-item field-list" v-model:value="modelValue.paramType" :options="paramTypes"
          placeholder="请选择数据来源" @change="handelChange"></a-select>
        <a-select class="box-item field-action" v-model:value="modelValue.paramValue"
          :options="paramFields[modelValue.paramType]" placeholder="请选择数据字段" @select="selectParam"
          v-if="['sysVar', 'flowVar', 'dataNode'].includes(modelValue.paramType)"></a-select>
        <a-tree-select class="box-item field-action" v-else v-model:value="modelValue.paramValue" placeholder="请选择数据字段"
          :treeLine="{ showLine: true }" :tree-data="paramFields[item.paramType]" @select="selectParam">
        </a-tree-select>
      </template>
    </div>
    <div class="filter-children" v-if="modelValue.children?.length">
      <FlowDataFilterItem v-for="(child, i) in modelValue.children" :key="i" :index="i" :item="child" :scope="scope"
        :dataType="dataType" :formValue="formValue" @change="(e: any) => handleChildChange(child, e)"
        @delete="toDeleteChild"></FlowDataFilterItem>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useConfigStore } from '@/config'
import { DeleteOutlined } from '@ant-design/icons-vue'
import { useDialog, utils } from 'unione-base-vue'
import { handleError, inject, onMounted, ref, watch } from 'vue'
import { loadFormDataModelById, loadFormDataModels, loadNodeVar, loadPreLoadDataNode } from '../../lib/flowUtil'

defineOptions({
  name: 'FlowDataFilterItem'
})
const config = useConfigStore()
const props = defineProps({
  index: {
    type: Number,
    required: true
  },
  item: {
    type: Object,
    required: true
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
const emit = defineEmits(['change', 'delete'])
const modelValue = ref<any>({})
const dataFields = ref<any[]>([])
const paramTypes = ref([{
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
}])
const paramFields = ref<any>({
  sysVar: config.config.flow.systemFieldList.map((f: any) => {
    return {
      ...f,
      title: f.label,
      name: f.value,
    }
  })
})
const actions = ref([{
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
}])
function toEdit() {
  loadVars()
  doreload()
  modelValue.value.edit = true
}
/**
 * 重新加载数据
 */
function toAdd() {
  loadVars()
  doreload()
  if (!modelValue.value.children) {
    modelValue.value.children = [{
      fun: 'AND',
      title: modelValue.value.title || '',
      name: modelValue.value.name || '',
      action: modelValue.value.action || 'EQ',
      paramType: modelValue.value.paramType || 'flowVar',
      paramValue: modelValue.value.paramValue || '',
      edit: true
    }]
    modelValue.value.title = ''
    modelValue.value.name = ''
    modelValue.value.paramType = ''
    modelValue.value.paramValue = ''
  } else {
    modelValue.value.children.push({
      fun: 'AND',
      title: '',
      name: '',
      action: 'EQ',
      paramType: 'flowVar',
      paramValue: '',
      edit: true
    })
  }
}

function toCancel() {
  modelValue.value.edit = false
  emit('change', { ...props.item, edit: false })
}

function toSave() {
  modelValue.value.edit = false
  emit('change', modelValue.value)
}

function toRemove() {
  emit('delete', props.index)
}

function selectField(v: any, option: any) {
  modelValue.value.title = option.title
  emit('change', modelValue.value)
}

function selectParam(v: any, option: any) {
  modelValue.value.paramTitle = option.title
  emit('change', modelValue.value)
}

function handelChange() {
  emit('change', modelValue.value)
}
function handleChildChange(child: any, e: any) {
  utils.obj.set(child, e)
  if (!child.edit) {
    delete child.edit
  }
  handelChange()
}

function toDeleteChild(index: number) {
  modelValue.value.children.splice(index, 1)
  handelChange()
}

watch(() => props.item.edit, () => {
  modelValue.value.edit = props.item.edit
})

const flowGraph: any = inject('flowGraph')
const activeNode: any = inject('activeNode')
function loadVars() {

  //加载流程变量
  const flowChart = flowGraph().getJson()
  if (props.scope.includes('flowVar')) {
    const flowVars = flowChart.setting?.vars || []
    paramFields.value.flowVar = []
    if (flowVars?.global) {
      paramFields.value.flowVar = flowVars.global.map((item: any) => {
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
    paramFields.value.nodeVar = []
    loadNodeVar(flowChart, currNode).then((vars: any) => {
      if (!vars.local) {
        vars.local = []
      }
      if (!vars.global) {
        vars.global = []
      }
      paramFields.value.nodeVar = [{
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
      paramFields.value.formVar = []
      if (models?.length) {
        paramFields.value.formVar = models.filter((item: any) => item.group != 'sub').map((item: any) => {
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
    paramFields.value.dataNode = []
    loadPreLoadDataNode(flowChart, currNode).then((node: any) => {
      if (node.data?.process == 'form' && node.data?.formId) {
        loadFormDataModelById(node.data.formId).then((models: any) => {
          const master = models.filter((m: any) => m.group == 'master')[0]
          if (master) {
            paramFields.value.dataNode = master.fields.map((f: any) => {
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

onMounted(() => {
  loadVars()
  doreload()
  modelValue.value = props.item
})

</script>
<style lang="less" scoped>
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
    align-items: center;
    height: 30px;

    .btn-cancel {
      margin-right: 5px;
    }

    .btn-addc {
      margin-left: 5px;
    }

    .btn-delete {
      margin-left: 5px;
    }

    :deep(.ant-btn) {
      display: none;
    }

    &:hover {
      :deep(.ant-btn) {
        display: inline-block;
      }
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

  .filter-children {
    width: 100%;
    padding-left: 10px;
  }
}
</style>