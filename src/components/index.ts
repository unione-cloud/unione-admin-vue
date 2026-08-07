import UnioneResSelect from './res-select/index.vue'
import UnioneNoticeView from './notice-icon/noticeView.vue'
import UnioneTargetSelect from './target-select/index.vue'
import UnioneTargetList from './target-select/target-list.vue'
import UnioneFormSelect from './form-select/index.vue'

import UnioneAvatar from './avatar/index.vue'
import UnioneBreadcrumb from './breadcrumb/index.vue'

import JobTaskHandleScript from './job-task/handleScript.vue'

export default {
  install(app: any, options: any) {
    // 配置此应用
    app.component('UnioneResSelect', UnioneResSelect)
    app.component('UnioneFormSelect', UnioneFormSelect)
    app.component('UnioneTargetSelect', UnioneTargetSelect)
    app.component('UnioneTargetList', UnioneTargetList)

    app.component('UnioneAvatar', UnioneAvatar)
    app.component('UnioneNoticeView', UnioneNoticeView)
    app.component('UnioneBreadcrumb', UnioneBreadcrumb)

    app.component('JobTaskHandleScript', JobTaskHandleScript)
  }
}
