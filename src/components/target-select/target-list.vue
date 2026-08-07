<template>
  <div class="target-list">
    <div v-if="title" class="title">{{ title }}</div>
    <a-tabs v-model:activeKey="activeKey" size="small">
      <template v-for="(type, i) in dataList" :key="i">
        <a-tab-pane :tab="type.title">
          <div class="view-card" v-if="showType == 'card' && showField"></div>
          <div class="view-tag" v-if="showType == 'tag'">
            <template v-if="type.name != 'all' && type.name != 'tenant'">
              <template v-for="(target, j) in type.list" :key="j">
                <a-tag :closable="!disabled && widgetModel != 'view'" @close="toDel(target)">{{ target.targetName
                }}</a-tag>
              </template>
              <a-tag v-if="!disabled && widgetModel != 'view'" class="btn-add" @click="toAdd(type)">
                <PlusOutlined />
              </a-tag>
            </template>
            <template v-else-if="type.name == 'all'">
              <a-checkbox v-model:checked="type.checked" @change="() => onAllChanged(type)"
                :disabled="widgetModel == 'view' || disabled">平台所有用户</a-checkbox>
            </template>
            <template v-else-if="type.name == 'tenant'">
              <a-checkbox v-model:checked="type.checked" @change="() => onTenantChanged(type)"
                :disabled="widgetModel == 'view' || disabled">系统所有用户</a-checkbox>
            </template>
            <a-empty v-if="!type.list || !type.list.length"></a-empty>
          </div>
        </a-tab-pane>
      </template>
    </a-tabs>

    <!-- 机构选择组件 -->
    <UnioneOrganSelect v-model:visible="organSelect.visible" :selected="dataIds" :position="position"
      @ok="organSelect.ok">
    </UnioneOrganSelect>

    <!-- 用户选择组件 -->
    <UnioneUserSelect v-model:visible="userSelect.visible" :selected="dataIds" :position="position" @ok="userSelect.ok">
    </UnioneUserSelect>

    <!-- 角色选择组件 -->
    <UnioneRoleSelect v-model:visible="roleSelect.visible" :selected="dataIds" mode="disabled" :position="position"
      @ok="roleSelect.ok"></UnioneRoleSelect>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { useDialog } from 'unione-base-vue'
import type { DataStorage, WidgetModel } from 'unione-form-vue/dist/typing'

const dialog = useDialog()

declare type Target = {
  title: string
  name: string //内置目标名称: global | tenant | organ | role | group | post | user | data
  value: string //自定义目标value
  storage?: DataStorage
}

declare type ShowField = { title?: String; name: String }

defineOptions({ name: 'TargetSelect' })
const props = defineProps({
  wid: { type: String, required: false },
  editor: { type: Object, required: false },
  widget: { type: Object as PropType<WidgetModel>, required: false },
  disabled: { type: Boolean, default: false },
  formValue: { type: Object },
  //
  title: { type: String, required: false },
  //目标类型列表
  typeList: {
    type: Array<Target>,
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
  // 异步存储
  storage: { type: Object as PropType<DataStorage>, required: false },
  // 保存模式，sync:同步,async:异步
  model: { type: String, default: 'sync' },
  // 关联字段名称，formValue中的属性名称，支持user.id方式
  refField: { type: String, default: 'id' },
  //业务字段名称：中间关联表的业务字段名称
  bizField: { type: String, required: false },
  //目标显示字段：默认显示目标名称
  showField: { type: Array<ShowField>, required: false },
  //目标显示方式：tag标签，card卡片，list列表，table表格
  showType: { type: String, default: 'tag' },
  position: { type: String, default: 'left' }
})

const activeKey = ref(0)
const modelValue = defineModel<Array<any>>('value')
const dataList = ref<Array<any>>([])
const dataIds = ref<Array<any>>([])

const widgetModel = computed(() => {
  return props.editor?.model.value || 'run'
})

function processInput(data: Array<any>) {
  dataList.value = []
  dataIds.value = []
  const tmap: any = {}
  props.typeList.forEach((type: Target) => {
    tmap[type.value] = { ...type, list: [], checked: false }
    dataList.value.push(tmap[type.value])
  })
  data?.forEach((row: any) => {
    if (!dataIds.value.includes(row.targetId)) {
      dataIds.value.push(row.targetId)
      if (tmap[row.targetType]) {
        tmap[row.targetType].list.push(row)
        if (row.targetType == '1' || row.targetType == '2') {
          tmap[row.targetType].checked = true
        }
      }
    }
  })
}

const organSelect = ref({
  visible: false,
  ok: (e: any) => {
    if (props.model == 'sync') {
      const valueList = modelValue.value || []
      e.list.forEach((item: any) => {
        if (!dataIds.value.includes(item.id)) {
          dataIds.value.push(item.id)
          valueList.push({ targetType: '3', targetId: item.id, targetName: item.title, targetSn: item.sn, targetTitle: item.title })
        }
      })
      modelValue.value = valueList
      processInput(valueList)
    }
    organSelect.value.visible = false
  }
})
const roleSelect = ref({
  visible: false,
  ok: (e: any) => {
    if (props.model == 'sync') {
      const valueList = modelValue.value || []
      e.list.forEach((item: any) => {
        if (!dataIds.value.includes(item.id)) {
          dataIds.value.push(item.id)
          valueList.push({ targetType: '5', targetId: item.id, targetName: item.title, targetSn: item.sn, targetTitle: item.title })
        }
      })
      modelValue.value = valueList
      processInput(valueList)
    }
    roleSelect.value.visible = false
  }
})
const userSelect = ref({
  visible: false,
  ok: (e: any) => {
    if (props.model == 'sync') {
      const valueList = modelValue.value || []
      e.list.forEach((item: any) => {
        if (!dataIds.value.includes(item.id)) {
          dataIds.value.push(item.id)
          valueList.push({ targetType: '4', targetId: item.id, targetName: item.title, targetSn: item.username, targetTitle: item.title })
        }
      })
      modelValue.value = valueList
      processInput(valueList)
    }
    userSelect.value.visible = false
  }
})

function toAdd(type: Target) {
  if (type.name == 'organ') {
    organSelect.value.visible = true
  } else if (type.name == 'role') {
    roleSelect.value.visible = true
  } else if (type.name == 'user') {
    userSelect.value.visible = true
  }
}
function toDel(target: any) {
  if (props.model == 'sync') {
    modelValue.value = modelValue.value?.filter((item: any) => item.targetId != target.targetId)
    dataIds.value = dataIds.value?.filter((item: any) => item != target.targetId)
    processInput(modelValue.value || [])
    emit('change', modelValue.value || [])
  }
}
function onAllChanged(type: any) {
  if (type.checked) {
    dialog.confirm({
      content: '确定要发送给所有用户么？',
      onOk: () => {
        dataList.value.forEach((item: any) => {
          item.list = []
        })
        modelValue.value = [{ targetType: '1', targetId: '1', targetName: '平台用户' }]
        emit('change', modelValue.value || [])
      },
      onCancel: () => {
        type.checked = !type.checked
      }
    })
  }
}
function onTenantChanged(type: any) {
  if (type.checked) {
    dialog.confirm({
      content: '确定要发送给所有用户么？',
      onOk: () => {
        dataList.value.forEach((item: any) => {
          item.list = []
        })
        modelValue.value = [{ targetType: '2', targetId: '2', targetName: '当前租户用户' }]
        emit('change', modelValue.value || [])
      },
      onCancel: () => {
        type.checked = !type.checked
      }
    })
  }
}

onMounted(() => {
  if (props.model == 'sync') {
    if (!modelValue.value) {
      modelValue.value = []
    }
    processInput(modelValue.value)
  }
})

watch(
  () => modelValue,
  () => {
    if (props.model == 'sync') {
      console.log('modelValue', modelValue.value)
      processInput(modelValue.value || [])
    }
  },
  { deep: true }
)

const emit = defineEmits(['change'])
</script>

<style lang="less" scoped>
.target-list {
  .view-tag {
    margin-top: -3px;
    min-height: 170px;

    .btn-add {
      cursor: pointer;
    }

    .btn-add:hover {
      .anticon {
        transform: rotate(135deg);
        transition: transform 0.5s ease; // 添加过渡效果，让旋转更平滑
      }
    }
  }
}
</style>
