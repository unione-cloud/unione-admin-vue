<template>
  <div class="res-select-warp">
    <a-input
      v-model:value="treeKeywords"
      :placeholder="'搜索资源(回车)...'"
      class="type-search"
      allowClear
      @change="searchTreeData()"
    ></a-input>

    <a-tree
      :showLine="{ showLeafIcon: false }"
      showIcon
      blockNode
      checkable
      checkStrictly
      :tree-data="treeData"
      :fieldNames="{ key: 'id' }"
      :filterTreeNode="filterTreeNode"
      v-if="treeData?.length > 0"
      v-model:selectedKeys="selectedKeys"
      v-model:checkedKeys="checkedKeys"
      v-model:expandedKeys="expandedKeys"
      @check="onCheck"
    >
      <template #icon="{ dataRef }">
        <component :is="iconMap[dataRef.ntype]"></component>
      </template>
      <template #title="{ dataRef }">
        <div class="node-label" @click="onExpande(dataRef)">
          <span>{{ dataRef.title }}</span>
          <div
            class="enDilivery"
            @click.stop="enDiliveryClick(dataRef)"
            v-if="!dataRef.id.startsWith('btn_') && !dataRef.id.startsWith('tool_')"
          >
            <span class="label">可传递:</span>
            <a-switch
              size="small"
              :checked="dataRef.enDilivery"
              checkedChildren="是"
              unCheckedChildren="否"
            ></a-switch>
          </div>
        </div>
      </template>
    </a-tree>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { axios } from 'unione-base-vue'

const props = defineProps({
  targetType: {
    type: String, // user
    required: true
  },
  targetValue: {
    type: String,
    required: true
  }
})

const iconMap = ref<any>({
  app: 'AppstoreOutlined',
  menu: 'BarsOutlined',
  btn: 'GoldOutlined',
  tool: 'FormatPainterOutlined'
})

// tree 选中的节点
const checkedKeys = ref<any>({ checked: [], halfChecked: [] })
const selectedKeys = ref<any>([])
const expandedKeys = ref<any>([])
const treeKeywords = ref<String>()

const treeNode = ref<any>({})
const treeData = ref<any>([])
const treeStore = ref<any>([])
function loadTreeData() {
  treeData.value = []
  treeStore.value = []

  // 请求远程接口
  axios
    .admin({
      url: `/api/system/resource/tree/permis${props.targetType.charAt(0).toUpperCase() + props.targetType.slice(1)}`,
      method: 'post',
      data: {
        body: props.targetValue,
        page: 1,
        pageSize: 1000
      }
    })
    .then((res: any) => {
      if (!res.body) {
        return
      }
      treeStore.value = res.body
      treeStore.value.forEach((item: any) => {
        item.isLeaf = item.ntype == 'btn' || item.ntype == 'tool' ? true : false
        item.enDilivery = item.enDilivery == 1 ? true : false
        treeNode.value[item.id] = item
        if (item.checked) {
          if (!checkedKeys.value.checked.includes(item.id)) {
            checkedKeys.value.checked.push(item.id)
            selectedTarget.value.push(item)
          }
        }
      })
      // 构建树结构
      const tmpNodeIds: Array<any> = []
      treeStore.value.forEach((item: any) => {
        const parent = treeNode.value[item.pid]
        if (parent) {
          if (!parent.children) {
            parent.children = []
          }
          if (item.ntype == 'btn') {
            let btnNode: any = {
              id: 'btn_' + item.id,
              pid: item.pid,
              title: '按钮',
              isLeaf: false,
              ntype: 'btn',
              children: []
            }
            if (!parent.children[0]) {
              parent.children[0] = btnNode
              treeNode.value[btnNode.id] = btnNode
              tmpNodeIds.push(btnNode.id)
            } else if (parent.children[0].ntype == 'btn') {
              btnNode = parent.children[0]
            } else {
              parent.children.splice(0, 0, btnNode)
              treeNode.value[btnNode.id] = btnNode
              tmpNodeIds.push(btnNode.id)
            }
            treeNode.value[item.id].pid = btnNode.id
            btnNode.children.push(treeNode.value[item.id])
          } else if (item.ntype == 'tool') {
            let toolNode: any = {
              id: 'tool_' + item.id,
              pid: item.pid,
              title: '工具',
              isLeaf: false,
              ntype: 'tool',
              children: []
            }
            if (!parent.children[0]) {
              parent.children[0] = toolNode
              treeNode.value[toolNode.id] = toolNode
              tmpNodeIds.push(toolNode.id)
            } else if (parent.children[0].ntype == 'tool') {
              toolNode = parent.children[0]
            } else if (parent.children[1] && parent.children[1].ntype == 'tool') {
              toolNode = parent.children[1]
            } else {
              parent.children.splice(1, 0, toolNode)
              treeNode.value[toolNode.id] = toolNode
              tmpNodeIds.push(toolNode.id)
            }
            treeNode.value[item.id].pid = toolNode.id
            toolNode.children.push(treeNode.value[item.id])
          } else {
            parent.children.push(treeNode.value[item.id])
          }
        } else {
          treeData.value.push(treeNode.value[item.id])
          expandedKeys.value.push(item.id)
        }
      })
      // 按钮，工具节点处理
      tmpNodeIds.forEach((nid: any) => {
        const node = treeNode.value[nid]
        const cknds = node.children.filter((item: any) => item.checked)
        if (cknds.length > 0) {
          if (cknds.length < node.children.length) {
            checkedKeys.value.halfChecked.push(nid)
          } else {
            checkedKeys.value.checked.push(nid)
          }
        }
      })

      // 回显处理
      nextTick(() => {
        const process = (node: any) => {
          const parent = treeNode.value[node.pid]
          if (parent) {
            parent.children?.forEach((item: any) => {
              if (checkedKeys.value.halfChecked.includes(item.id)) {
                if (!checkedKeys.value.halfChecked.includes(parent.id)) {
                  checkedKeys.value.halfChecked.push(parent.id)
                }
                if (checkedKeys.value.checked.includes(parent.id)) {
                  checkedKeys.value.checked = checkedKeys.value.checked.filter(
                    (id: any) => id != parent.id
                  )
                }
              }
            })
            process(parent)
          }
        }
        const leafNodes = treeStore.value.filter(
          (node: any) => !node.children || node.children.length == 0
        )
        leafNodes.forEach((node: any) => {
          process(node)
        })
      })
    })
}
// 搜索
function searchTreeData() {
  if (treeKeywords.value && treeKeywords.value.trim() != '') {
    // 搜索关键字
    expandedKeys.value = []
    const nodeList = treeStore.value.filter((item: any) => {
      return item.title?.indexOf(treeKeywords.value?.trim()) > -1
    })
    const laodParent = (node: any) => {
      if (!expandedKeys.value.includes(node.id)) {
        expandedKeys.value.push(node.id)
      }
      const parent = treeNode.value[node.pid]
      if (parent) {
        laodParent(parent)
      }
    }
    nodeList.forEach((item: any) => {
      laodParent(item)
    })
  }
}
function filterTreeNode(node: any) {
  if (treeKeywords.value && treeKeywords.value.trim() != '') {
    return node.title?.indexOf(treeKeywords.value.trim()) > -1
  }
  return false
}

function onExpande(node: any) {
  if (node.isLeaf) {
    return
  }
  if (expandedKeys.value.includes(node.id)) {
    expandedKeys.value = expandedKeys.value.filter((item: any) => item != node.id)
  } else {
    expandedKeys.value.push(node.id)
  }
}

const selectedTarget = ref<any>([])
function onCheck(keys: any, { node }: any) {
  console.log('on checked keys', keys, node)
  selectedTarget.value = []
  checkedKeys.value = { checked: [], halfChecked: [] }

  const childKeys: Array<any> = []
  const sltcld = (node: any, checked: boolean) => {
    if (!node.children) {
      return
    }
    node.children.forEach((item: any) => {
      if (checked) {
        checkedKeys.value.checked.push(item.id)
      }
      childKeys.push(item.id)
      sltcld(item, checked)
    })
  }
  const sltparent = (node: any, checked: boolean) => {
    const parent = treeNode.value[node.pid]
    if (parent) {
      const halfCheckedFlag = parent.children.filter((item: any) =>
        keys.halfChecked.includes(item.id)
      )
      const checkedFlag = parent.children.filter((item: any) => !keys.checked.includes(item.id))
      if (checkedFlag.length == 0 && !checkedKeys.value.checked.includes(parent.id)) {
        checkedKeys.value.checked.push(parent.id)
        keys.checked.push(parent.id)
      }
      if (checked) {
        if (checkedFlag.length > 0) {
          if (!checkedKeys.value.halfChecked.includes(parent.id)) {
            checkedKeys.value.halfChecked.push(parent.id)
            keys.halfChecked.push(parent.id)
          }
          checkedKeys.value.checked = checkedKeys.value.checked.filter(
            (item: any) => item != parent.id
          )
        }
      } else {
        if (halfCheckedFlag.length > 0) {
          if (!checkedKeys.value.halfChecked.includes(parent.id)) {
            checkedKeys.value.halfChecked.push(parent.id)
            keys.halfChecked.push(parent.id)
          }
          checkedKeys.value.checked = checkedKeys.value.checked.filter(
            (item: any) => item != parent.id
          )
        } else if (checkedFlag.length > 0 && checkedFlag.length < parent.children.length) {
          if (!checkedKeys.value.halfChecked.includes(parent.id)) {
            checkedKeys.value.halfChecked.push(parent.id)
            keys.halfChecked.push(parent.id)
          }
          checkedKeys.value.checked = checkedKeys.value.checked.filter(
            (item: any) => item != parent.id
          )
        } else {
          checkedKeys.value.halfChecked = checkedKeys.value.halfChecked.filter(
            (item: any) => item != parent.id
          )
          checkedKeys.value.checked = checkedKeys.value.checked.filter(
            (item: any) => item != parent.id
          )
        }
      }
      sltparent(parent, checked)
    }
  }

  const nodeSlt = keys.checked.includes(node.id)
  console.log('node click ', nodeSlt)
  sltcld(node, nodeSlt)
  // 处理已选中记录
  keys.checked.forEach((key: any) => {
    if (nodeSlt) {
      checkedKeys.value.checked.push(key)
    } else if (!childKeys.includes(key)) {
      checkedKeys.value.checked.push(key)
    }
  })
  keys.halfChecked.forEach((key: any) => {
    checkedKeys.value.halfChecked.push(key)
  })
  sltparent(node, nodeSlt)

  // 处理选中记录
  const sltKeys: Array<any> = []
  checkedKeys.value.checked.forEach((key: any) => {
    const item = treeNode.value[key]
    if (!sltKeys.includes(key)) {
      sltKeys.push(key)
      if (item && !item.id.startsWith('btn_') && !item.id.startsWith('tool_')) {
        selectedTarget.value.push(item)
      }
    }
  })
  checkedKeys.value.halfChecked.forEach((key: any) => {
    const item = treeNode.value[key]
    if (!sltKeys.includes(key)) {
      sltKeys.push(key)
      if (item && !item.id.startsWith('btn_') && !item.id.startsWith('tool_')) {
        selectedTarget.value.push(item)
      }
    }
  })
  treeStore.value.forEach((item: any) => {
    if (
      !checkedKeys.value.checked.includes(item.id) &&
      !checkedKeys.value.halfChecked.includes(item.id)
    ) {
      item.enDilivery = false
    }
  })
}
function enDiliveryClick(node: any) {
  node.enDilivery = !node.enDilivery
  treeData.value = [...treeData.value]
  if (node.enDilivery) {
    if (!checkedKeys.value.checked.includes(node.id)) {
      checkedKeys.value.checked.push(node.id)
      onCheck(checkedKeys.value, { node })
    }
  }
}

onMounted(() => {
  loadTreeData()
})

function getSelected() {
  return {
    list: selectedTarget.value.map((item: any) => {
      return {
        appId: item.appId,
        resId: item.id,
        resType: item.ntype,
        enDilivery: item.enDilivery ? 1 : 0
      }
    }),
    ids: selectedTarget.value.map((item: any) => {
      return item.id
    })
  }
}
function getSelectedList() {
  return selectedTarget.value.map((item: any) => {
    return {
      appId: item.appId,
      resId: item.id,
      resType: item.ntype,
      enDilivery: item.enDilivery ? 1 : 0
    }
  })
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
.res-select-warp {
  height: 100%;
  padding: 5px 10px;

  :deep(.ant-tree) {
    height: calc(100% - 30px);
    overflow-y: scroll;

    .ant-tree-title {
      display: inline-block;
      width: calc(100% - 40px);
      .node-label {
        width: 100%;
      }
      .enDilivery {
        float: right;
        .label {
          margin-right: 5px;
        }
      }
    }
  }
  :deep(.filter-node) {
    .ant-tree-node-content-wrapper {
      color: red;
    }
  }
}
</style>
