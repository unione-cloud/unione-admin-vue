<template>
  <div class="flow-data-filter">
    <a-button type="primary" size="small" @click="toAdd()" class="btn-add">
      <template #icon>
        <PlusOutlined style="transform: scale(0.95);" />
      </template>
    </a-button>
    <template v-if="modelValue">
      <template v-for="(item, index) in modelValue" :key="index">
        <FilterItem :item="item" :index="index" :scope="scope" :dataType="dataType" :formValue="formValue"
          @change="(e: any) => handleChange(item, e)" @delete="toDelete">
        </FilterItem>
      </template>
    </template>
    <div v-if="!modelValue?.length" class="empty-tip">
      {{ emptyTip }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { utils } from 'unione-base-vue'
import FilterItem from './item.vue'
import { inject, onMounted } from 'vue'

defineOptions({
  name: 'FlowDataFilter'
})

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
const emit = defineEmits(['change'])
const modelValue = defineModel('value', {
  type: Array<any>,
  default() {
    return []
  }
})
/**
 * 重新加载数据
 */
function toAdd() {
  if (!modelValue.value) {
    modelValue.value = []
  }
  modelValue.value.push({
    fun: 'AND',
    title: '',
    name: '',
    action: 'EQ',
    paramType: 'flowVar',
    paramValue: '',
    edit: true
  })
}

function toDelete(index: number) {
  modelValue.value.splice(index, 1)
  emit('change', modelValue.value)
}

// 数据变更通知
function handleChange(item: any, event: any) {
  utils.obj.set(item, event);
  if (!item.edit) {
    delete item.edit
  }
  modelValue.value = [...modelValue.value]
  emit('change', modelValue.value)
}

const flowGraph: any = inject('flowGraph')
onMounted(() => {
  flowGraph().on('formRef:change', (selected: any) => {
    modelValue.value = []
    emit('change', modelValue.value)
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