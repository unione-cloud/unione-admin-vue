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
          @change="setConfig(layout)"
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

const dialog = useDialog()
const admin = useAdminStore()

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
  axios
    .admin({
      method: 'POST',
      url: '/api/system/configDefine/tree/personal/-1'
    })
    .then((res: any) => {
      if (res.success) {
        const map: any = {}
        res.body.forEach((conf: any) => {
          map[conf.sn] = conf
        })
        layout.value = map[layout.value.sn] || layout.value
        layout.value.value = layout.value.valueUsed || layout.value.valueDefault
        theme.value = map[theme.value.sn] || theme.value
        theme.value.value = theme.value.valueUsed || theme.value.valueDefault
      } else {
        dialog.error({
          content: res.message
        })
      }
    })
}

function setConfig(conf: any) {
  if (conf.sn == 'personal.layout') {
    admin.setView({ layout: conf.value })
    admin.rebuildMenu()
  }
}

onMounted(() => {
  loadConfigs()
})
</script>
