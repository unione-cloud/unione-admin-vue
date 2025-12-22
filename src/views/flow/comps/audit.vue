<template>
    <a-drawer :title="title" v-model:visible="visible" :width="600" rootClassName="flow-audit-drawer">
        <a-form layout="vertical" :model="form.data" :rules="form.rules" ref="formRef">

        <div class="handel-opinion">
            <a-form-item label="处理意见：" name="handelOpinion">
                <a-textarea v-model:value="form.data.handelOpinion" autoSize :rows="10" placeholder="请输入处理意见"></a-textarea>
            </a-form-item>
        </div>

        <div class="preset-opinions" v-if="presetOpininList && presetOpininList.length">
            <a-form-item label="预设意见：">
                <div class="ok">
                    <template v-for="item in presetOpininList.filter((item) => item.types == 1)" :key="item.id">
                        <a-tag color="success" @click="toUsePresetOpinion(item)">{{ item.title }}</a-tag>
                    </template>
                </div>
                <div class="reject">
                    <template v-for="item in presetOpininList.filter((item) => item.types == 2)" :key="item.id">
                        <a-tag color="orange" @click="toUsePresetOpinion(item)">{{ item.title }}</a-tag>
                    </template>
                </div>
            </a-form-item>
        </div>
        </a-form>

        <template #footer>
            <a-button type="primary" @click="gotoCommit(true)">同意</a-button>
            <a-button type="primary" danger @click="gotoCommit(false)">拒绝</a-button>
        </template>
    </a-drawer>
</template>
<script setup lang="ts">
import { axios, useDialog } from 'unione-base-vue';
import { ref } from 'vue';
defineOptions({ name: 'FlowAudit' })

const dialog=useDialog()
const props=defineProps({
    vars:{
        type:Object,
        required:false
    }
})

const emit=defineEmits(['success'])

const title=ref('审核')
const visible = ref(false)
const tids = ref<string | Array<string>>()
const flowInfo = ref({
    flowKey: '',
    nodeKey: ''
})
// 预设意见列表
const presetOpininList = ref<Array<any>>([])
const formRef=ref()
const form=ref({
    data:{
        handelOpinion:''
    },
    rules:{
        handelOpinion:[
            { required: true, message: '请输入处理意见' }
        ]
    }
})

function close(){
    visible.value=false;
}
function open(tid: string | Array<string>, { flowKey, nodeKey,nodeTitle }: any = {}) {
    tids.value = tid
    title.value=nodeTitle||'审核'
    if(!tid){
        dialog.error('任务id不能为空')
        return
    }
    visible.value = true
    flowInfo.value.flowKey = flowKey
    flowInfo.value.nodeKey = nodeKey
    form.value.data.handelOpinion=''
    loadPresetOpinionList()
}

function loadPresetOpinionList() {
    const { flowKey, nodeKey } = flowInfo.value
    axios.flow({
        url: `/api/engine/opinion/preset/${flowKey || '-1'}/${nodeKey || '-1'}`,
        method: 'post'
    }).then((res: any) => {
        presetOpininList.value = res.body
    })
}
function toUsePresetOpinion(op: any) {
    form.value.data.handelOpinion = op.optxt
}
function gotoCommit(flag:boolean){
    const label=title.value
    formRef.value.validate().then(()=>{
        dialog.confirm({
            content:`确定提交${label}，并${flag?'同意':'拒绝'}该申请么？`,
            onOk:()=>{
                const data:any={
                    result: flag,
                    opinion: form.value.data.handelOpinion,
                    vars: props.vars
                }
                if(Array.isArray(tids.value)){
                    data.taskIds=tids.value
                }else{
                    data.taskId=tids.value
                }
                axios.flow({
                    url: `/api/engine/task/submit`,
                    method: 'post',
                    data
                }).then((res: any) => {
                    if(res.success){
                        dialog.success(`提交${label}成功`)
                        close()
                        emit('success')
                    }else{
                        dialog.error(res.msg)
                    }
                })
            },
        })
    })
}

defineExpose({ open })
</script>

<style lang="less">
.flow-audit-drawer {

    .handel-opinion {
        .line {
            font-size: 16px;
            margin-bottom: 10px;
        }

        .ant-input {
            min-height: 400px;
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
}
</style>