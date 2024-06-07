<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()

onMounted(() => {
  //加载菜单
  admin.loadMenu()
})
</script>

<template>
  <RouterView />
</template>

<style scoped lang="less"></style>
