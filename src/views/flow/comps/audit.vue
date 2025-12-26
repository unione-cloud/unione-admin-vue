<template>
    <a-form layout="vertical" :model="formObj.data" :rules="formObj.rules" ref="formRef">
        <div class="handel-opinion">
            <a-form-item :label="nodeObj.types == 'task' ? '处理意见：' : '反馈意见：'" name="handelOpinion">
                <a-textarea v-model:value="formObj.data.handelOpinion" autoSize :rows="5"
                    :placeholder="nodeObj.types == 'task' ? '请输入处理意见' : '请输入反馈意见'"></a-textarea>
                <a-button type="link" class="save-preset" @click="savePresetOpinion">设为常用语</a-button>
            </a-form-item>
        </div>
        <div class="preset-opinions" v-if="presetListOk?.length || presetListReject?.length">
            <a-form-item label="预设意见：">
                <div class="ok" v-if="presetListOk">
                    <draggable v-model="presetListOk" @change="(e: any) => handleChange('ok', e)" :animation="300"
                        ghost-class="ghost" group="preopinion" handle=".drag-handle">
                        <template #item="{ element }">
                            <a-tag color="success" @click="toUsePresetOpinion(element)"
                                :class="[element.isGlobal != 1 && 'drag-handle']">{{ element.title }}</a-tag>
                        </template>
                    </draggable>
                </div>
                <div class="reject">
                    <draggable v-model="presetListReject" @change="(e: any) => handleChange('reject', e)"
                        :animation="300" ghost-class="ghost" group="preopinion" handle=".drag-handle">
                        <template #item="{ element }">
                            <a-tag color="orange" @click="toUsePresetOpinion(element)"
                                :class="[element.isGlobal != 1 && 'drag-handle']">{{ element.title }}</a-tag>
                        </template>
                    </draggable>
                </div>
            </a-form-item>
        </div>
    </a-form>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import { axios, useDialog } from 'unione-base-vue';
import { ref } from 'vue';
import draggable from 'vuedraggable'
defineOptions({ name: 'FlowAudit' })

const dialog = useDialog()
const props = defineProps({
    vars: {
        type: Object,
        required: false
    }
})

const emit = defineEmits(['success'])

const nodeObj = ref<any>({
    title: '审核',
    types: 'task',
    tids: ''
})
const flowInfo = ref({
    fsn: '',
    nsn: ''
})
// 预设意见列表
const presetListOk = ref<Array<any>>([])
const presetListReject = ref<Array<any>>([])

const formRef = ref()
const formObj = ref({
    data: {
        handelOpinion: ''
    },
    rules: {
        handelOpinion: [
            { required: true, message: '请输入处理意见' }
        ]
    }
})


function init(tid: string | Array<string>, { fsn, nsn, types, ntitle }: any = {}) {
    nodeObj.value.tids = tid
    nodeObj.value.title = ntitle || '审核'
    nodeObj.value.types = types || 'task'
    if (!tid) {
        dialog.error('任务id不能为空')
        return
    }
    flowInfo.value.fsn = fsn
    flowInfo.value.nsn = nsn
    formObj.value.data.handelOpinion = ''
    loadPresetOpinionList()
}

function loadPresetOpinionList() {
    axios.flow({
        url: `/api/engine/opinion/preset/-1/-1`,
        method: 'post'
    }).then((res: any) => {
        presetListOk.value = res.body.filter((item: any) => item.types == 1)
        presetListReject.value = res.body.filter((item: any) => item.types == 2)
    })
}
function toUsePresetOpinion(op: any) {
    formObj.value.data.handelOpinion = op.optxt
}

function savePresetOpinion() {
    if (!formObj.value.data.handelOpinion) {
        dialog.error('请输入处理意见')
        return
    }
    axios.flow({
        url: `/api/opinion/preset/save`,
        method: 'post',
        data: {
            title: formObj.value.data.handelOpinion,
            optxt: formObj.value.data.handelOpinion,
            types: 1
        }
    }).then((res: any) => {
        if (res.success) {
            message.success('设为常用语成功')
            loadPresetOpinionList()
        } else {
            dialog.error(res.message)
        }
    })
}

function handleChange(type: String, e: any) {
    console.log('event', e)
    if (e.added?.element) {
        axios.flow({
            url: '/api/opinion/preset/setType',
            method: 'POST',
            data: { id: e.added.element.id, types: type == 'ok' ? 1 : 2 }
        })
    }
}

function commit(action: string, result: boolean, form?: any) {
    const label = nodeObj.value.title
    formRef.value.validate().then(() => {
        dialog.confirm({
            content: action == 'submit' ? `确定提交当前流程么？` : `确定驳回当前流程么？`,
            onOk: () => {
                const data: any = {
                    action,
                    result,
                    opinion: formObj.value.data.handelOpinion,
                    vars: props.vars,
                    form
                }
                if (Array.isArray(nodeObj.value.tids)) {
                    data.taskIds = nodeObj.value.tids
                } else {
                    data.taskId = nodeObj.value.tids
                }
                axios.flow({
                    url: `/api/engine/task/submit`,
                    method: 'post',
                    data
                }).then((res: any) => {
                    if (res.success) {
                        dialog.success({
                            content: action == 'submit' ? `提交${label}成功` : `驳回${label}成功`,
                            onOk: () => {
                                emit('success', { task: res.body, result, action })
                            }
                        })
                    } else {
                        dialog.error(res.msg)
                    }
                })
            },
        })
    })
}

defineExpose({ init, commit })
</script>

<style lang="less" scoped>
.handel-opinion {
    .line {
        font-size: 16px;
        margin-bottom: 10px;
    }

    .ant-input {
        min-height: 140px;
    }

    .save-preset {
        float: right;
        margin-top: -35px;
    }
}

.preset-opinions {
    .line {
        font-size: 16px;
        margin: 20px 0 10px 0;
    }

    .ok,
    .reject {
        margin-bottom: 10px;
    }

    .ant-tag {
        cursor: pointer;
        margin: 5px 15px 0 15px;
    }
}


.ant-drawer-footer {
    text-align: right;

    .ant-btn {
        margin: auto 10px;
    }
}
</style>