import type { App } from 'vue'
import FlowCandidate from './candidate.vue'
import FlowNodeSelect from './nodeSelect.vue'
import FlowVarSelect from './varSelect/index.vue'
import FlowCopyTo from './copyto.vue'
import FlowNotice from './notice.vue'
import FlowFormRef from './formRef.vue'
import FlowFormVar from './formVar.vue'
import FlowDataField from './dataField.vue'
import FlowDataBind from './dataBind.vue'
import FlowDataSort from './dataSort.vue'
import FlowDataFilter from './dataFilter/index.vue'
import FlowParam from './flowParam.vue'
import FlowBusiField from './busiField.vue'
import FlowTask from '../comps/flowTask.vue'
import FlowComment from '../comps/flowComment.vue'

export default {
  install(app: App, options?: any) {
    app.component('FlowCandidate', FlowCandidate)
    app.component('FlowNodeSelect', FlowNodeSelect)
    app.component('FlowVarSelect', FlowVarSelect)
    app.component('FlowCopyTo', FlowCopyTo)
    app.component('FlowNotice', FlowNotice)
    app.component('FlowFormRef', FlowFormRef)
    app.component('FlowFormVar', FlowFormVar)
    app.component('FlowDataField', FlowDataField)
    app.component('FlowDataBind', FlowDataBind)
    app.component('FlowDataSort', FlowDataSort)
    app.component('FlowDataFilter', FlowDataFilter)
    app.component('FlowParam', FlowParam)
    app.component('FlowBusiField', FlowBusiField)
    app.component('FlowTask', FlowTask)
    app.component('FlowComment', FlowComment)
  }
}
