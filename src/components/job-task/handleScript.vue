<template>
    <div class="unione-job-task handle-script">
        <div class="opt-box">
            <span class="tips">{{ modelValue.length == 0 ? '任务处理为空，点击新增按钮添加任务处理' : '' }}</span>
            <a-button size="small" @click="addScript">新增</a-button>
        </div>
        <div class="script-box" v-for="(item, index) in modelValue" :key="index">
            <div class="index">
                <a-tag color="red">{{ index + 1 }}</a-tag>
                <DeleteOutlined class="btn-del" @click="delScript(index)" />
            </div>
            <a-form-item label="处理条件" required :labelCol="{ span: 24 }"
                help="条件表达式，表达式结果为真，执行处理脚本，变量获取方式:#{params.字段名称},如：#{params.sex==1}">
                <a-textarea v-model:value="item.condition"></a-textarea>
            </a-form-item>
            <a-form-item label="处理类型" required :labelCol="{ span: 24 }">
                <unione-radio-box :convert="{ types: 'dict', dictName: 'TASKSCRIPTYPE' }"
                    v-model:value="item.type"></unione-radio-box>
            </a-form-item>
            <a-form-item label="数据源" required :labelCol="{ span: 24 }" v-if="item.type != 'script'">
                <unione-select-box
                    :convert="{ types: 'local', url: '/api/data/source/find', labelField: 'title', search: true }"
                    v-model:value="item.dsId"></unione-select-box>
            </a-form-item>
            <a-form-item label="SQL" required :labelCol="{ span: 24 }" v-if="item.type == 'sql'"
                help="SQL语句，支持变量替换，如：#{params.字段名称},如：#{params.sex}">
                <unione-code-editor lang="sql" v-model:value="item.sql"></unione-code-editor>
            </a-form-item>
            <a-form-item label="处理脚本" required :labelCol="{ span: 24 }" v-if="item.type == 'script'"
                help="处理脚本，支持变量替换，如：#{params.字段名称},如：#{params.sex}">
                <unione-code-editor lang="javascript" v-model:value="item.script"></unione-code-editor>
            </a-form-item>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useDialog } from 'unione-base-vue';
import { onMounted, ref, watch } from 'vue';

const dialog = useDialog()
const emit = defineEmits(['change'])
const modelValue = defineModel<Array<any>>('value', {
    default: () => []
})

function addScript() {
    modelValue.value.push({
        type: 'sql'
    })
    modelValue.value = [...modelValue.value]
    emit('change', modelValue.value)
}

function delScript(index: number) {
    dialog.confirm({
        content: '确定要删除吗？',
        onOk: () => {
            modelValue.value.splice(index, 1)
            emit('change', modelValue.value)
        }
    })
}



</script>
<style lang="less" scoped>
.handle-script {
    height: 100%;

    .opt-box {
        display: flex;
        justify-content: space-between;

        .tips {
            font-size: 12px;
            color: #999;
            line-height: 25px;
        }
    }

    .script-box {
        border: 1px solid #e8e8e8;
        border-radius: 5px;
        padding: 10px;
        margin-top: 5px;
        position: sticky;

        .index {
            position: absolute;
            top: 0;
            left: -25px;
            display: flex;
            flex-direction: column;

            .btn-del {
                cursor: pointer;
                margin-top: 5px;
                margin-left: 3px;
            }
        }
    }
}
</style>