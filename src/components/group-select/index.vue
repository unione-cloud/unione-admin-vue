<template>
  <a-drawer
    :title="title"
    :width="props.width"
    v-if="props.show == 'drawer'"
    v-model:visible="visible"
    :placement="props.position"
    :maskClosable="false"
    :bodyStyle="{ padding: 0 }"
    class="group-select group-select-drawer"
  >
    <groupSelect :targetType="targetType" :targetValue="targetValue" ref="selectObj"></groupSelect>

    <template #footer>
      <a-button type="primary" @click="handelOk">确定</a-button>
      <a-button @click="visible = false">取消</a-button>
    </template>
  </a-drawer>
  <a-modal
    :title="title"
    :width="props.width"
    v-if="props.show == 'dialog'"
    v-model:open="visible"
    :centered="props.position == 'center'"
    :maskClosable="false"
    class="group-select group-select-dialog"
    @ok="handelOk"
  >
    <groupSelect :targetType="targetType" :targetValue="targetValue" ref="selectObj"></groupSelect>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDialog } from 'unione-base-vue'
import groupSelect from './group-select.vue'

const dialog = useDialog()

defineOptions({ name: 'OrganSelect' })
const props = defineProps({
  title: {
    type: String,
    default: '分组选择'
  },
  targetType: {
    type: String // user
  },
  targetValue: {
    type: String
  },
  show: {
    type: String,
    default: 'drawer' // drawer | dialog
  },
  position: {
    type: String,
    default: 'right' //  right | center | left
  },
  width: {
    type: Number,
    default: 550
  }
})
const visible = defineModel('visible')
watch(visible, (val) => {
  if (val) {
    selectObj.value?.loadTreeData()
  }
})

const emit = defineEmits(['ok'])
const selectObj = ref()
function handelOk() {
  const selected = selectObj.value.getSelected()
  if (selected?.ids?.length > 0) {
    emit('ok', { ...selected, targetType: props.targetType, targetValue: props.targetValue })
    return
  }
  dialog.warning({ content: '请选择分组' })
}
</script>

<style lang="less" scoped>
.group-select {
  &.group-select-drawer {
    .ant-drawer-footer {
      .ant-btn {
        float: right;
        margin: auto 10px;
      }
    }
  }
}
</style>
