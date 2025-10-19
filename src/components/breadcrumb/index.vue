<template>
  <div class="unione-breadcrumb">
    <a-breadcrumb>
      <a-breadcrumb-item href="/home" class="ulink">
        <HomeOutlined />首页
      </a-breadcrumb-item>
      <template v-for="(menu, i) in routeList" :key="menu.key">
        <a-breadcrumb-item :href="menu.path" :class="[menu.redirect && i == routeList.length - 1 && 'ulink']"
          @click="gotoMenu(menu, i)">
          <component v-if="menu.icon" :is="menu.icon"></component>
          {{ menu.label }}
        </a-breadcrumb-item>
      </template>
    </a-breadcrumb>
  </div>
</template>
<script setup lang="ts">
import { useAdminStore } from '@/stores/admin'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'UnioneBreadcrumb',
})
const route = useRoute()
const admin = useAdminStore()

const routeList = computed(() => {
  return admin.loadBreadcrumbList(route)
})

function gotoMenu(menu: any, index: number) {
  if (!menu.redirect) {
    return
  }
  if (index == routeList.value.length - 1) {
    return
  }
  if (index == 0) {
    admin.topMenuClick(menu.key)
  } else {
    admin.sideMenuClick(menu.key)
  }
}
</script>
<style scoped lang="less">
.unione-breadcrumb {
  padding: 2px 20px 2px 0;
  background-color: #f5f5f5;

  :deep(.ulink > a) {
    cursor: pointer;
  }

  :deep(.ant-breadcrumb-link) {
    cursor: text;
  }
}
</style>
