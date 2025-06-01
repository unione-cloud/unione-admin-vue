<template>
  <div class="unione-page-view">
    <component class="unione-page-content" v-if="viewComponent" :is="viewComponent" />
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useSession } from 'unione-base-vue'

// 会话对象
const session = useSession()
const route = useRoute()
const principal = computed(() => {
  return session.getPrincipal()
})

const viewComponent = computed(() => {
  if (route.meta.isIframe != 1 && route.meta.url) {
    // return defineAsyncComponent(() => import(`@/views${route.meta.url}.vue`))
    const path = `../views${route.meta.url}.vue`
    return defineAsyncComponent(() => import(/* @vite-ignore */ path))
  }
  return null
})
</script>

<style scoped lang="less">
.unione-page-view {
  height: 100%;
  .unione-page-content {
    width: 100%;
    height: 100%;
  }
}
</style>
