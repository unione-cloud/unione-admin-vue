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
    <userList :typeList="typeList" :targetType="targetType" :targetValue="targetValue"></userList>

    <template #footer>
      <a-button type="primary" @click="visible = false">确定</a-button>
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
  >
    <userList :typeList="typeList" :targetType="targetType" :targetValue="targetValue"></userList>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import userList from './user-list.vue'

defineOptions({ name: 'UserSelect' })
const props = defineProps({
  title: {
    type: String,
    default: '用户选择'
  },
  typeList: {
    type: Array<String>,
    default: () => ['organ', 'role', 'group', 'post']
  },
  targetType: {
    type: String // organ | role | group | post
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
