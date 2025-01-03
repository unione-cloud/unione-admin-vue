<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { provide } from 'vue'
import { useI18n } from 'unione-base-vue'
import { useAdminStore } from './stores/admin'

const admin = useAdminStore()
provide('admin', admin)
const i18n = useI18n()

const router = useRouter()
const route = useRoute()
provide('route', route)
provide('router', router)
</script>

<template>
  <a-config-provider :locale="i18n.locale">
    <RouterView />
  </a-config-provider>
</template>

<style scoped lang="less"></style>
