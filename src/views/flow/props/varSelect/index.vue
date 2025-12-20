<template>
    <div class="flow-var-select">
        <a-drawer :title="title" :width="props.width" v-if="props.show == 'drawer'" v-model:visible="visible"
            :placement="props.position" :maskClosable="false" :bodyStyle="{ padding: 0 }"
            class="var-select var-select-drawer">
            <template #extra>
                <div class="target-info" v-if="props.target && !props.multi">
                    <div :class="['target-title', { 'active': varFilter.type == 'title' }]"
                        @click="varFilter.toFilter('title')">标题：<span
                            :style="{ 'color': varMatchStats.title ? '#1890ff' : '#666' }">{{
                                props.target.title }}</span></div>
                    <div :class="['target-name', { 'active': varFilter.type == 'name' }]"
                        @click="varFilter.toFilter('name')">名称：<span
                            :style="{ 'color': varMatchStats.name ? '#1890ff' : '#666' }">{{
                                props.target.name }}</span></div>
                    <div :class="['target-dataType', { 'active': varFilter.type == 'dataType' }]"
                        @click="varFilter.toFilter('dataType')" v-if="props.target.dataType">数据类型：<span
                            :style="{ 'color': varMatchStats.dataType ? '#1890ff' : 'red' }">{{ props.target.dataType
                            }}</span></div>
                </div>
            </template>
            <VarList :scope="props.scope" ref="varListRef" :width="props.width" :target="props.target"
                :multi="props.multi" :flowChart="props.flowChart" :varFilter="varFilter.type"
                v-model:varMatchStats="varMatchStats" />
            <template #footer>
                <a-button type="primary" @click="handelOk">确定</a-button>
                <a-button @click="visible = false">取消</a-button>
            </template>
        </a-drawer>
        <a-modal :title="title" :width="props.width" v-if="props.show == 'dialog'" v-model:open="visible"
            :centered="props.position == 'center'" :maskClosable="false" class="var-select var-select-dialog"
            @ok="handelOk">
            <template #extra>
                <div class="target-info" v-if="props.target">
                    <div class="target-title">{{ props.target.title }}</div>
                    <div class="target-name">{{ props.target.name }}</div>
                    <div class="target-dataType">{{ props.target.dataType }}</div>
                </div>
            </template>
            <VarList :scope="props.scope" ref="varListRef" :width="props.width" :target="props.target"
                :multi="props.multi" :flowChart="props.flowChart" :varFilter="varFilter.type"
                v-model:varMatchStats="varMatchStats" />
        </a-modal>
    </div>
</template>
<script setup lang="ts">
import { useDialog } from 'unione-base-vue';
import { ref, watch, type PropType } from 'vue';
import VarList from './var-list.vue';

defineOptions({
    name: 'FlowVarSelect'
})

const dialog = useDialog()
const props = defineProps({
    title: {
        type: String,
        default: '流程变量'
    },
    target: {
        type: Object as PropType<{ title: string, name: string, dataType: string }>,
    },
    scope: {
        type: Array<String>,
        default: () => ['flowVar', 'nodeVar']   // formVar:表单变量，dataNode：数据节点,sysVar:系统变量
    },
    show: {
        type: String,
        default: 'drawer' // drawer | dialog
    },
    position: {
        type: String,
        default: 'right' //  right | center | left
    },
    width: {
        type: Number,
        default: 750
    },
    flowChart: {
        type: Object
    },
    multi: {
        type: Boolean,
        default: false
    }
})
const varMatchStats = defineModel('varMatchStats', {
    type: Object as PropType<{ title: boolean, name: boolean, dataType: boolean }>,
    default: () => ({ title: false, name: false, dataType: false })
})
const visible = defineModel('visible')
watch(visible, (val) => {
    if (val) {
        varListRef.value?.init()
    }
})

const varFilter = ref({
    type: '',
    toFilter: (type: string) => {
        if (varFilter.value.type == type) {
            varFilter.value.type = ''
            return
        }
        varFilter.value.type = type
    }
})

const emit = defineEmits(['ok'])
const varListRef = ref()
function handelOk() {
    const selected = varListRef.value?.getSelected()
    if (selected?.names?.length > 0) {
        if (props.target?.dataType && !varMatchStats.value.dataType) {
            if (props.target.dataType != 'String') {
                dialog.error({ content: '数据类型不匹配，不能绑定' })
                return
            } else {
                dialog.confirm({
                    content: '绑定字段数据类型不是字符串，是否继续绑定？',
                    onOk: () => {
                        visible.value = false
                        emit('ok', selected)
                        return
                    }
                })
                return
            }
        }
        visible.value = false
        emit('ok', selected)
        return
    }
    dialog.warning({ content: '请选择变量' })
}


</script>
<style lang="less" scoped>
.var-select {
    &.var-select-drawer {
        .ant-drawer-footer {
            .ant-btn {
                float: right;
                margin: auto 10px;
            }
        }
    }

    .target-info {
        display: flex;
        flex-direction: row;
        gap: 4px;

        >div {
            cursor: pointer;
        }

        .active {
            border-bottom: 2px solid #1890ff;
        }
    }
}
</style>