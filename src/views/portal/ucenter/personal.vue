<template>
  <a-list item-layout="horizontal">
    <a-list-item>
      <a-list-item-meta>
        <template v-slot:title>
          <a>{{ layout.title }}</a>
        </template>
        <template v-slot:description>
          <span>{{ layout.descs }}</span>
        </template>
      </a-list-item-meta>
      <template v-slot:actions>
        <unione-radio-box
          :convert="{
            types: 'option',
            options: [
              { value: 'sidemenu', label: '左侧菜单' },
              { value: 'topmenu', label: '顶部菜单' },
              { value: 'topside', label: '混合菜单' }
            ]
          }"
          @change="toSetConfig(layout)"
          v-model:value="layout.value"
        ></unione-radio-box>
      </template>
    </a-list-item>

    <a-list-item>
      <a-list-item-meta>
        <template v-slot:title>
          <a>{{ theme.title }}</a>
        </template>
        <template v-slot:description>
          <span> {{ theme.descs }} </span>
        </template>
      </a-list-item-meta>
    </a-list-item>
  </a-list>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { axios, useDialog } from 'unione-base-vue'
import { useAdminStore } from '@/stores/admin'
import { useConfigStore } from '@/config'

const dialog = useDialog()
const admin = useAdminStore()
const config = useConfigStore()

const layout = ref<any>({
  sn: 'personal.layout',
  title: '整体布局',
  descs: '系统整体布局配置',
  value: 'topside'
})

const theme = ref<any>({
  sn: 'personal.theme',
  title: '主题风格',
  descs: '系统主题风格配置',
  value: 'light'
})

function loadConfigs() {
  config.loadConfig('personal').then((configs: any) => {
    console.log('loaded config', configs)
    layout.value = configs[layout.value.sn] || layout.value
    layout.value.value = layout.value.valueUsed || layout.value.valueDefault
    theme.value = configs[theme.value.sn] || theme.value
    theme.value.value = theme.value.valueUsed || theme.value.valueDefault
  })
}

function toSetConfig(conf: any) {
  if (conf.sn == 'personal.layout') {
    config.setConfig(conf.sn, conf.value)
  }
}

onMounted(() => {
  loadConfigs()
})
</script>
