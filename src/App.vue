<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { provide, ref } from 'vue'
import { locales } from 'unione-base-vue'
import { useAdminStore } from './stores/admin'

const helper = ref({
  baseURL: '/openai/v1',
  apiKey: 'sk--EmgF4LwGb7gM-bkFp9gEA',
  model: 'deepseek-v4-pro-online',
})

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
    <UPHelper :config="helper" />
  </a-config-provider>
</template>

<style scoped lang="less"></style>
