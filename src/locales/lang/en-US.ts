import globals from './global/en-US'
import routes from './routes/en-US'
import pages from './pages/en-US'
import antd from 'ant-design-vue/es/locale/en_US'
import dayjs from 'dayjs/locale/en'

const locales = {
  localeName: 'enUS',
  dayjsLocaleName: 'en',
  antd,
  dayjs,

  ...globals,
  ...routes,
  ...pages
}

export default locales
