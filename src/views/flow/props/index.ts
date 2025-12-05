import type { App } from 'vue'
import TaskCandidate from './candidate.vue'

export default {
  install(app: App, options?: any) {
    app.component('TaskCandidate', TaskCandidate)
  }
}
