<template>
    <a-form layout="vertical" :model="form.data" :rules="form.rules" ref="formRef">
        <div class="handel-opinion">
            <a-form-item label="处理意见：" name="handelOpinion">
                <a-textarea v-model:value="form.data.handelOpinion" autoSize :rows="5"
                    placeholder="请输入处理意见"></a-textarea>
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

const title = ref('审核')
const tids = ref<string | Array<string>>()
const flowInfo = ref({
    fsn: '',
    nsn: ''
})
// 预设意见列表
const presetListOk = ref<Array<any>>([])
const presetListReject = ref<Array<any>>([])

const formRef = ref()
const form = ref({
    data: {
        handelOpinion: ''
    },
    rules: {
        handelOpinion: [
            { required: true, message: '请输入处理意见' }
        ]
    }
})


function init(tid: string | Array<string>, { fsn, nsn, ntitle }: any = {}) {
    tids.value = tid
    title.value = ntitle || '审核'
    console.log('ntitle', ntitle)
    if (!tid) {
        dialog.error('任务id不能为空')
        return
    }
    flowInfo.value.fsn = fsn
    flowInfo.value.nsn = nsn
    form.value.data.handelOpinion = ''
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
    form.value.data.handelOpinion = op.optxt
}

function savePresetOpinion() {
    if (!form.value.data.handelOpinion) {
        dialog.error('请输入处理意见')
        return
    }
    axios.flow({
        url: `/api/opinion/preset/save`,
        method: 'post',
        data: {
            title: form.value.data.handelOpinion,
            optxt: form.value.data.handelOpinion,
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

function commit(flag: boolean) {
    const label = title.value
    formRef.value.validate().then(() => {
        dialog.confirm({
            content: `确定提交${label}，并${flag ? '同意' : '拒绝'}该申请么？`,
            onOk: () => {
                const data: any = {
                    result: flag,
                    opinion: form.value.data.handelOpinion,
                    vars: props.vars
                }
                if (Array.isArray(tids.value)) {
                    data.taskIds = tids.value
                } else {
                    data.taskId = tids.value
                }
                axios.flow({
                    url: `/api/engine/task/submit`,
                    method: 'post',
                    data
                }).then((res: any) => {
                    if (res.success) {
                        dialog.success({
                            content: `提交${label}成功`,
                            onOk: () => {
                                emit('success', res.body)
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