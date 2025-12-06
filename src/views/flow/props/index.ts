import type { App } from 'vue'
import FlowCandidate from './candidate.vue'
import FlowNodeSelect from './nodeSelect.vue'

export default {
  install(app: App, options?: any) {
    app.component('FlowCandidate', FlowCandidate)
    app.component('FlowNodeSelect', FlowNodeSelect)
  }
}
