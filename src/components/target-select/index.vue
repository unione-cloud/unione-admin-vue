<template>
  <a-drawer :title="title" :width="props.width" v-if="props.show == 'drawer'" v-model:visible="visible"
    :placement="props.position" :maskClosable="false" class="target-select target-select-drawer">
    <TargetList :typeList="typeList" :position="position" v-model:value="targetValues" v-if="visible"></TargetList>

    <template #footer>
      <a-button type="primary" @click="handelOk">确定</a-button>
      <a-button @click="visible = false">取消</a-button>
    </template>
  </a-drawer>
  <a-modal :title="title" :width="props.width" v-if="props.show == 'dialog'" v-model:open="visible"
    :centered="props.position == 'center'" :maskClosable="false" class="target-select target-select-dialog"
    @ok="handelOk">
    <TargetList :typeList="typeList" :position="position" v-model:value="targetValues" v-if="visible"></TargetList>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDialog } from 'unione-base-vue'
import TargetList from './target-list.vue'

const dialog = useDialog()

defineOptions({ name: 'UserSelect' })
const props = defineProps({
  title: {
    type: String,
    default: '选择目标'
  },
  typeList: {
    type: Array<any>,
    default: () => {
      return [
        { title: '全部', name: 'all', value: '1' },
        // { title: '租户', name: 'tenant', value: '2' },
        { title: '机构', name: 'organ', value: '3' },
        { title: '角色', name: 'role', value: '5' },
        { title: '用户', name: 'user', value: '4' }
      ]
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
    default: 550
  }
})
const visible = defineModel('visible')
const targetValues = ref([])

const emit = defineEmits(['ok'])
function handelOk() {
  if (targetValues.value?.length > 0) {
    // visible.value = false
    emit('ok', targetValues.value)
    return
  }
  dialog.warning({ content: '请选择目标' })
}
</script>

<style lang="less" scoped>
.target-select {
  &.target-select-drawer {
    .ant-drawer-footer {
      .ant-btn {
        float: right;
        margin: auto 10px;
      }
    }
  }
}
</style>
