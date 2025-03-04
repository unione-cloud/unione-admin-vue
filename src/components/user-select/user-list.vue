<template>
  <a-row class="user-list">
    <a-col :span="13" class="type-list">
      <a-tabs v-model:activeKey="activeType" type="card" tabPosition="left">
        <a-tab-pane v-for="type in typeList" :key="type" :tab="getTypeLabel(type)">
          <a-input :placeholder="'搜索' + getTypeLabel(type) + '...'" class="type-search"></a-input>
          <a-tree
            :showLine="{ showLeafIcon: false }"
            showIcon
            checkable
            blockNode
            :tree-data="treeData"
            @select="onSelect"
          >
            <template #title="{ dataRef }">
              {{ dataRef.title }}{{ dataRef.userCount ? '[' + dataRef.userCount + ']' : '' }}
              <a-input
                v-if="activeNode?.key == dataRef.key && dataRef.ntype != 'user'"
                class="user-search-input"
                size="small"
                placeholder="搜索用户..."
              ></a-input>
            </template>
            <template #icon="{ dataRef }">
              <UserOutlined v-if="dataRef.ntype == 'user'"></UserOutlined>
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
                {{ item.realName }}
                <DeleteOutlined class="btn" />
              </template>
              <template #avatar>
                <a-avatar src="/avatar.png" size="large" />
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
import { CarryOutOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import type { TreeProps } from 'ant-design-vue'

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
// tab 当前选中的类型
const activeType = ref('organ')
// tree 选中的节点
const activeNode = ref<any>(null)
const treeData = ref<TreeProps['treeData']>([
  {
    title: '九重焱科技有限公司',
    key: '0-0',
    ntype: 'organ',
    userCount: 50,
    children: [
      {
        title: '市场部',
        key: '0-0-0',
        ntype: 'organ',
        userCount: 10,
        children: [
          { title: '陈总', key: '0-0-0-0', ntype: 'user' },
          { title: '张三', key: '0-0-0-1', ntype: 'user' },
          { title: '李四', key: '0-0-0-2', ntype: 'user' }
        ]
      },
      {
        title: '技术部',
        key: '0-0-1',
        ntype: 'organ',
        userCount: 15,
        children: [{ title: '杨淼', key: '0-0-1-0', ntype: 'user' }]
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
const onSelect: TreeProps['onSelect'] = (selectedKeys, { node }: any) => {
  activeNode.value = node
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

    .user-search-input {
      font-size: 12px;
    }

    :deep(.ant-tabs-tabpane) {
      padding: 5px;
    }

    :deep(.ant-tree-checkbox) {
      align-self: stretch;
    }
  }
  .selected-list {
    height: 100%;
    padding: 5px;

    :deep(.ant-list-item) {
      padding: 5px;
      .btn {
        display: none;
        float: right;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.88);
      }
    }
    :deep(.ant-list-item:hover) {
      background-color: #eeeeee;
      .btn {
        display: block;
      }
    }
  }
}
</style>
