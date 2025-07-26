import UnioneUserSelect from './user-select/index.vue'
import UnioneRoleSelect from './role-select/index.vue'
import UnioneOrganSelect from './organ-select/index.vue'
import UnioneGroupSelect from './group-select/index.vue'
import UnionePostSelect from './post-select/index.vue'
import UnioneResSelect from './res-select/index.vue'
import UnioneIconSelect from './icon-select/index.vue'
import UnioneAvatar from './avatar/index.vue'
import UnioneNoticeView from './notice-icon/noticeView.vue'
import UnioneTargetList from './target-list/index.vue'

export default {
  install(app: any, options: any) {
    // 配置此应用
    app.component('UnioneUserSelect', UnioneUserSelect)
    app.component('UnioneRoleSelect', UnioneRoleSelect)
    app.component('UnioneOrganSelect', UnioneOrganSelect)
    app.component('UnioneGroupSelect', UnioneGroupSelect)
    app.component('UnionePostSelect', UnionePostSelect)
    app.component('UnioneResSelect', UnioneResSelect)
    app.component('UnioneIconSelect', UnioneIconSelect)
    app.component('UnioneAvatar', UnioneAvatar)
    app.component('UnioneTargetList', UnioneTargetList)
    app.component('UnioneNoticeView', UnioneNoticeView)
  }
}
