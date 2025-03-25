<template>
  <a-row class="user-list-warp">
    <a-col :span="13" class="type-list">
      <a-tabs
        v-model:activeKey="activeType"
        type="card"
        tabPosition="left"
        @change="loadTreeData(activeType, '-1')"
      >
        <a-tab-pane v-for="type in typeList" :key="type" :tab="getTypeLabel(type)">
          <a-input
            v-model:value="treeKeywords[activeType]"
            :placeholder="'搜索' + getTypeLabel(type) + '(回车)...'"
            class="type-search"
            allowClear
            @pressEnter="loadTreeData(activeType, '-1')"
          ></a-input>

          <a-tree
            :showLine="{ showLeafIcon: false }"
            showIcon
            checkable
            blockNode
            :tree-data="treeData[activeType]"
            :fieldNames="{ key: 'id' }"
            v-model:selectedKeys="selectedKeys[activeType]"
            v-model:checkedKeys="checkedKeys"
            @expand="onExpand"
            @select="onSelect"
            @check="onCheck"
          >
            <template #title="{ dataRef }">
              {{ dataRef.title }}{{ dataRef.userCount ? '[' + dataRef.userCount + ']' : '' }}
              <a-input
                v-if="
                  activeNode[activeType]?.id == dataRef.id &&
                  ((dataRef.isLeaf == false && dataRef.ntype == 'user') || dataRef.ntype == 'role')
                "
                v-model:value="userKeywords"
                class="user-search-input"
                size="small"
                placeholder="搜索用户(回车)..."
                allowClear
                @pressEnter="loadUserList(dataRef.id)"
              ></a-input>
            </template>
            <template #icon="{ dataRef }">
              <component :is="typeMap[dataRef.ntype][1]"></component>
            </template>
          </a-tree>
        </a-tab-pane>
      </a-tabs>
    </a-col>
    <a-col :span="11" class="selected-list">
      <a-list item-layout="horizontal" :data-source="selectedUsers">
        <template #renderItem="{ item, index }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                姓名：{{ item.title }}
                <DeleteOutlined class="btn" @click="delSelect(index, item)" />
              </template>
              <template #avatar>
                <a-avatar src="/avatar.png" size="large" />
              </template>
              <template #description>
                <div>性别：{{ item.sexLabel }}</div>
                <div>电话：{{ item.tel }}</div>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { onMounted, provide, ref, watch } from 'vue'
import { CarryOutOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import type { TreeProps } from 'ant-design-vue'
import { axios } from 'unione-base-vue'
import { Convertor } from 'unione-form-vue'
import useTarget from 'ant-design-vue/es/vc-tour/hooks/useTarget'

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
const typeMap = ref<any>({
  user: ['用户', 'UserOutlined'],
  organ: ['组织', 'ApartmentOutlined'],
  role: ['角色', 'IdcardOutlined'],
  group: ['分组', 'ClusterOutlined'],
  post: ['岗位', 'CoffeeOutlined']
})

function getTypeLabel(type: any) {
  return typeMap.value[type][0]
}
// sex Convertor
const sexConvertor = new Convertor({
  types: 'dict',
  dictName: 'SEX'
})

// tab 当前选中的类型
const activeType = ref<'organ' | 'role' | 'group' | 'post' | 'user'>('organ')
// tree 选中的节点
const activeNode = ref<any>({})
const checkedKeys = ref<any>([])
const selectedKeys = ref<any>({})
const treeKeywords = ref<any>({})
const userKeywords = ref<any>()

const treeNode = ref<any>({})
const treeData = ref<any>({})
function loadTreeData(type: 'organ' | 'role' | 'group' | 'post' | 'user', pid: string) {
  if (!pid || pid == '-1') {
    if (treeData.value[type]?.length > 0) {
      return
    }
  } else {
    if (type == 'role' || type == 'user') {
      //加载角色用户列表
      loadUserList(pid)
      return
    }
  }
  axios
    .admin({
      url: `/api/selector/${type}/${type == 'role' ? 'node' : 'tree'}/-1`,
      method: 'post',
      data: {
        body: pid ? pid : -1,
        keywords: treeKeywords.value[type],
        page: 1,
        pageSize: 1000
      }
    })
    .then((res: any) => {
      let target: any = []
      if (!pid || pid == '-1') {
        target = treeData.value[type]
      } else {
        if (!treeNode.value[pid].children) {
          treeNode.value['userList-' + pid] = {
            title: '用户列表',
            ntype: 'user',
            pid: pid,
            id: 'userList-' + pid,
            isLeaf: false
          }
          treeNode.value[pid].children = []
          treeNode.value[pid].children[0] = treeNode.value['userList-' + pid]
        }
        target = treeNode.value[pid].children
      }
      const nmap: any = {}
      res.body?.forEach((item: any) => {
        nmap[item.id] = item
        treeNode.value[item.id] = item
        item.isLeaf = false
      })
      res.body?.forEach((item: any) => {
        const parent = nmap[item.pid]
        if (parent) {
          if (!parent.children) {
            parent.children = []
          }
          parent.children.push(item)
        } else {
          target.push(item)
        }
      })
    })
}
function loadUserList(pid: string) {
  const parent = treeNode.value[pid]
  if (parent.ntype == 'user') {
    pid = parent.pid
  }
  axios
    .admin({
      url: `/api/selector/user/node`,
      method: 'post',
      data: {
        body: {
          pid: pid,
          ntype: activeType.value,
          targetType: props.targetType,
          targetId: props.targetValue
        },
        keywords: userKeywords.value,
        page: 1,
        pageSize: 2000
      }
    })
    .then((res: any) => {
      if (!res.body) {
        return
      }
      parent.children = res.body
      res.body?.forEach((item: any) => {
        treeNode.value[item.id] = item
        item.pid = pid
        item.isLeaf = true
        sexConvertor.convert(item.sex).then((label: any) => {
          item.sexLabel = label
        })
        if (item.checked) {
          if (!checkedKeys.value.includes(item.id)) {
            checkedKeys.value.push(item.id)
          }
          item.disableCheckbox = true
          item.disabled = true
        }
      })
      treeData.value = { ...treeData.value }
    })
}
function onExpand(expandedKeys: any, { expanded, node }: any) {
  if ((expanded && !node.children) || !node.children.length) {
    loadTreeData(node.ntype, node.key)
  }
}
function onSelect(sltKeys: any, { node }: any) {
  activeNode.value[activeType.value] = node
  selectedKeys.value[activeType.value] = [node.id]
}
const selectedUsers = ref<any>([])
function onCheck(checkedKeys: any) {
  selectedUsers.value = []
  checkedKeys.forEach((key: any) => {
    const node = treeNode.value[key]
    if (node.ntype == 'user' && node.isLeaf != false && !node.disabled) {
      selectedUsers.value.push(node)
    }
  })
}
function delSelect(index: number, item: any) {
  selectedUsers.value.splice(index, 1)
  checkedKeys.value = checkedKeys.value.filter((key: any) => {
    const node = treeNode.value[key]
    return key != item.id && node.isLeaf == true
  })
  checkedKeys.value = [...checkedKeys.value]
}

onMounted(() => {
  Object.keys(typeMap.value).forEach((type: any) => {
    treeData.value[type] = []
  })
  loadTreeData(activeType.value, '-1')
})

function getSelected() {
  return {
    list: selectedUsers.value,
    ids: selectedUsers.value.map((item: any) => {
      return item.id
    })
  }
}
function getSelectedList() {
  return selectedUsers.value
}
function getSelectedIds() {
  return selectedUsers.value.map((item: any) => {
    return item.id
  })
}
defineExpose({
  getSelected,
  getSelectedList,
  getSelectedIds
})
</script>

<style lang="less" scoped>
.user-list-warp {
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
