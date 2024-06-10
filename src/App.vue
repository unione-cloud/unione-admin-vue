<script setup lang="ts">
import { RouterView } from 'vue-router'
import { langMessage } from '@/locales/index'
</script>

<template>
  <a-config-provider :locale="langMessage">
    <RouterView />
  </a-config-provider>
</template>

<style scoped lang="less"></style>
