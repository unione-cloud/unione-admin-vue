<template>
  <a-drawer
    :title="title"
    :width="props.width"
    v-if="props.show == 'drawer'"
    v-model:visible="visible"
    :placement="props.position"
    :maskClosable="false"
    :bodyStyle="{ padding: 0 }"
    class="role-select role-select-drawer"
  >
    <roleList :targetType="targetType" :targetValue="targetValue" ref="roleListObj"></roleList>

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
    class="role-select role-select-dialog"
    @ok="handelOk"
  >
    <roleList :targetType="targetType" :targetValue="targetValue" ref="roleListObj"></roleList>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from 'unione-base-vue'
import roleList from './role-list.vue'

const dialog = useDialog()

defineOptions({ name: 'RoleSelect' })
const props = defineProps({
  title: {
    type: String,
    default: '角色选择'
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

const emit = defineEmits(['ok'])
const roleListObj = ref()
function handelOk() {
  const selected = roleListObj.value.getSelected()
  if (selected?.userIds?.length > 0) {
    visible.value = false
    console.log('role selcect ok', selected)
    emit('ok', { ...selected, targetType: props.targetType, targetValue: props.targetValue })
    return
  }
  dialog.warning({ content: '请选择角色' })
}
</script>

<style lang="less" scoped>
.role-select {
  &.role-select-drawer {
    .ant-drawer-footer {
      .ant-btn {
        float: right;
        margin: auto 10px;
      }
    }
  }
}
</style>
