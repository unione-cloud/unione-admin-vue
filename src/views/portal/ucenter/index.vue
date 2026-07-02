<template>
  <div class="portal-ucenter">
    <a-tabs class="ucenter-tabs" v-model:activeKey="activeKey" :tab-position="'left'" animated size="large"
      :tabBarStyle="{ width: '160px' }">
      <a-tab-pane key="base" tab="基础设置">
        <div class="title">基础设置</div>
        <BaseInfo class="warp"></BaseInfo>
      </a-tab-pane>
      <a-tab-pane key="security" tab="安全设置">
        <div class="title">安全设置</div>
        <Security class="warp"></Security>
      </a-tab-pane>
      <a-tab-pane key="cache" tab="缓存设置">
        <div class="title">缓存设置</div>
        <CacheSetting class="warp"></CacheSetting>
      </a-tab-pane>
      <a-tab-pane key="accbind" tab="账户绑定">
        <div class="title">账户绑定</div>
        <Binding class="warp"></Binding>
      </a-tab-pane>
      <a-tab-pane key="personal" tab="个性化">
        <div class="title">个性化</div>
        <Personal class="warp"></Personal>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseInfo from './baseInfo.vue'
import Security from './security.vue'
import Binding from './binding.vue'
import Personal from './personal.vue'
import CacheSetting from './cache.vue'

const activeKey = ref('base')
</script>

<style scoped lang="less">
.portal-ucenter {
  height: 100%;

  .ucenter-tabs {
    height: 100%;

    .title {
      font-size: 30px;
    }

    .warp {
      height: 100%;
      overflow-y: scroll;
    }
  }
}
</style>
