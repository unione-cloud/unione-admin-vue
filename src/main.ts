import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import Antd from 'ant-design-vue'
import * as Icons from '@ant-design/icons-vue/lib/icons'
import 'ant-design-vue/dist/reset.css'
import 'unione-form-vue/dist/style.css'

import config from '@/config/settings'

import UnioneFormVue from 'unione-form-vue'
import UninoneBaseVue from 'unione-base-vue'
import { loadLanguage } from './locales'

const app = createApp(App)
app.use(createPinia()).use(router).use(Antd).use(UninoneBaseVue, config).use(UnioneFormVue, config)

loadLanguage('zh-CN') //'en-US' 'en-US'

const AntdIcons: any = Icons
Object.keys(AntdIcons).forEach((key: any) => {
  app.component(key, AntdIcons[key])
})

app.mount('#app')
