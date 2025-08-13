<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <UnionePageForm :psn="pagesn" :params="props.params" :pageDefine="pageDefine">
  </UnionePageForm>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import { UnionePageForm } from 'unione-form-vue'
import pageDefineData from './dms.json'

const pageDefine = ref<any>(pageDefineData)


// 组件属性定义
const props = defineProps({
  psn: {
    type: String
  },
  params: {
    type: Object,
    default() {
      return {}
    }
  }
})
const route = useRoute()
const pagesn: any = computed(() => {
  return props.psn || route?.query?.psn || route?.meta?.psn || 'new_'
})

</script>

<style scoped lang="less"></style>
