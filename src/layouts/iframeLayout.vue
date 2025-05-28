<template>
  <div class="unione-iframe-layout">
    <iframe class="unione-iframe-content" v-if="url" :src="url"></iframe>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSession } from 'unione-base-vue'

// 会话对象
const session = useSession()
const route = useRoute()
const principal = computed(() => {
  return session.getPrincipal()
})

const url = computed(() => {
  return route.meta.url?.toString()
})
</script>

<style scoped lang="less">
.unione-iframe-layout {
  height: 100%;

  .unione-iframe-content {
    width: 100%;
    height: 100%;
    border: none;
  }
}
</style>
