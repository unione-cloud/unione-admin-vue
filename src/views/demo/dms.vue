<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <UnionePageView :psn="pagesn" :params="props.params" :pageDefine="pageDefine">
   </UnionePageView>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import {UnionePageView} from 'unione-form-vue'
import pageDefine from './dms.json'

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
const pagesn=computed(()=>{
  return props.psn || route?.query?.psn || route?.meta?.psn || 'new_'
})

</script>

<style scoped lang="less">

</style>
