import UserSelect from './user-select/index.vue'
import RoleSelect from './role-select/index.vue'
import OrganSelect from './organ-select/index.vue'

export default {
  install(app: any, options: any) {
    // 配置此应用
    app.component('UserSelect', UserSelect)
    app.component('RoleSelect', RoleSelect)
    app.component('OrganSelect', OrganSelect)
  }
}
