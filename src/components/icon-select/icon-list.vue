<template>
  <div class="icon-select-warp">
    <div class="icon-search">
      <a-input
        v-model:value="keywords"
        :placeholder="'搜索icon(回车)...'"
        allowClear
        @change="onSearch"
      ></a-input>
    </div>
    <div class="icon-list">
      <a-tabs v-model:activeKey="activeTab">
        <template v-for="iconType in iconList" :key="iconType.name">
          <a-tab-pane :tab="iconType.title" :key="iconType.name" v-if="iconType.enable != false">
            <a-collapse v-model:activeKey="activeCol" accordion ghost v-if="iconType.groups.length">
              <a-collapse-panel
                class="group"
                v-for="(group, i) in iconType.groups"
                :key="i"
                :header="group.title"
              >
                <a-row :gutter="10">
                  <a-col
                    :span="4"
                    v-for="icon in group.icons"
                    :key="icon"
                    :class="['icon-item', 'icon-' + icon, selected == icon && 'selected']"
                    @click="onSelected(icon)"
                  >
                    <component :is="icon"></component>
                    <div class="label">
                      {{ icon.substr(0, icon.length - iconType.name.length) }}
                    </div>
                  </a-col>
                </a-row>
              </a-collapse-panel>
              <a-empty v-if="iconType.groups.length == 0" description="暂无数据"></a-empty>
            </a-collapse>
          </a-tab-pane>
        </template>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import iconListData from './icon-list.json'
import { useDebounce } from 'unione-form-vue'

const activeTab = ref()
const activeCol = ref(0)
const selected = ref<any>()
const keywords = ref('')
const iconList = ref(iconListData)

const onSearch = useDebounce(() => {
  if (!keywords.value) {
    iconList.value = iconListData
    return
  }
  const keywordsValue = keywords.value.toLowerCase()
  const list = JSON.parse(JSON.stringify(iconListData))
  list.forEach((item: any) => {
    item.groups.forEach((group: any) => {
      group.icons = group.icons.filter((icon: String) => {
        return icon.toLowerCase().includes(keywordsValue)
      })
    })
    item.groups = item.groups.filter((group: any) => {
      return group.icons.length > 0
    })
  })
  iconList.value = list
})

function onSelected(icon: String) {
  selected.value = icon
}

function getSelected() {
  return selected.value
}
defineExpose({
  getSelected
})
</script>

<style lang="less" scoped>
.icon-select-warp {
  width: 100%;

  .icon-list {
    .group {
      .group-name {
        font-size: 14px;
        color: #606266;
        margin: 10px 0;
        font-size: 15px;
        font-weight: bold;
      }
      .icon-item {
        height: 60px;
        cursor: pointer;
        text-align: center;

        .anticon {
          font-size: 35px;
        }
        .label {
          overflow: hidden;
        }

        &.selected {
          background-color: #f5f7fa;
          border: 1px solid #d9d9d9;
        }
      }
      .icon-item:hover {
        background-color: #f5f7fa;
        border: 1px solid #d9d9d9;
      }
    }
  }
}
</style>
