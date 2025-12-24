<template>
    <a-drawer title="处理意见" v-model:visible="visible" :width="600" rootClassName="flow-opinion-drawer">

        <!-- flow意见 -->
        <template v-if="flowOpinions?.length">
            <div class="flow-options">
                <div class="flow-task">
                    <a-timeline>
                        <template v-for="task in flowOpinions" :key="task.id">
                            <a-timeline-item v-for="opinion in task.opinions" :key="opinion.id">
                                <div class="node">节点：{{ task.title }}</div>
                                <div class="user">处理人：{{ opinion.userName }}</div>
                                <div class="time">处理时间：{{ opinion.handleTime }}</div>
                                <div class="content">处理意见：{{ opinion.optxt }}</div>
                            </a-timeline-item>
                        </template>
                    </a-timeline>
                </div>
            </div>
        </template>

        <!-- task意见 -->
        <template v-if="taskOpinions?.id">
            <div class="flow-options">
                <div class="flow-task">
                    <a-timeline>
                        <a-timeline-item v-for="opinion in taskOpinions.opinions" :key="opinion.id">
                            <div class="user">处理人：{{ opinion.userName }}</div>
                            <div class="time">处理时间：{{ opinion.handleTime }}</div>
                            <div class="content">处理意见：{{ opinion.optxt }}</div>
                        </a-timeline-item>
                    </a-timeline>
                </div>
            </div>
        </template>

        <!-- busiKey意见 -->
        <template v-if="busiKeyOpinions?.length">
            <div class="flow-options" v-for="ins in busiKeyOpinions" :key="ins.id">
                <div class="flow-title" v-if="busiKeyOpinions.length > 1">{{ ins.title }},提交时间:{{ ins.commitTime }}{{
                    ins.completeTime ? ('，完成时间:' + ins.completeTime):'' }}</div>
                <div class="flow-task">
                    <a-timeline>
                        <template v-for="task in ins.tasks" :key="task.id">
                            <a-timeline-item v-for="opinion in task.opinions" :key="opinion.id">
                                <div class="node">节点：{{ task.title }}</div>
                                <div class="user">处理人：{{ opinion.userName }}</div>
                                <div class="time">处理时间：{{ opinion.handleTime }}</div>
                                <div class="content">处理意见：{{ opinion.optxt }}</div>
                            </a-timeline-item>
                        </template>
                    </a-timeline>
                </div>
            </div>
        </template>

        <a-empty v-if="isempty" />

        <template #footer>
            <a-button @click="close" class="btn-close">关闭</a-button>
        </template>
    </a-drawer>
</template>
<script setup lang="ts">
import { axios, useDialog } from 'unione-base-vue';
import { computed, onMounted, ref, watch } from 'vue';
defineOptions({ name: 'FlowOpinion' })

const props = defineProps({
    busiKey: {
        type: String,
        required: false
    },
    flowId: {
        type: String,
        required: false
    },
    taskId: {
        type: String,
        required: false
    }
})

const isempty = ref(true)
const flowOpinions = ref<Array<any>>([])
const taskOpinions = ref<any>({})
const busiKeyOpinions = ref<Array<any>>([])

const visible = defineModel('visible', {
    type: Boolean,
    default: false
})
const data = ref({
    busiKey: '',
    flowId: '',
    taskId: ''
})
const params = computed(() => {
    return {
        busiKey: data.value.busiKey || props.busiKey,
        flowId: data.value.flowId || props.flowId,
        taskId: data.value.taskId || props.taskId
    }
})

function close() {
    visible.value = false;
}
function open({ busiKey, flowId, taskId }: any = {}) {
    data.value.busiKey = busiKey
    data.value.flowId = flowId
    data.value.taskId = taskId
    visible.value = true
    isempty.value = true
    loadOpinion()
}

function loadOpinion() {
    flowOpinions.value = []
    taskOpinions.value = {}
    busiKeyOpinions.value = []
    if (!params.value.busiKey && !params.value.flowId && !params.value.taskId) {
        return
    }
    let url = ''
    let optype = ''
    if (params.value.busiKey) {
        url = '/api/engine/opinion/busiKey/' + params.value.busiKey + '/1'
        optype = 'busiKey'
    } else if (params.value.flowId) {
        url = '/api/engine/opinion/flow/' + params.value.flowId + '/1'
        optype = 'flow'
    } else if (params.value.taskId) {
        url = '/api/engine/opinion/task/' + params.value.taskId + '/1'
        optype = 'task'
    }
    axios.flow({
        url,
        method: 'post'
    }).then((res: any) => {
        if (res.success) {
            if (optype == 'busiKey') {
                busiKeyOpinions.value = res.body

                for (let i = 0; i < busiKeyOpinions.value.length && isempty.value; i++) {
                    if (busiKeyOpinions.value[i].tasks?.length) {
                        for (let j = 0; j < busiKeyOpinions.value[i].tasks.length; j++) {
                            if (busiKeyOpinions.value[i].tasks[j].opinions?.length) {
                                isempty.value = false
                                break
                            }
                        }
                    }
                }
            } else if (optype == 'flow') {
                flowOpinions.value = res.body
                if (flowOpinions.value?.length) {
                    for (let i = 0; i < flowOpinions.value.length; i++) {
                        if (flowOpinions.value[i].opinions?.length) {
                            isempty.value = false
                            break
                        }
                    }
                }
            } else if (optype == 'task') {
                taskOpinions.value = res.body
                if (taskOpinions.value.opinions?.length) {
                    isempty.value = false
                }
            }
        }
    })
}

watch(props, () => {
    loadOpinion()
})
onMounted(() => {
    loadOpinion()
})

defineExpose({ open, close })
</script>

<style lang="less">
.flow-opinion-drawer {
    .btn-close {
        float: right;
        margin-right: 20px;
    }
}
</style>