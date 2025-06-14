<template>
  <a-list item-layout="horizontal">
    <a-list-item>
      <a-list-item-meta>
        <template v-slot:title>
          <a>整体布局</a>
        </template>
        <template v-slot:description>
          <span>系统整体布局配置</span>
        </template>
      </a-list-item-meta>
      <template v-slot:actions>
        <a-switch
          checkedChildren="暗色"
          unCheckedChildren="白色"
          :disabled="true"
          :defaultChecked="(navTheme === 'dark' && true) || false"
        />
      </template>
    </a-list-item>
    <a-list-item>
      <a-list-item-meta>
        <template v-slot:title>
          <a>主题风格</a>
        </template>
        <template v-slot:description>
          <span> 系统主题风格配置 </span>
        </template>
      </a-list-item-meta>
    </a-list-item>
  </a-list>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const themeMap: { [key: string]: string } = {
  dark: '暗色',
  light: '白色',
  realDark: '暗黑模式'
}

const colorList = [
  {
    key: '薄暮',
    color: '#F5222D'
  },
  {
    key: '火山',
    color: '#FA541C'
  },
  {
    key: '日暮',
    color: '#FAAD14'
  },
  {
    key: '明青',
    color: '#13C2C2'
  },
  {
    key: '极光绿',
    color: '#52C41A'
  },
  {
    key: '拂晓蓝（默认）',
    color: '#1890FF'
  },
  {
    key: '极客蓝',
    color: '#2F54EB'
  },
  {
    key: '酱紫',
    color: '#722ED1'
  }
]

const themeFilter = (theme: string) => {
  return themeMap[theme]
}

const colorFilter = (color: string) => {
  const c = colorList.find((o) => o.color === color)
  return c && c.key
}
</script>
