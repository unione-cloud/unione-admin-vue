<script setup lang="ts">
import { RouterView } from 'vue-router'
import { provide } from 'vue';
import { useI18n } from 'vue-i18n'
import { useAdminStore } from './stores/admin';

const admin = useAdminStore()
provide('admin',admin)
const i18n = useI18n()

</script>

<template>
  <a-config-provider :locale="i18n.locale">
    <RouterView />
  </a-config-provider>
</template>

<style scoped lang="less"></style>
