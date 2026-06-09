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
        <unione-radio-box :convert="{
          types: 'option',
          options: [
            { value: 'sidemenu', label: '左侧菜单' },
            { value: 'topmenu', label: '顶部菜单' },
            { value: 'topside', label: '混合菜单' }
          ]
        }" @change="toSetConfig(layout)" v-model:value="layout.value"></unione-radio-box>
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
      <template v-slot:actions>
        <unione-radio-box :convert="{
          types: 'option',
          options: [
            { value: 'light', label: '浅色主题' },
            { value: 'dark', label: '深色主题' }
          ]
        }" @change="toSetConfig(theme)" v-model:value="theme.value"></unione-radio-box>
      </template>
    </a-list-item>

    <a-list-item>
      <a-list-item-meta>
        <template v-slot:title>
          <a>{{ lang.title }}</a>
        </template>
        <template v-slot:description>
          <span> {{ lang.descs }} </span>
        </template>
      </a-list-item-meta>
      <template v-slot:actions>
        <unione-radio-box :convert="{
          types: 'dict',
          dictName: 'UNIONE_I18N_LANG',
        }" @change="toSetConfig(lang)" v-model:value="lang.value"></unione-radio-box>
      </template>
    </a-list-item>
  </a-list>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { axios, useDialog, utils } from 'unione-base-vue'
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

const lang = ref<any>({
  sn: 'personal.lang',
  title: '语言',
  descs: '系统语言配置',
  value: 'zh-CN'
})


function loadConfigs() {
  config.loadConfig('personal').then((configs: any) => {
    layout.value.value = configs[layout.value.sn]?.valueUsed || layout.value.value
    theme.value.value = configs[theme.value.sn]?.valueUsed || theme.value.value
  })
}

function toSetConfig(conf: any) {
  if (['personal.layout', 'personal.theme'].includes(conf.sn)) {
    config.setConfig(conf.sn, conf.value)
  }
}

onMounted(() => {
  loadConfigs()
})
</script>
