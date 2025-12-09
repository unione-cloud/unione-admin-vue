import type { App } from 'vue'
import FlowCandidate from './candidate.vue'
import FlowNodeSelect from './nodeSelect.vue'
import FlowVarSelect from './varSelect/index.vue'
import FlowCopyTo from './copyto.vue'
import FlowNotice from './notice.vue'
import FlowFormRef from './formRef.vue'
import FlowFormVar from './formVar.vue'

export default {
  install(app: App, options?: any) {
    app.component('FlowCandidate', FlowCandidate)
    app.component('FlowNodeSelect', FlowNodeSelect)
    app.component('FlowVarSelect', FlowVarSelect)
    app.component('FlowCopyTo', FlowCopyTo)
    app.component('FlowNotice', FlowNotice)
    app.component('FlowFormRef', FlowFormRef)
    app.component('FlowFormVar', FlowFormVar)
  }
}
