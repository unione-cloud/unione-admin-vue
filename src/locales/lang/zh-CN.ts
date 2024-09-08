import globals from './global/zh-CN'
import routes from './routes/zh-CN'
import pages from './pages/zh-CN'
import antd from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs/locale/zh-cn'

const locales = {
  localeName: 'zhCN',
  dayjsLocaleName: 'zh-cn',
  ...antd,
  dayjs,

  ...globals,
  ...routes,
  ...pages
}

export default {
  ...locales
}
