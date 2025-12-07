<template>
  <a-drawer :title="title" :width="props.width" v-if="props.show == 'drawer'" v-model:visible="visible"
    :placement="props.position" :maskClosable="false" :bodyStyle="{ padding: 0 }"
    class="form-select form-select-drawer">
    <FormSelect ref="selectObj" :selected="selected" @select="handelSelect"></FormSelect>
    <template #footer>
      <a-button type="primary" @click="handelOk">确定</a-button>
      <a-button @click="visible = false">取消</a-button>
    </template>
  </a-drawer>
  <a-modal :title="title" :width="props.width" v-if="props.show == 'dialog'" v-model:open="visible"
    :centered="props.position == 'center'" :maskClosable="false" class="form-select form-select-dialog" @ok="handelOk">
    <FormSelect ref="selectObj" :selected="selected" @select="handelSelect"></FormSelect>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDialog } from 'unione-base-vue'
import FormSelect from './form-select.vue'

const dialog = useDialog()

defineOptions({ name: 'FormSelect' })
const props = defineProps({
  title: {
    type: String,
    default: '选择表单'
  },
  selected: {
    type: Array<any>,
    default() {
      return []
    }
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
    default: 700
  }
})
const visible = defineModel('visible')

const emit = defineEmits(['ok'])
const selectObj = ref()
function handelSelect(selected: any) {
  const { id, title, vers, sn } = selected
  emit('ok', { id, title, vers, sn })
}
function handelOk() {
  const selected = selectObj.value.getSelected()
  if (selected?.rows?.length > 0) {
    const { id, title, vers, sn } = selected.rows[0]
    emit('ok', { id, title, vers, sn })
    return
  }
  dialog.warning({ content: '请选择表单' })
}




</script>

<style lang="less" scoped>
.form-select {
  &.form-select-drawer {
    .ant-drawer-footer {
      .ant-btn {
        float: right;
        margin: auto 10px;
      }
    }
  }
}
</style>
