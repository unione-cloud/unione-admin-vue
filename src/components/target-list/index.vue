<template>
  <div class="target-list"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import { useDialog } from 'unione-base-vue'
import { DataStorage, WidgetModel } from 'unione-form-vue/dist/typing'

const dialog = useDialog()

declare type Target = {
  title: string
  name: string //内置目标名称: global | tenant | organ | role | group | post | user | data
  value: string //自定义目标value
  storage: DataStorage
}

defineOptions({ name: 'UserSelect' })
const props = defineProps({
  wid: {
    type: String,
    required: false
  },
  editor: {
    type: Object,
    required: false
  },
  widget: {
    type: Object as PropType<WidgetModel>,
    required: false
  },
  formValue: {
    type: Object
  },
  typeList: {
    type: Array<Target>,
    reqruied: true
  },
  storage: {
    type: Object as PropType<DataStorage>,
    required: false
  },
  model: {
    type: String, // sync:同步,async:异步
    default: 'async'
  },
  // 关联字段名称
  refField: {
    type: String,
    default: 'id' //formValue中的属性名称，支持user.id方式
  },
  //业务字段名称：中间关联表的业务字段名称
  bizField: {
    type: String,
    required: true
  },
  //目标显示字段：默认显示目标名称，通过该属性可以扩展更多字段，多个字段逗号分隔
  showField: {
    type: String,
    required: false
  },
  //目标显示方式：card卡片，list列表，table表格
  showType: {
    type: String,
    default: 'card'
  }
})

const value = defineModel('value')

const emit = defineEmits(['change'])
</script>

<style lang="less" scoped>
.target-list {
}
</style>
