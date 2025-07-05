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
                <a-tag :closable="!disabled" @close="toDel(target)">{{ target.targetName }}</a-tag>
              </template>
              <a-tag v-if="!disabled" class="btn-add" @click="toAdd(type)"><PlusOutlined /></a-tag>
            </template>
            <template v-else-if="type.name == 'all'">
              <a-checkbox v-model:checked="type.checked">平台所有用户</a-checkbox>
            </template>
            <template v-else-if="type.name == 'tenant'">
              <a-checkbox v-model:checked="type.checked">系统所有用户</a-checkbox>
            </template>
          </div>
          <a-empty
            v-if="type.name != 'all' && (!type.list || !type.list.length) && disabled"
          ></a-empty>
        </a-tab-pane>
      </template>
    </a-tabs>

    <!-- 机构选择组件 -->
    <UnioneOrganSelect
      v-model:visible="organSelect.visible"
      position="left"
      @ok="organSelect.ok"
    ></UnioneOrganSelect>

    <!-- 用户选择组件 -->
    <UnioneUserSelect
      v-model:visible="userSelect.visible"
      position="left"
      @ok="userSelect.ok"
    ></UnioneUserSelect>

    <!-- 角色选择组件 -->
    <UnioneRoleSelect
      v-model:visible="roleSelect.visible"
      mode="disabled"
      position="left"
      @ok="roleSelect.ok"
    ></UnioneRoleSelect>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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

defineOptions({ name: 'UserSelect' })
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
        { title: '全部', name: 'all', value: '-1' },
        { title: '租户', name: 'tenant', value: '1' },
        { title: '机构', name: 'organ', value: '2' },
        { title: '角色', name: 'role', value: '3' },
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
  bizField: { type: String, required: true },
  //目标显示字段：默认显示目标名称
  showField: { type: Array<ShowField>, required: false },
  //目标显示方式：tag标签，card卡片，list列表，table表格
  showType: { type: String, default: 'tag' }
})

const activeKey = ref(0)
const modelValue = defineModel<Array<any>>('value')
const dataList = ref<Array<any>>([])
const dataIds = ref<Array<any>>([])

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
      }
    }
  })
  console.log('processInput data', data)
  console.log('processInput list', dataList.value)
}

const organSelect = ref({
  visible: false,
  ok: (e: any) => {
    console.log('organ ok', e)
    if (props.model == 'sync') {
      modelValue.value = modelValue.value || []
      e.list
        .filter((item: any) => !dataIds.value.includes(item.id))
        .forEach((item: any) => {
          dataIds.value.push(item.id)
          modelValue.value?.push({ targetType: '2', targetId: item.id, targetName: item.title })
        })
      emit('change', modelValue.value)
    }
    organSelect.value.visible = false
  }
})
const roleSelect = ref({
  visible: false,
  ok: (e: any) => {
    console.log('role ok', e)
    if (props.model == 'sync') {
      modelValue.value = modelValue.value || []
      e.list
        .filter((item: any) => !dataIds.value.includes(item.id))
        .forEach((item: any) => {
          dataIds.value.push(item.id)
          modelValue.value?.push({ targetType: '3', targetId: item.id, targetName: item.title })
        })
      emit('change', modelValue.value)
    }
    roleSelect.value.visible = false
  }
})
const userSelect = ref({
  visible: false,
  ok: (e: any) => {
    console.log('user ok', e)
    if (props.model == 'sync') {
      modelValue.value = modelValue.value || []
      e.list
        .filter((item: any) => !dataIds.value.includes(item.id))
        .forEach((item: any) => {
          dataIds.value.push(item.id)
          modelValue.value?.push({ targetType: '4', targetId: item.id, targetName: item.title })
        })
      emit('change', modelValue.value)
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
    emit('change', modelValue.value || [])
  }
}

onMounted(() => {
  if (props.model == 'sync') {
    processInput(modelValue.value || [])
  }
})

watch(
  () => modelValue,
  () => {
    if (props.model == 'sync') {
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
    min-height: 144px;

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
