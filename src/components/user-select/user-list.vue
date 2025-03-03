<template>
  <a-row class="user-list">
    <a-col :span="13" class="type-list">
      <a-tabs v-model:activeKey="activeType" type="card" tabPosition="left">
        <a-tab-pane v-for="type in typeList" :key="type" :tab="getTypeLabel(type)">
          <a-input :placeholder="'搜索' + getTypeLabel(type) + '...'" class="type-search"></a-input>
          <a-tree
            :show-line="true"
            :show-icon="true"
            v-model:selectedKeys="selectedKeys"
            :expanded-keys="expandedKeys"
            :tree-data="treeData"
            @select="onSelect"
            @expand="handleExpand"
          >
            <template #icon><carry-out-outlined /></template>
            <template #title="{ dataRef }">
              <template v-if="dataRef.key === '0-0-0-1'">
                <div>multiple line title</div>
                <div>multiple line title</div>
              </template>
              <template v-else>{{ dataRef.title }}</template>
            </template>
            <template #switcherIcon="{ dataRef, defaultIcon }">
              <SmileTwoTone v-if="dataRef.key === '0-0-2'" />
              <component :is="defaultIcon" v-else />
            </template>
          </a-tree>
        </a-tab-pane>
      </a-tabs>
    </a-col>
    <a-col :span="11" class="selected-list">
      <a-list item-layout="horizontal" :data-source="data">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                <a href="https://www.antdv.com/">{{ item.realName }}</a>
              </template>
              <template #avatar>
                <a-avatar src="https://joeschmoe.io/api/v1/random" size="large" />
              </template>
              <template #description>
                <div>性别：{{ item.sex }}</div>
                <div>电话{{ item.tel }}</div>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { CarryOutOutlined, SmileTwoTone } from '@ant-design/icons-vue'
import type { TreeProps } from 'ant-design-vue'
import difference from 'lodash-es/difference'

const props = defineProps({
  typeList: {
    type: Array<String>,
    default: () => ['organ', 'role', 'group', 'post']
  },
  targetType: {
    type: String // organ | role | group | post
  },
  targetValue: {
    type: String
  }
})
const typeMap = ref<any>({})
typeMap.value = {
  organ: '组织',
  role: '角色',
  group: '分组',
  post: '岗位'
}
function getTypeLabel(type: any) {
  return typeMap.value[type]
}

const activeType = ref('organ')

const treeData = ref<TreeProps['treeData']>([
  {
    title: 'parent 1',
    key: '0-0',
    children: [
      {
        title: 'parent 1-0',
        key: '0-0-0',
        children: [
          { title: 'leaf', key: '0-0-0-0' },
          {
            key: '0-0-0-1'
          },
          { title: 'leaf', key: '0-0-0-2' }
        ]
      },
      {
        title: 'parent 1-1',
        key: '0-0-1',
        children: [{ title: 'leaf', key: '0-0-1-0' }]
      },
      {
        title: 'parent 1-2',
        key: '0-0-2',
        children: [
          { title: 'leaf 1', key: '0-0-2-0' },
          {
            title: 'leaf 2',
            key: '0-0-2-1'
          }
        ]
      }
    ]
  },
  {
    title: 'parent 2',
    key: '0-1',
    children: [
      {
        title: 'parent 2-0',
        key: '0-1-0',
        children: [
          { title: 'leaf', key: '0-1-0-0' },
          { title: 'leaf', key: '0-1-0-1' }
        ]
      }
    ]
  }
])
const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
  console.log('selected', selectedKeys, info)
}
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>(['0-0-0', '0-0-1'])
const checkedKeys = ref<string[]>(['0-0-0', '0-0-1'])
watch(expandedKeys, () => {
  console.log('expandedKeys', expandedKeys)
})
watch(selectedKeys, () => {
  console.log('selectedKeys', selectedKeys)
})
watch(checkedKeys, () => {
  console.log('checkedKeys', checkedKeys)
})
const handleExpand = (keys: string[], { expanded, node }: any) => {
  // node.parent add from 3.0.0-alpha.10
  const tempKeys = ((node.parent ? node.parent.children : treeData.value) || []).map(
    ({ key }: any) => key
  )
  if (expanded) {
    expandedKeys.value = difference(keys, tempKeys).concat(node.key)
  } else {
    expandedKeys.value = keys
  }
}

const data: any = [
  {
    realName: '张三',
    sex: 1,
    tel: '0571-22098820'
  },
  {
    realName: '李四',
    sex: 1,
    tel: '0571-22098820'
  },
  {
    realName: '王五',
    sex: 1,
    tel: '0571-22098820'
  },
  {
    realName: '赵六',
    sex: 1,
    tel: '0571-22098820'
  }
]
</script>

<style lang="less" scoped>
.user-list {
  height: 100%;

  .type-list {
    height: 100%;
    border-right: 1px solid #eeeeee;

    :deep(.ant-tabs-tabpane) {
      padding: 5px;
    }
  }
  .selected-list {
    height: 100%;
    padding: 5px;
  }
}
</style>
