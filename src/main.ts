import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import Antd from 'ant-design-vue'
import * as Icons from '@ant-design/icons-vue'
import 'ant-design-vue/dist/reset.css'

import locale from './locales'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(locale as any)

Object.keys(Icons).forEach((key: any) => {
  app.component(key, Icons[key])
})

app.mount('#app')
