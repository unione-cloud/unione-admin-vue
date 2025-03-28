<template>
  <a-row class="role-select-warp">
    <a-col :span="13" class="type-list">
      <a-input
        v-model:value="treeKeywords"
        :placeholder="'搜索角色(回车)...'"
        class="type-search"
        allowClear
        @change="searchTreeData()"
      ></a-input>

      <a-tree
        :showLine="{ showLeafIcon: false }"
        showIcon
        checkable
        blockNode
        defaultExpandAll
        :tree-data="treeData"
        :fieldNames="{ key: 'id' }"
        v-if="treeData?.length > 0"
        v-model:selectedKeys="selectedKeys"
        v-model:checkedKeys="checkedKeys"
        @check="onCheck"
      >
        <template #icon="{ dataRef }">
          <component :is="dataRef.rtype == 0 ? 'FilterOutlined' : 'IdcardOutlined'"></component>
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
                <div>编码：{{ item.sn }}</div>
                <DeleteOutlined class="btn" @click="delSelect(index, item)" />
              </template>
              <template #description>
                <div>{{ item.descs }}</div>
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
  dictName: 'ROLETYPE'
})

// tree 选中的节点
const checkedKeys = ref<any>([])
const selectedKeys = ref<any>([])
const treeKeywords = ref<String>()

const treeNode = ref<any>({})
const treeData = ref<any>([])
const dataList = ref<any>([])
function loadTreeData() {
  dataList.value = []
  axios
    .admin({
      url: `/api/selector/role/list/` + props.targetType,
      method: 'post',
      data: {
        body: props.targetValue,
        keywords: treeKeywords.value
      }
    })
    .then((res: any) => {
      if (!res.body) {
        return
      }
      dataList.value = res.body
      dataList.value.forEach((item: any) => {
        treeNode.value[item.id] = item
        item.isLeaf = true
        if (item.checked) {
          checkedKeys.value.push(item.id)
        }
      })
      searchTreeData()
      // 回显已有角色
      if (checkedKeys.value.length > 0) {
        onCheck(checkedKeys.value)
      }
    })
}
function searchTreeData() {
  // rtype  1平台，2租户，3机构，9其他
  treeData.value = []
  Object.keys(typeMap.value).forEach((type: any) => {
    typeMap.value[type].data = []
  })
  dataList.value.forEach((item: any) => {
    if (!treeKeywords.value || (treeKeywords.value && item.title.includes(treeKeywords.value))) {
      typeMap.value[item.rtype]?.data?.push(item)
    }
  })
  console.log('typeMap', typeMap.value)
  Object.keys(typeMap.value).forEach((type: any) => {
    if (typeMap.value[type].data.length > 0) {
      const item = {
        title: typeMap.value[type].title,
        id: 'type:' + type,
        rtype: 0,
        children: typeMap.value[type].data,
        isLeaf: false
      }
      treeData.value.push(item)
      treeNode.value[item.id] = item
    }
  })
  console.log('treeData', treeData.value)
}

const selectedTarget = ref<any>([])
function onCheck(keys: any) {
  selectedTarget.value = []
  checkedKeys.value = keys
  checkedKeys.value.forEach((key: any) => {
    const node = treeNode.value[key]
    if (node?.rtype && node.isLeaf != false && !node.disabled) {
      selectedTarget.value.push(node)
    }
  })
}
function delSelect(index: number, item: any) {
  selectedTarget.value.splice(index, 1)
  checkedKeys.value = checkedKeys.value.filter((key: any) => {
    const node = treeNode.value[key]
    return key != item.id && node.isLeaf == true
  })
  checkedKeys.value = [...checkedKeys.value]
}

onMounted(() => {
  typeConvertor.load().then((res: any) => {
    typeMap.value = {}
    res.forEach((item: any) => {
      typeMap.value[item.dictKey] = { title: item.dictValue, data: [] }
    })
    loadTreeData()
  })
})

function getSelected() {
  return {
    list: selectedTarget.value,
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
  getSelected,
  getSelectedList,
  getSelectedIds
})
</script>

<style lang="less" scoped>
.role-select-warp {
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
