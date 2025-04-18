<template>
  <a-row class="post-select-warp">
    <a-col :span="13" class="type-list">
      <a-input
        v-model:value="treeKeywords"
        :placeholder="'搜索岗位(回车)...'"
        class="type-search"
        allowClear
        @change="searchTreeData()"
      ></a-input>

      <a-tree
        :showLine="{ showLeafIcon: false }"
        showIcon
        checkable
        blockNode
        checkStrictly
        :tree-data="treeData"
        :fieldNames="{ key: 'id' }"
        v-if="treeData?.length > 0"
        v-model:selectedKeys="selectedKeys"
        v-model:checkedKeys="checkedKeys"
        @expand="onExpand"
        @check="onCheck"
      >
        <template #icon>
          <component :is="'ApartmentOutlined'"></component>
        </template>
      </a-tree>
    </a-col>
    <a-col :span="11" class="selected-list">
      <a-list item-layout="horizontal" :data-source="selectedTarget">
        <template #renderItem="{ item, index }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                <div>名称：{{ item.title }}</div>
                <div>编码：{{ item.sn || '--' }}</div>
                <DeleteOutlined class="btn" @click="delSelect(index, item)" />
              </template>
              <template #description>
                <div>{{ item.descs || '--' }}</div>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { CarryOutOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { axios } from 'unione-base-vue'
import { Convertor } from 'unione-form-vue'
import { useProvideKeysState } from 'ant-design-vue/es/vc-tree/contextTypes'

const props = defineProps({
  targetType: {
    type: String // user
  },
  targetValue: {
    type: String
  }
})

// sex Convertor
const typeMap = ref<any>({})
const typeConvertor = new Convertor({
  types: 'dict',
  dictName: 'POSTTYPES'
})

// tree 选中的节点
const checkedKeys = ref<any>([])
const selectedKeys = ref<any>([])
const treeKeywords = ref<String>()

const treeNode = ref<any>({})
const treeData = ref<any>([])
const treeStore = ref<any>([])
function loadTreeData(pid: string = '-1') {
  if (pid != '-1') {
    if (treeNode.value[pid].children?.length > 0) {
      return
    }
  } else if (treeData.value?.length > 0) {
    return
  }
  // 请求远程接口
  axios
    .admin({
      url: `/api/selector/post/tree`,
      method: 'post',
      data: {
        body: {
          pid,
          targetType: props.targetType,
          targetId: props.targetValue
        },
        page: 1,
        pageSize: 1000
      }
    })
    .then((res: any) => {
      if (!res.body) {
        return
      }
      let target: any = []
      if (!pid || pid == '-1') {
        target = treeData.value
      } else {
        if (!treeNode.value[pid].children) {
          treeNode.value[pid].children = []
        }
        target = treeNode.value[pid].children
      }
      const nmap: any = {}
      res.body.forEach((item: any) => {
        nmap[item.id] = item
        treeNode.value[item.id] = item
        item.isLeaf = false
        if (item.checked) {
          if (!checkedKeys.value.includes(item.id)) {
            checkedKeys.value.push(item.id)
          }
          item.disableCheckbox = true
          item.disabled = true
        }
      })
      res.body.forEach((item: any) => {
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
// 搜索
function searchTreeData() {
  if (!treeKeywords.value || treeKeywords.value.trim() == '') {
    treeData.value = treeStore.value
    return
  }
  treeStore.value = treeData.value
  treeData.value = []
  axios
    .admin({
      url: `/api/selector/post/tree`,
      method: 'post',
      data: {
        body: {
          targetType: props.targetType,
          targetId: props.targetValue
        },
        keywords: treeKeywords.value,
        page: 1,
        pageSize: 1000
      }
    })
    .then((res: any) => {
      if (!res.body) {
        return
      }
      const nmap: any = {}
      res.body.forEach((item: any) => {
        nmap[item.id] = item
        treeNode.value[item.id] = item
        item.isLeaf = false
        if (item.checked) {
          if (!checkedKeys.value.includes(item.id)) {
            checkedKeys.value.push(item.id)
          }
          item.disableCheckbox = true
          item.disabled = true
        }
      })
      res.body.forEach((item: any) => {
        const parent = nmap[item.pid]
        if (parent) {
          if (!parent.children) {
            parent.children = []
          }
          parent.children.push(item)
        } else {
          treeData.value.push(item)
        }
      })
    })
}

function onExpand(expandedKeys: any, { expanded, node }: any) {
  if ((expanded && !node.children) || !node.children.length) {
    loadTreeData(node.key)
  }
}
const selectedTarget = ref<any>([])
function onCheck(keys: any, { node }: any) {
  console.log('on checked keys', keys, node)
  selectedTarget.value = []
  checkedKeys.value = []
  const sltcld = (node: any) => {
    if (!node.children) {
      return
    }
    node.children.forEach((item: any) => {
      if (!keys.checked.includes(item.id)) {
        checkedKeys.value.push(item.id)
        if (!item.disabled) {
          selectedTarget.value.push(item)
        }
      }
      sltcld(item)
    })
  }
  keys.checked.forEach((key: any) => {
    checkedKeys.value.push(key)
    const item = treeNode.value[key]
    if (!item.disabled) {
      selectedTarget.value.push(item)
    }
  })
  if (!node.checked) {
    sltcld(node)
  }
}
function delSelect(index: number, item: any) {
  selectedTarget.value.splice(index, 1)
  checkedKeys.value = checkedKeys.value.filter((key: any) => {
    return key != item.id
  })
  checkedKeys.value = [...checkedKeys.value]
}

onMounted(() => {
  typeConvertor.load().then((res: any) => {
    typeMap.value = {}
    res.forEach((item: any) => {
      typeMap.value[item.dictKey] = { title: item.dictValue, data: [] }
    })

    loadTreeData('-1')
  })
})

function getSelected() {
  return {
    list: selectedTarget.value.map((item: any) => {
      return { ...item, enDilivery: item.enDilivery ? 1 : 0 }
    }),
    ids: selectedTarget.value.map((item: any) => {
      return item.id
    })
  }
}
function getSelectedList() {
  return selectedTarget.value
}
function getSelectedIds() {
  return selectedTarget.value.map((item: any) => {
    return item.id
  })
}
defineExpose({
  loadTreeData,
  getSelected,
  getSelectedList,
  getSelectedIds
})
</script>

<style lang="less" scoped>
.post-select-warp {
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
      .isDlv {
        float: right;
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
