<template>
  <div class="target-list">
    <div v-if="title" class="title">{{ title }}</div>
    <a-tabs v-model:activeKey="activeKey" size="small">
      <template v-for="(type, i) in dataList" :key="i">
        <a-tab-pane :tab="type.title">
          <div class="view-card" v-if="showType == 'card' && showField"></div>
          <div class="view-tag" v-if="showType == 'tag'">
            <template v-if="type.name != 'all'">
              <template v-for="(target, j) in type.list" :key="j">
                <a-tag :closable="!disabled">{{ target.targetName }}</a-tag>
              </template>
              <a-tag v-if="!disabled" class="btn-add"><PlusOutlined /></a-tag>
            </template>
            <template v-else>
              <a-checkbox v-model:checked="type.checked">平台所有用户</a-checkbox>
            </template>
          </div>
          <a-empty
            v-if="type.name != 'all' && (!type.list || !type.list.length) && disabled"
          ></a-empty>
        </a-tab-pane>
      </template>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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

declare type ShowField = {
  title?: String
  name: String
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
  disabled: {
    type: Boolean,
    default: false
  },
  formValue: {
    type: Object
  },
  //
  title: {
    type: String,
    required: false
  },
  //目标类型列表
  typeList: {
    type: Array<Target>,
    default: () => {
      return [
        {
          title: '全部',
          name: 'all',
          value: '-1'
        },
        //  {
        //   title: '租户',
        //   name: 'tenant',
        //   value: '1'
        // },
        {
          title: '机构',
          name: 'organ',
          value: '2'
        },
        {
          title: '角色',
          name: 'role',
          value: '3'
        },
        {
          title: '用户',
          name: 'user',
          value: '4'
        }
      ]
    }
  },
  // 异步存储
  storage: {
    type: Object as PropType<DataStorage>,
    required: false
  },
  // 保存模式，sync:同步,async:异步
  model: {
    type: String,
    default: 'async'
  },
  // 关联字段名称，formValue中的属性名称，支持user.id方式
  refField: {
    type: String,
    default: 'id'
  },
  //业务字段名称：中间关联表的业务字段名称
  bizField: {
    type: String,
    required: true
  },
  //目标显示字段：默认显示目标名称，通过该属性可以扩展更多字段，多个字段逗号分隔
  showField: {
    type: Array<ShowField>,
    required: false
  },
  //目标显示方式：tag标签，card卡片，list列表，table表格
  showType: {
    type: String,
    default: 'tag'
  }
})

const activeKey = ref(0)
const value = defineModel<Array<any>>('value')
const dataList = ref<Array<any>>([
  {
    title: '全局',
    name: 'all',
    list: []
  },
  {
    title: '机构',
    name: 'organ',
    page: 1,
    pageSize: 6,
    list: [
      {
        targetType: '2',
        targetId: '1',
        targetName: '百度',
        linkMan: '张三',
        linkPhone: '13800000000'
      },
      {
        targetType: '2',
        targetId: '2',
        targetName: '阿狸',
        linkMan: '码云',
        linkPhone: '13800000001'
      }
    ]
  },
  {
    title: '角色',
    name: 'role',
    page: 1,
    pageSize: 6,
    list: [
      {
        targetType: '3',
        targetId: '21',
        targetName: '管理员',
        linkMan: '杨九',
        linkPhone: '18688498615'
      }
    ]
  },
  {
    title: '用户',
    name: 'user',
    page: 1,
    pageSize: 6,
    list: []
  }
])

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
