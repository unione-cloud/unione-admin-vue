import UserSelect from './user-select/index.vue'
import RoleSelect from './role-select/index.vue'
import OrganSelect from './organ-select/index.vue'
import GroupSelect from './group-select/index.vue'
import PostSelect from './post-select/index.vue'
import ResSelect from './res-select/index.vue'

export default {
  install(app: any, options: any) {
    // 配置此应用
    app.component('UserSelect', UserSelect)
    app.component('RoleSelect', RoleSelect)
    app.component('OrganSelect', OrganSelect)
    app.component('GroupSelect', GroupSelect)
    app.component('PostSelect', PostSelect)
    app.component('ResSelect', ResSelect)
  }
}
