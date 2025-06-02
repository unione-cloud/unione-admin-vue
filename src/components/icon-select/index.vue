<template>
  <div class="icon-select">
    <div class="icon-box" @click="toSelect">
      <component class="view" v-if="iconValue" :is="iconValue"></component>
      <span class="empty" v-else>
        <span>选择</span>
        <component :is="'SearchOutlined'"></component>
      </span>
    </div>
    <a-drawer
      :title="title"
      :width="props.width"
      v-if="props.show == 'drawer'"
      v-model:visible="visible"
      :placement="props.position"
      :maskClosable="false"
      :bodyStyle="{ padding: 10 }"
      class="icon-select-drawer"
    >
      <IconList ref="listObj"></IconList>
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
      class="icon-select-dialog"
      @ok="handelOk"
    >
      <IconList ref="listObj"></IconList>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDialog } from 'unione-base-vue'
import IconList from './icon-list.vue'

const dialog = useDialog()

defineOptions({ name: 'IconSelect' })
const props = defineProps({
  title: {
    type: String,
    default: '图标选择'
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
    default: 600
  }
})

const iconValue = defineModel('value')

const visible = defineModel('visible')
function toSelect() {
  visible.value = true
}

const emit = defineEmits(['ok', 'change'])
const listObj = ref()
function handelOk() {
  const selected = listObj.value.getSelected()
  if (selected) {
    emit('ok', selected)
    emit('change', selected)
    iconValue.value = selected
    visible.value = false
    return
  }
  dialog.warning({ content: '请选择图标' })
}
</script>

<style lang="less" scoped>
.icon-select {
  .icon-box {
    height: 40px;
    width: 40px;
    cursor: pointer;
    border: 1px solid #d9d9d9;
    text-align: center;
    .view {
      font-size: 35px;
    }
    .empty {
      color: #9b9b9b;
      font-size: 12px;
      .anticon {
        display: block;
      }
    }
  }
}
.icon-select-drawer {
  .ant-drawer-footer {
    .ant-btn {
      float: right;
      margin: auto 10px;
    }
  }
}
</style>
