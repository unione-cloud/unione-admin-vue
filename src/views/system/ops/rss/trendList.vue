<!-- eslint-disable vue/multi-word-component-names -->
<!-- 动态订阅 -->
<template>
  <div class="unione-page unione-page-list unione-trend-rss-list">
    <unione-page-list ref="page" v-bind="define"></unione-page-list>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

const page = ref()
const define = ref({
  storage: {
    controller: '/api/system/trendRss'
  },
  fields: [
    {
      title: '名称',
      name: 'name',
    },
    {
      title: '邮箱',
      name: 'email',
    },
    {
      title: '电话',
      name: 'tel',
    },
    {
      title: '订阅主题',
      name: 'subject',
      convert: {
        types: 'dict',
        dictName: 'RSSSUBJECTS'
      },
      isQuery: true
    },
    {
      title: '说明',
      name: 'descs'
    }
  ],
  leftBtns: false,
  rightBtns: ['downTmpl', 'impData'],
  operation: false
})


</script>

<style scoped lang="less"></style>
