import UnioneUserSelect from './user-select/index.vue'
import UnioneRoleSelect from './role-select/index.vue'
import UnioneOrganSelect from './organ-select/index.vue'
import UnioneGroupSelect from './group-select/index.vue'
import UnionePostSelect from './post-select/index.vue'
import UnioneResSelect from './res-select/index.vue'
import UnioneNoticeView from './notice-icon/noticeView.vue'
import UnioneTargetList from './target-list/index.vue'
import UnioneFormSelect from './form-select/index.vue'

import UnioneAvatar from './avatar/index.vue'
import UnioneBreadcrumb from './breadcrumb/index.vue'

import JobTaskHandleScript from './job-task/handleScript.vue'

export default {
  install(app: any, options: any) {
    // 配置此应用
    app.component('UnioneUserSelect', UnioneUserSelect)
    app.component('UnioneRoleSelect', UnioneRoleSelect)
    app.component('UnioneOrganSelect', UnioneOrganSelect)
    app.component('UnioneGroupSelect', UnioneGroupSelect)
    app.component('UnionePostSelect', UnionePostSelect)
    app.component('UnioneResSelect', UnioneResSelect)
    app.component('UnioneFormSelect', UnioneFormSelect)
    app.component('UnioneTargetList', UnioneTargetList)

    app.component('UnioneAvatar', UnioneAvatar)
    app.component('UnioneNoticeView', UnioneNoticeView)
    app.component('UnioneBreadcrumb', UnioneBreadcrumb)

    app.component('JobTaskHandleScript', JobTaskHandleScript)
  }
}
