<template>
    <div class="unione-flow-run">
        <div :class="['flow-content', !rightPanel.open && 'max-width']">
            <div class="flow-header">
                <div class="flow-title">
                    <ArrowLeftOutlined class="btn-back" /><span class="label">请假申请流程</span><span
                        class="priority">•（普通）</span>
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
                    <unione-page-form :psn="flowForm.sn" :btns="false" v-show="!flowChartVisible"></unione-page-form>
                </div>
                <UFEditor v-if="flowChartVisible && flowInfo?.flowChart" model="run"
                    :value="JSON.parse(JSON.stringify(flowInfo.flowChart))">
                </UFEditor>
            </div>
            <div class="flow-tools">
                <a-button class="btn" danger>撤回</a-button>
                <a-button class="btn">催办</a-button>
                <a-button class="btn">加签</a-button>
                <a-button class="btn">暂存</a-button>
                <a-button class="btn" type="primary">办理</a-button>
                <a-button class="btn" danger>放弃</a-button>
                <a-button class="btn">转审</a-button>
                <a-button class="btn">协办</a-button>
                <a-button class="btn" type="primary">同意</a-button>
                <a-button class="btn" danger>拒绝</a-button>
            </div>
        </div>
        <div class="flow-right" v-if="rightPanel.open">
            <a-tabs v-model:active="rightPanel.active">
                <a-tab-pane tab="流转" key="task" class="flow-task-tab">
                    <a-timeline>
                        <a-timeline-item color="blue"><flow-task></flow-task></a-timeline-item>
                        <a-timeline-item color="green"><flow-task></flow-task></a-timeline-item>
                        <a-timeline-item color="green"><flow-task></flow-task></a-timeline-item>
                    </a-timeline>
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
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

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
    // 业务id
    bid: {
        type: String,
    },
    // 模式：start:启动，run：运行，view：详情，archive：归档
    model: {
        type: String,
    }
})
const route = useRoute()
const dialog = useDialog()

const rightPanel = ref({
    open: true,
    active: 'task',
})

const flowChartVisible = ref(false)
// 流程信息
const flowInfo = ref<any>()
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
    return props.bid || route.query.bid;
})
// 流程模式
const flowModel = computed(() => {
    return props.model || route.query.model;
})

// 流程表单
const flowForm = ref<any>({
    type: 'form',   //form,custom
    url: '',
    sn: null,
    define: null
})

function loadFlowForm() {
    if (!flowInfo.value?.flowChart) {
        return;
    }

    if (flowModel.value == 'run') {
        // 获取当前活动任务节点表单

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
            loadFlowForm()
        } else {
            dialog.error(res.message)
        }
    })

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
                background-color: #1677ff;
            }
        }

        .flow-comment-tab {
            height: 100%;
        }

    }
}
</style>