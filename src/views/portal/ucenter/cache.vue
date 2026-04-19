<template>
  <div>
    <a-list item-layout="horizontal" :data-source="dataSource">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a>{{ item.title }}</a>
            </template>
            <template #description>
              <span>
                <span class="security-list-description">{{ item.description }}</span>
                <span v-if="item.value">:</span>
                <span class="security-list-value">{{ item.value }}</span>
              </span>
            </template>
          </a-list-item-meta>
          <template #actions v-if="item.actions">
            <a @click="item.actions.callback">{{ item.actions.title }}</a>
          </template>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { axios, useDialog, utils } from 'unione-base-vue'
import config from '@/config/settings'

defineOptions({
  name: 'CacheSetting'
})


const dataSource = ref([
  {
    title: '系统字典',
    description: '清理系统字典缓存',
    value: '',
    actions: {
      title: '清理',
      callback: () => {
        dialog.confirm({
          content: '确定清理吗？',
          onOk: () => {
            clearDictCache()
          }
        })
      }
    }
  },
  {
    title: '应用缓存',
    description: '清理应用缓存',
    value: '',
    actions: {
      title: '清理',
      callback: () => {
        dialog.confirm({
          content: '确定清理吗？',
          onOk: () => {
            clearAppCache()
          }
        })
      }
    }
  },
])
const dialog = useDialog()

function clearDictCache() {
  console.log('清理系统字典缓存')
  // 清理本地存储中 UNIONE-DICT- 开头的缓存
  const dictCacheKeys = Object.keys(localStorage).filter(key => key.startsWith('UNIONE-DICT-'))
  dictCacheKeys.forEach(key => {
    localStorage.removeItem(key)
  })
  message.success('系统字典缓存清理成功')
}

function clearAppCache() {
  console.log('清理应用缓存')
  // 清理会话存储中 PAGE_DEFINE: 开头的缓存
  const appCacheKeys = Object.keys(sessionStorage).filter(key => key.startsWith('PAGE_DEFINE:'))
  appCacheKeys.forEach(key => {
    sessionStorage.removeItem(key)
  })
  message.success('应用缓存清理成功')
}

</script>

<style scoped lang="less">
.modal-form {
  .tips {
    text-align: center;
    color: #515151;
  }
}
</style>
