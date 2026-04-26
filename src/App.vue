<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { provide } from 'vue'
import { locales } from 'unione-base-vue'
import { useAdminStore } from './stores/admin'

const admin = useAdminStore()
provide('admin', admin)

const router = useRouter()
const route = useRoute()
provide('route', route)
provide('router', router)
</script>

<template>
  <a-config-provider :locale="locales.langMessage.value">
    <RouterView />
  </a-config-provider>
</template>

<style scoped lang="less"></style>
