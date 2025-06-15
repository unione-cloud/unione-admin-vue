import UserSelect from './user-select/index.vue'
import RoleSelect from './role-select/index.vue'
import OrganSelect from './organ-select/index.vue'
import GroupSelect from './group-select/index.vue'
import PostSelect from './post-select/index.vue'
import ResSelect from './res-select/index.vue'
import IconSelect from './icon-select/index.vue'
import UnioneAvatar from './avatar/index.vue'

export default {
  install(app: any, options: any) {
    // 配置此应用
    app.component('UserSelect', UserSelect)
    app.component('RoleSelect', RoleSelect)
    app.component('OrganSelect', OrganSelect)
    app.component('GroupSelect', GroupSelect)
    app.component('PostSelect', PostSelect)
    app.component('ResSelect', ResSelect)
    app.component('IconSelect', IconSelect)
    app.component('UnioneAvatar', UnioneAvatar)
  }
}
