<template>
  <div class="flow-param" v-if="modelValue">
    <a-button type="primary" size="small" @click="showModal('add')" class="btn-add">
      <template #icon>
        <PlusOutlined style="transform: scale(0.95);" />
      </template>
    </a-button>
    <div class="param-item" v-for="(param, i) in modelValue" :key="i">
      <div class="param-item-info">
        <div class="param-item-main">
          <span class="param-item-title">{{ param.title || '未命名参数' }}</span>
          <span class="param-item-name">{{ param.name || '无名参数' }}</span>
          <span class="param-item-bind">{{ param.bindTitle || '未绑定' }}</span>
        </div>
      </div>
      <div class="param-item-actions">
        <a-button type="text" size="small" @click="showModal('edit', param)" title="编辑">
          <template #icon>
            <EditOutlined />
          </template>
        </a-button>
        <a-button type="text" danger size="small" @click="remove(i)" title="删除">
          <template #icon>
            <DeleteOutlined />
          </template>
        </a-button>
      </div>
    </div>
    <div v-if="!modelValue?.length" class="empty-tip">
      暂无参数，点击右上角添加
    </div>

    <!-- 参数编辑弹窗 -->
    <a-modal v-model:open="visible" title="参数设置" @ok="handleOk" @cancel="handleCancel" width="600px"
      :bodyStyle="{ padding: '24px' }">

      <a-form :model="formData" :rules="formRules" layout="horizontal" ref="formRef" :label-col="{ span: 5 }"
        :wrapper-col="{ span: 20 }">
        <a-form-item label="参数标题" name="title">
          <a-input v-model:value="formData.title" placeholder="请输入参数标题" />
        </a-form-item>
        <a-form-item label="参数名称" name="name">
          <a-input v-model:value="formData.name" placeholder="请输入参数名称" />
        </a-form-item>
        <a-form-item label="参数类型" name="dataType">
          <a-select v-model:value="formData.dataType" placeholder="请选择参数类型">
            <a-select-option value="String">字符串</a-select-option>
            <a-select-option value="Integer">数值</a-select-option>
            <a-select-option value="Date">日期</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="绑定类型" name="assignType">
          <a-select v-model:value="formData.bindType" placeholder="请选择赋值方式">
            <a-select-option value="formVar">表单字段</a-select-option>
            <a-select-option value="flowVar">流程变量</a-select-option>
            <a-select-option value="system">系统参数</a-select-option>
            <a-select-option value="custom">自定义</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="绑定字段" name="bindValue" v-if="['formVar', 'flowVar', 'system'].includes(formData.bindType)">
          <a-select v-model:value="formData.bindValue" :options="systemVars" placeholder="请选择系统变量"
            v-if="formData.bindType === 'system'" @select="handelSelect"> </a-select>
          <flow-form-var v-model:value="formData.bindValue" v-if="formData.bindType === 'formVar'"
            @select="formVarSelect"></flow-form-var>
          <a-tree-select v-model:value="formData.bindValue" placeholder="请选择流程变量" :treeLine="{ showLine: true }"
            :tree-data="flowVars" @select="handelSelect" v-if="formData.bindType === 'flowVar'">
          </a-tree-select>
        </a-form-item>
        <a-form-item label="参数数值" name="bindValue" v-if="formData.bindType === 'custom'">
          <!-- 自定义赋值，根据变量类型切换输入控件 -->
          <template v-if="formData.dataType === 'String'">
            <a-input v-model:value="formData.bindValue" placeholder="请输入参数值" />
          </template>
          <template v-else-if="formData.dataType === 'Integer'">
            <a-input-number v-model:value="formData.bindValue" placeholder="请输入参数值" style="width: 100%" />
          </template>
          <template v-else-if="formData.dataType === 'Date'">
            <a-date-picker v-model:value="formData.bindValue" placeholder="请选择日期" style="width: 100%" />
          </template>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import { utils } from 'unione-base-vue'
import { onMounted, ref, reactive, watch, computed, inject } from 'vue'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import type { FormInstance } from 'ant-design-vue'

const props = defineProps({
  scope: {
    type: Array<string>,
    default: () => ['global', 'local']
  }
})
const modelValue = defineModel('value', {
  type: Array<any>,
})
const emit = defineEmits(['change'])
const visible = ref(false)
const formRef = ref<FormInstance | null>(null)
const currentMode = ref<'add' | 'edit'>('add')
const currentVar = ref()

watch(() => modelValue.value, () => {
  if (!modelValue.value) {
    modelValue.value = []
  }
}, { immediate: true })

// 表单数据
const formData = reactive({
  title: '',
  name: '',
  dataType: 'String',
  bindType: 'custom',
  bindValue: '',
  bindTitle: ''
})
// 表单校验规则
const formRules = ref({
  title: [{ required: true, message: '请输入参数标题' }],
  name: [{ required: true, message: '请输入参数名称' }],
  dataType: [{ required: true, message: '请选择参数类型' }],
  bindType: [{ required: true, message: '请选择绑定类型' }],
  bindValue: [{ required: true, message: '请输入绑定字段' }]
})

// 显示弹窗
function showModal(mode: 'add' | 'edit', varItem?: any) {
  currentMode.value = mode
  // 如果传入了tabKey，使用传入的，否则使用当前活动的
  currentVar.value = null

  if (mode === 'add') {
    // 重置表单
    Object.assign(formData, {
      title: '',
      name: '',
      dataType: 'String',
      bindType: 'custom',
      bindValue: '',
      bindTitle: '',
    })
  } else if (mode === 'edit' && varItem) {
    // 填充表单数据
    Object.assign(formData, {
      title: varItem.title || '',
      name: varItem.name || '',
      dataType: varItem.dataType || 'String',
      bindType: varItem.bindType || 'custom',
      bindValue: varItem.bindValue || '',
      bindTitle: varItem.bindTitle || '',
    })
    currentVar.value = varItem
  }

  visible.value = true
}

const systemVars = ref([
  { label: '当前时间', value: 'now', dataType: 'Timestamp' },
  { label: '用户ID', value: 'userId', dataType: 'Long' },
  { label: '用户名', value: 'userName', dataType: 'String' },
  { label: '机构ID', value: 'orgId', dataType: 'Long' },
  { label: '机构名称', value: 'orgName', dataType: 'String' },
  { label: '租户ID', value: 'tenantId', dataType: 'Long' },
  { label: '流程定义ID', value: 'flowDefId', dataType: 'Long' },
  { label: '流程实例ID', value: 'flowInsId', dataType: 'Long' },
  { label: '流程节点ID', value: 'flowNodeId', dataType: 'Long' },
  { label: '流程任务ID', value: 'flowTaskId', dataType: 'Long' }
])
const flowGraph = inject<Function>('flowGraph')
const activeNode = inject<Function>('activeNode')
const flowVars = computed(() => {
  const vars: any = []

  const flowVars = flowGraph && flowGraph().getJson().setting?.vars || {}
  const nodeVars = activeNode && activeNode().data?.vars || {}
  if (flowVars?.global) {
    const fields = (flowVars.global || []).map((item: any) => {
      return {
        label: item.title,
        value: item.name,
        dataType: item.dataType
      }
    })
    vars.push({
      label: '流程变量',
      value: 'flowVar',
      selectable: false,
      children: fields || [],
      isLeaf: false
    })
  }
  if (nodeVars) {
    if (!nodeVars.local) {
      nodeVars.local = []
    }
    if (!nodeVars.global) {
      nodeVars.global = []
    }
    const nvars: any = {
      label: '节点变量',
      value: 'nodeVar',
      selectable: false,
      children: [],
      isLeaf: false
    }
    vars.push(nvars)

    const global = nodeVars.global.map((item: any) => {
      return {
        label: item.title,
        value: item.name,
        dataType: item.dataType
      }
    })
    nvars.children.push({
      label: '全局变量',
      value: 'global',
      selectable: false,
      children: global,
      isLeaf: false
    })

    const local = nodeVars.local.map((item: any) => {
      return {
        label: item.title,
        value: item.name,
        dataType: item.dataType
      }
    })
    nvars.children.push({
      label: '本地变量',
      value: 'local',
      selectable: false,
      children: local,
      isLeaf: false
    })
  }

  return vars;
})

function handelSelect(val: any, item: any) {
  formData.bindTitle = item.label
}
function formVarSelect(val: any, item: any) {
  formData.bindTitle = item.titleFull
}

// 保存参数
async function handleOk() {
  try {
    // 校验表单
    await formRef.value?.validate()
    // 确保当前标签页的数据存在currentVar
    if (!modelValue.value) {
      modelValue.value = []
    }

    if (currentMode.value === 'add') {
      // 新增参数
      modelValue.value.push({ ...formData })
    } else {
      utils.obj.set(currentVar.value, formData)
    }
    modelValue.value = [...modelValue.value]
    visible.value = false
    handleChange()
  } catch (error) {
    console.error('保存参数失败:', error)
  }
}

// 取消操作
function handleCancel() {
  visible.value = false
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


</script>
<style lang="less" scoped>
.flow-param {
  .btn-add {
    cursor: pointer;
    margin-top: -20px;
    float: right;
    width: 20px;
    height: 20px;
    line-height: 20px;
  }

  .param-item {
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

    .param-item-info {
      flex: 1;
      min-width: 0;
    }

    .param-item-main {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .param-item-title {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 30%;
      font-size: 14px;
    }

    .param-item-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      color: #666;
      width: 30%;
    }

    .param-item-bind {
      background: #f0f5ff;
      color: #1890ff;
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 12px;
      flex-shrink: 0;
      margin-right: 8px;
      width: 40%;
    }

    .param-item-actions {
      display: flex;
      gap: 2px;
      flex-shrink: 0;
      margin-left: 8px;
    }

    .param-item-actions .ant-btn {
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