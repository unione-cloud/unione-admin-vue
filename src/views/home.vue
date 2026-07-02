<template>
  <div class="home-page">{{ welcome }}</div>
</template>

<script setup lang="ts">
import { useAdminStore } from '@/stores/admin'
import { computed } from 'vue'
defineOptions({
  name: 'UnioneHome'
})

const admin = useAdminStore()
const welcome = computed(() => {
  return admin.system?.configs?.welcome || admin.view.welcome
})


</script>

<style scoped lang="less">
.home-page {
  text-align: center;
  padding-top: 200px;
  font-size: 40px;
}
</style>
