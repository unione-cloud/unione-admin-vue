<template>
  <a-drawer
    :title="title"
    :width="props.width"
    v-if="props.show == 'drawer'"
    v-model:visible="visible"
    :placement="props.position"
    :maskClosable="false"
    :bodyStyle="{ padding: 0 }"
    class="user-select user-select-drawer"
  >
    <UserList
      :limit="limit"
      :typeList="typeList"
      :targetType="targetType"
      :targetValue="targetValue"
      :selected="selected"
      ref="userListObj"
    ></UserList>

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
    class="user-select user-select-dialog"
    @ok="handelOk"
  >
    <UserList
      :limit="limit"
      :typeList="typeList"
      :targetType="targetType"
      :targetValue="targetValue"
      :selected="selected"
      ref="userListObj"
    ></UserList>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDialog } from 'unione-base-vue'
import UserList from './user-list.vue'

const dialog = useDialog()

defineOptions({ name: 'UserSelect' })
const props = defineProps({
  title: {
    type: String,
    default: '用户选择'
  },
  limit: {
    type: Number,
    default: -1
  },
  typeList: {
    type: Array<String>,
    default: () => ['organ', 'role', 'group', 'post']
  },
  targetType: {
    type: String // organ | role | roleAssign | group | post
  },
  targetValue: {
    type: String
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
    default: 550
  }
})
const visible = defineModel('visible')
watch(visible, (val) => {
  if (val) {
    userListObj.value?.init()
  }
})

const emit = defineEmits(['ok'])
const userListObj = ref()
function handelOk() {
  const selected = userListObj.value.getSelected()
  if (selected?.ids?.length > 0) {
    // visible.value = false
    console.log('user selcect ok', selected)
    emit('ok', { ...selected, targetType: props.targetType, targetValue: props.targetValue })
    return
  }
  dialog.warning({ content: '请选择用户' })
}
</script>

<style lang="less" scoped>
.user-select {
  &.user-select-drawer {
    .ant-drawer-footer {
      .ant-btn {
        float: right;
        margin: auto 10px;
      }
    }
  }
}
</style>
