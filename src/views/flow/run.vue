<template>
    <div class="unione-flow-run">
        <div :class="['flow-content', !rightPanel.open && 'max-width']">
            <div class="flow-header">
                <div class="flow-title">
                    <ArrowLeftOutlined class="btn-back" @click="goback" />
                    <span class="label">请假申请流程</span>
                    <span class="curr-task" v-if="currTask">/{{ currTask.title }}</span>
                    <span class="priority">•（普通）</span>
                </div>
                <div class="flow-info">

                    <div class="item flow-type">流程类型：请假申请</div>
                    <div class="item start-user">发起人：张三</div>
                    <div class="item start-time">发起时间：2025-12-20 20:15:21</div>

                    <div class="opts">
                        <FullscreenOutlined title="全屏" class="opt" />
                        <ClusterOutlined title="流程图" :class="['opt', flowChartVisible && 'active']"
                            @click="flowChartVisible = !flowChartVisible" />
                        <DoubleRightOutlined title="收起" class="opt" v-if="rightPanel.open"
                            @click="rightPanel.open = false" />
                        <DoubleLeftOutlined title="展开" class="opt" v-else @click="rightPanel.open = true" />
                    </div>
                </div>
            </div>
            <div class="flow-area">
                <div :class="['flow-form', !flowChartVisible && 'visible']"
                    v-if="flowForm.type == 'form' && flowForm.sn">
                    <unione-page-form ref="formRef" :psn="flowForm.sn" :btns="false" :params="{ id: busiId }"
                        v-show="!flowChartVisible" :model="formModel"></unione-page-form>
                </div>
                <UFEditor v-if="flowChartVisible && flowInfo?.flowChart" model="run" :value="processFlowChart()">
                </UFEditor>
            </div>
            <div class="flow-tools">
                <a-button class="btn" danger>撤回</a-button>
                <a-button class="btn">催办</a-button>
                <a-button class="btn">加签</a-button>
                <a-button class="btn" @click="save">暂存</a-button>
                <a-button class="btn" type="primary" @click="submit">提交</a-button>
                <a-button class="btn" type="primary" @click="sign">办理</a-button>
                <a-button class="btn" danger>放弃</a-button>
                <a-button class="btn">转审</a-button>
                <a-button class="btn">协办</a-button>
                <a-button class="btn" type="primary">同意</a-button>
                <a-button class="btn" danger>拒绝</a-button>
                <a-button class="btn" danger type="primary" @click="stop">终止</a-button>
            </div>
        </div>
        <div class="flow-right" v-if="rightPanel.open">
            <a-tabs v-model:active="rightPanel.active">
                <a-tab-pane tab="流转" key="task" class="flow-task-tab">
                    <a-timeline>
                        <a-timeline-item v-for="item in flowTasks" :key="item.id"
                            :color="item.status == 1 ? 'blue' : 'green'">
                            <flow-task :task="item" :condidates="flowCondidates[item.id]"></flow-task>
                        </a-timeline-item>
                    </a-timeline>
                    <a-empty v-if="!flowTasks?.length"></a-empty>
                </a-tab-pane>
                <a-tab-pane tab="沟通" key="comment" class="flow-comment-tab">
                    <flow-comment :fid="1"></flow-comment>
                </a-tab-pane>
            </a-tabs>
        </div>
    </div>
</template>
<script setup lang="ts">
import { axios, useDialog } from 'unione-base-vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loadPreFormSync, processTaskStatus } from './lib/flowUtil';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

defineOptions({
    name: "UnioneFlowRun",
})

const props = defineProps({
    // 流程编码
    fsn: {
        type: String,
    },
    // 流程实例id
    fid: {
        type: String,
    },
    // 模式：start:启动，run：运行，view：详情，archive：归档
    fmd: {
        type: String,
    },
    // 业务id
    bid: {
        type: String,
    },

})
const route = useRoute()
const router = useRouter()
const dialog = useDialog()

const rightPanel = ref({
    open: true,
    active: 'task',
})

const flowChartVisible = ref(false)
// 流程信息
const flowInfo = ref<any>()
const currTask = ref<any>()
const flowTasks = computed(() => {
    if (!flowInfo.value) {
        return []
    }
    const tasks: any = [...(flowInfo.value.runs || []), ...(flowInfo.value.tasks || [])]
    return tasks.sort((a: any, b: any) => {
        return b.created - a.created
    })
})
// 流程候选人：taskId->[]
const flowCondidates = ref<any>({})
watch(() => flowTasks.value, () => {
    const ntids: any = []
    flowTasks.value.forEach((item: any) => {
        if (!flowCondidates.value[item.id]) {
            ntids.push(item.id)
        }
    })
    if (ntids.length) {
        //加载候选人
        axios.flow({
            method: 'POST',
            url: '/api/engine/condidate',
            data: {
                body: {
                    tids: ntids
                }
            }
        }).then((res: any) => {
            if (res.success && res.body) {
                res.body.forEach((item: any) => {
                    item.tids.forEach((tid: any) => {
                        let candidates = flowCondidates.value[tid] || []
                        candidates.push(item)
                        flowCondidates.value[tid] = candidates
                    })
                })
            }
        })
    }
})

const flowLoading = ref(false)
// 流程编码
const flowSn = computed(() => {
    return props.fsn || route.query.fsn;
})
// 流程实例id
const flowId = computed(() => {
    return props.fid || route.query.fid;
})
// 业务id
const busiId = computed(() => {
    return props.bid || route.query.bid || flowForm.value.bid;
})
// 流程模式
const flowModel = computed(() => {
    return props.fmd || route.query.fmd;
})
const formModel = computed(() => {
    return (flowModel.value == 'run' || flowModel.value == 'start') ? 'run' : 'view'
})

// 流程表单
const flowForm = ref<any>({
    type: 'form',   //form,custom
    url: '',
    sn: null,
    define: null,
    bid: null,
})
const formRef = ref()

/**
 * 暂存表单数据
 */
function save() {
    if (formRef.value) {
        formRef.value.save().then((data: any) => {
            if (data.body) {
                flowForm.value.bid = data.body.id
            }
        })
    }
}

/**
 * 提交流程
 */
function submit() {
    dialog.confirm({
        content: '确定提交当前流程吗？',
        onOk: () => {
            // 提交流程
            formRef.value.getData().then((data: any) => {
                console.log('form data', data)
                if (data) {
                    flowLoading.value = true
                    axios.flow({
                        method: 'POST',
                        url: '/api/engine/instance/run',
                        data: {
                            sn: flowSn.value,
                            form: data
                        }
                    }).then((res: any) => {
                        flowLoading.value = false
                        console.log('submit res', res)
                        if (res.success && res.body) {
                            dialog.success('提交成功')
                            if (res.body.tasks?.[0]) {
                                currTask.value = res.body.tasks[0]
                            }
                            flowInfo.value.tasks = [...(flowInfo.value.tasks || []), ...(res.body.tasks || [])]
                            flowInfo.value.runs = [...(flowInfo.value.runs || []), ...(res.body.runs || [])]
                        } else {
                            dialog.error(res.message)
                        }
                    })
                } else {
                    dialog.error('表单数据获取失败')
                }

            })
        }
    })
}

/**
 * 停止流程
 */
function stop() {
    dialog.confirm({
        content: '确定要终止当前流程么？',
        onOk: () => {
            // 终止流程
            axios.flow({
                method: 'POST',
                url: '/api/engine/instance/stop?insId=' + flowInfo.value.id,
            }).then((res: any) => {
                flowLoading.value = false
                console.log('stop res', res)
                if (res.success) {
                    dialog.success('终止成功')
                } else {
                    dialog.error(res.message)
                }
            })
        }
    })
}

/**
 * 签收流程
 */
function sign() {
    if (!currTask.value) {
        return
    }
    dialog.confirm({
        content: '确定签收当前任务吗？',
        onOk: () => {
            // 签收任务
            flowLoading.value = true
            axios.flow({
                method: 'POST',
                url: '/api/engine//task/sign"',
                data: {
                    taskId: currTask.value.id
                }
            }).then((res: any) => {
                flowLoading.value = false
                currTask.value.signTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
                if (res.success) {
                    message.success('签收成功')
                } else {
                    dialog.error(res.message)
                }
            })
        }
    })
}

/**
 * 返回
 */
function goback() {
    router.back()
}

function loadFlowForm() {
    if (!flowInfo.value?.flowChart) {
        return;
    }

    if (flowModel.value == 'run' || currTask.value) {
        // 获取当前活动任务节点表单
        //@ts-ignore
        const result = loadPreFormSync(flowInfo.value.flowChart, flowInfo.value.flowChart.nodes.find((node: any) => node.sn == currTask.value.sn))
        if (result) {
            flowForm.value.type = 'form'
            flowForm.value.sn = result + ':form'
        }
    } else {
        // 获取开始节点表单
        const startNode = flowInfo.value?.flowChart.nodes.find((node: any) => node.types == 'start')
        if (startNode) {
            if (startNode.data?.formType == 1) {
                //动态表单
                if (!startNode.data?.formSn) {
                    dialog.error('流程配置异常，开始节点未配置表单')
                    return
                }
                flowForm.value.type = 'form'
                flowForm.value.sn = startNode.data.formSn + ':form'
            } else if (startNode.data?.formType == 2) {
                // 外部表单
            }
        }
    }
}


// 加载流程信息
function loadFlowInfo() {
    if (flowModel.value == 'start') {
        if (!flowSn.value) {
            dialog.error('参数fsn不能为空')
            return;
        }
    } else {
        if (!flowId.value) {
            dialog.error('参数fid不能为空')
            return;
        }
    }

    let url = '/api/engine/instance/view/' + flowId.value
    if (flowModel.value == 'start') {
        // 加载流程模版
        url = '/api/engine/profile/' + flowSn.value
    } else if (flowModel.value == 'archive' || flowModel.value == 'view') {
        // 加载流程历史信息
        url = '/api/engine/instance/detail/' + flowId.value
    }

    // 加载流程信息
    axios.flow({
        url,
        method: 'post',
    }).then((res: any) => {
        if (res.success && res.body) {
            flowInfo.value = res.body
            flowForm.value.bid = res.body.busiKey || busiId.value
            if (flowInfo.value?.runs?.[0]) {
                currTask.value = flowInfo.value.runs[0]
            }
            loadFlowForm()
        } else {
            dialog.error(res.message)
        }
    })

}

function processFlowChart() {
    const flowChart = JSON.parse(JSON.stringify(flowInfo.value.flowChart))
    // 处理任务状态
    processTaskStatus(flowChart, flowInfo.value.tasks, flowInfo.value.runs)
    return flowChart
}

onMounted(() => {
    loadFlowInfo()
})

</script>
<style lang="less" scoped>
.unione-flow-run {
    height: 100%;
    display: flex;
    flex-direction: row;
    background-color: #f5f5f5;
    justify-content: space-between;

    .flow-content {
        width: calc(100% - 360px);
        background-color: #fff;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        &.max-width {
            width: 100%;
        }

        .flow-header {
            height: 45px;
            border-bottom: 1px solid rgba(5, 5, 5, 0.06);
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            .flow-title {
                height: 100%;
                font-size: 18px;
                font-weight: 500;
                color: #333;
                display: flex;
                align-items: center;

                .btn-back {
                    cursor: pointer;
                    margin: 0 10px;
                }

                .priority {
                    color: #1677ff;
                    margin-left: 5px;
                    font-size: 14px;
                }
            }

            .flow-info {
                height: 100%;
                color: #333;
                display: flex;
                align-items: center;

                .item {
                    margin-right: 20px;
                    color: #999;
                }

                .opts {
                    font-size: 18px;
                    font-weight: 500;

                    .opt {
                        margin-right: 10px;
                        cursor: pointer;

                        &.active {
                            color: #1677ff;
                        }
                    }
                }
            }
        }

        .flow-area {
            width: 100%;
            height: calc(100% - 110px);
            overflow: auto;

            .flow-form {

                &.visible {
                    padding: 10px 20px;
                }

                :deep(.unione-page-form) {
                    padding: 0;
                }
            }
        }

        .flow-tools {
            text-align: right;
            height: 70px;
            padding-top: 5px;
            border-top: 1px solid rgba(5, 5, 5, 0.06);

            .btn {
                margin-right: 10px;
            }
        }

    }

    .flow-right {
        width: 350px;
        background-color: #fff;
        border-radius: 5px;

        :deep(.ant-tabs) {
            height: 100%;

            .ant-tabs-tab {
                padding: 12px 20px;
            }

            .ant-tabs .ant-tabs-tab+.ant-tabs-tab {
                margin-left: 10px;
            }

            .ant-tabs-content-holder {
                height: 100%;

                .ant-tabs-content {
                    height: 100%;
                }
            }
        }


        .flow-task-tab {
            padding: 5px 15px;

            :deep(.ant-timeline-item-head-green) {
                background-color: #52c41a;
            }

            :deep(.ant-timeline-item-head-blue) {
                background-color: #ee9208;
                border-color: #ee9208;
            }
        }

        .flow-comment-tab {
            height: 100%;
        }

    }
}
</style>