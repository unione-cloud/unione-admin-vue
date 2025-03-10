import UserSelect from './user-select/index.vue'

export default {
  install(app: any, options: any) {
    // 配置此应用
    app.component('UserSelect', UserSelect)
  }
}
