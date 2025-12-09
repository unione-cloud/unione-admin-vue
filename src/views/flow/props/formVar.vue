<template>
    <div class="form-var-select">
        <a-tree-select v-model:value="modelValue" placeholder="请选择表单字段" :treeLine="{ showLine: true }"
            :fieldNames="{ label: 'label' }" :tree-data="formFieldList" @select="handleFieldSelect">
        </a-tree-select>
        <a-button @click="toloadFormDataModels(true)">刷新</a-button>
        <div class="error-info" v-if="errorInfo">{{ errorInfo }}</div>
    </div>
</template>
<script setup lang="ts">
import { computed, inject, onMounted, ref, type PropType } from 'vue';
import { loadFormDataModels } from '../lib/flowUtil';
import type { WidgetModel } from 'unione-form-vue/dist/typing';

const emit = defineEmits(['change', 'select'])
// 组件属性定义
const props = defineProps({
    wid: {
        type: String,
        required: false
    },
    engine: {
        type: Object,
        required: false
    },
    widget: {
        type: Object as PropType<WidgetModel>,
        required: false
    },
    formValue: {
        type: Object
    },
})
const modelValue = defineModel('value')

// 组件定义
const widgetEvent = ref<any>({})
const widgetObj = computed(() => {
    const widget = props.engine?.widget(props.wid) || props.widget || {}

    // 组件事件处理
    if (widget.event) {
        Object.keys(widget.event).forEach((eName: string) => {
            const eventObj = widget.event[eName]
            if (!eventObj) {
                return
            }
            widgetEvent.value[eName] = null
            if (typeof eventObj === 'function') {
                widgetEvent.value[eName] = eventObj
            } else if (eventObj.enable && eventObj.scriptText) {
                widgetEvent.value[eName] = new Function('value', 'ctx', eventObj.scriptText)
            }
        })
    }

    return widget
})

const errorInfo = ref()

const flowGraph = inject<Function>('flowGraph')
const activeNode = inject<Function>('activeNode')
const formFieldList = ref<Array<{ label: string, value: string, dataType: string, selectable?: boolean, children?: Array<{ label: string, value: string, dataType: string }> }>>([])
/**
 * 加载当前节点绑定的表单数据模型
 * @param force 
 */
function toloadFormDataModels(force?: boolean) {
    errorInfo.value = false
    if (loadFormDataModels && activeNode && flowGraph) {
        const graph = flowGraph()
        const currNode = activeNode()
        // 加载表单字段
        loadFormDataModels(graph, currNode, force).then((dataModels: any) => {
            formFieldList.value = (dataModels || []).map((item: any) => {
                return {
                    label: item.title,
                    value: item.name,
                    dataType: item.types,
                    selectable: false,
                    isLeaf: false,
                    children: (item.fields || []).map((field: any) => {
                        return {
                            label: field.title,
                            title: item.title + '#' + field.title,
                            value: item.dsn + '.' + field.name,
                            dataType: field.types,
                        }
                    })
                }
            })
        }).catch((err: any) => {
            errorInfo.value = err || '请先绑定流程表单'
        })
    }
}
/**
 * 处理表单字段选择
 * @param value 选中的值
 * @param item 选中的项
 */
function handleFieldSelect(value: any, item: any) {
    const option: any = {
        title: item.label,
        titleFull: item.title,
        name: item.value,
        dataType: item.dataType,
    }
    if (widgetEvent.value.select) {
        widgetEvent.value.select(value, { option, formValue: props.formValue })
    }
    emit('change', value)
    emit('select', value, option)
}

onMounted(() => {
    toloadFormDataModels(true)
})

</script>
<style lang="less" scoped>
.form-var-select {
    :deep(.ant-select) {
        width: calc(100% - 50px);
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;

        .ant-select-selector {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
    }

    :deep(.ant-btn) {
        padding: 0 5px;
        border-left: none;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    :deep(.ant-btn:hover) {
        border-color: #d9d9d9;
    }

    .error-info {
        color: red;
        font-size: 12px;
        margin-top: 4px;
        text-align: center;
    }
}
</style>