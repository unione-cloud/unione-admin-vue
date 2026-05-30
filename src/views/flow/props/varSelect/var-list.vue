<template>
    <div class="var-select-list">
        <a-tabs v-model:activeKey="activeKey" tab-position="left" @change="handelTabChange">
            <template v-for="item in varData" :key="item.key">
                <a-tab-pane v-if="props.scope.includes(item.key)" :key="item.key" :tab="item.title">
                    <div v-if="item.key == 'formVar'" class="form-var-select">
                        数据模型：
                        <a-select :options="item.tables" style="width: 300px;" @select="handelTableChange"
                            v-model:value="activeTable"></a-select>
                    </div>
                    <a-table
                        :columns="['flowVar', 'nodeVar'].includes(item.key) ? columns : columns.filter((col: any) => col.dataIndex != 'scope')"
                        :customRow="(record: any) => {
                            return {
                                ...record,
                                onClick: (event: any) => {
                                    selection.onClick(record)
                                }
                            }
                        }" :row-selection="selection" :data-source="doVarFilter(item.vars)" :pagination="false"
                        :scroll="{ x: props.width - 100 }" size="small" row-key="name"
                        v-if="item.key != 'expVar'"></a-table>
                    <div v-if="item.key == 'expVar'" class="exp-var-select">
                        <a-textarea :rows="8" v-model:value="expVarValue"></a-textarea>
                        <div class="tips">请输入表达式，支持常量，流程变量，系统变量，如：{var.flowInsId},{var.formId},{sys.now},{sys.userId}
                        </div>
                    </div>
                </a-tab-pane>
            </template>
        </a-tabs>
    </div>
</template>
<script setup lang="ts">
import { inject, onMounted, ref, watch, type PropType } from 'vue'
import { loadFormDataModelById, loadFormDataModels } from '../../lib/flowUtil'
import { useConfigStore } from '@/config'

defineOptions({
    name: 'VarSelectList',
})

const config = useConfigStore()

const props = defineProps({
    scope: {
        type: Array<String>,
        default: () => ['flowVar', 'nodeVar']
    },
    width: {
        type: Number,
        default: 550
    },
    target: {
        type: Object as PropType<{ title: string, name: string, dataType: string }>,
    },
    varFilter: {
        type: String // title,name,dataType
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
    default() {
        return { title: false, name: false, dataType: false }
    }
})


const activeKey = ref(props.scope[0])
const activeTable = ref('')
const varData = ref<any>([
    {
        title: '流程变量',
        key: 'flowVar',
        vars: []
    },
    {
        title: '节点变量',
        key: 'nodeVar',
        vars: []
    }, {
        title: '表单变量',
        key: 'formVar',
        tables: [],
        active: '',
        vars: []
    }, {
        title: '数据节点',
        key: 'dataNode',
        vars: []
    }, {
        title: '系统变量',
        key: 'sysVar',
        vars: config.config.flow.systemFieldList.map((f: any) => {
            return {
                title: f.label,
                name: f.value,
                dataType: f.dataType
            }
        })
    }, {
        title: '表达式',
        key: 'expVar'
    }
])
const columns = ref([{
    title: '序号',
    fixed: 'left',
    align: 'center',
    width: 50,
    customRender: (row: any) => {
        return row.index + 1
    }
},
{
    title: '标题',
    dataIndex: 'title',
    key: 'title',
},
{
    title: '名称',
    dataIndex: 'name',
    key: 'name',
},
{
    title: '数据类型',
    dataIndex: 'dataType',
    key: 'dataType',
    width: 90,
    fixed: 'right',
},
{
    title: '作用域',
    dataIndex: 'scope',
    key: 'scope',
    width: 60,
    fixed: 'right',
    customRender: ({ text }: any) => {
        return text == 'global' ? '全局' : '本地'
    }
},
])
const selection = ref<any>({
    selectedRowKeys: [],
    selectedRowList: [],
    onChange: (rowKeys: any[], selectedRows: any[]) => {

        if (props.multi) {
            selection.value.selectedRowKeys = rowKeys
            selection.value.selectedRowList = selectedRows
        } else {
            selection.value.selectedRowKeys = rowKeys.length ? [rowKeys[rowKeys.length - 1]] : []
            selection.value.selectedRowList = selectedRows.length ? [selectedRows[selectedRows.length - 1]] : []
        }

        if (props.target) {
            const varItem = selection.value.selectedRowList[0]
            varMatchStats.value.title = false
            varMatchStats.value.name = false
            varMatchStats.value.dataType = false
            if (varItem.title == props.target?.title) {
                varMatchStats.value.title = true
            }
            if (varItem.name == props.target?.name) {
                varMatchStats.value.name = true
            }
            if (varItem.dataType == props.target?.dataType) {
                varMatchStats.value.dataType = true
            }
            varMatchStats.value = { ...varMatchStats.value }
        }
    },
    onClick: (record: any) => {

        if (props.multi) {
            if (selection.value.selectedRowKeys.includes(record.name)) {
                selection.value.selectedRowKeys = selection.value.selectedRowKeys.filter((item: string) => item != record.name)
                selection.value.selectedRowList = selection.value.selectedRowList.filter((item: any) => item.name != record.name)
            } else {
                selection.value.selectedRowKeys.push(record.name)
                selection.value.selectedRowList.push(record)
            }
        } else {
            selection.value.selectedRowKeys = [record.name]
            selection.value.selectedRowList = [record]
        }

        if (props.target && selection.value.selectedRowList[0]) {
            const varItem = selection.value.selectedRowList[0]
            varMatchStats.value.title = false
            varMatchStats.value.name = false
            varMatchStats.value.dataType = false
            if (varItem.title == props.target?.title) {
                varMatchStats.value.title = true
            }
            if (varItem.name == props.target?.name) {
                varMatchStats.value.name = true
            }
            if (varItem.dataType == props.target?.dataType) {
                varMatchStats.value.dataType = true
            }
            varMatchStats.value = { ...varMatchStats.value }
        }
    }
})

function doVarFilter(vars: any[]) {
    if (props.target && props.varFilter) {
        return vars.filter((item: any) => {
            if (props.varFilter && props.target) {
                //@ts-ignore
                return item[props.varFilter] == props.target[props.varFilter]
            }
            return true
        })
    }
    return vars;
}

const flowGraph: any = inject('flowGraph')
const activeNode: any = inject('activeNode')

const expVarValue = ref('')
watch(() => props.target, (val: any) => {
    expVarValue.value = ''
    if (val) {
        if (val.bindType == 'expVar') {
            expVarValue.value = val.bindValue + ''
        } else {
            selection.value.selectedRowKeys = [val.bindValue]
        }
        activeKey.value = val.bindType
    }
}, { immediate: true })

/**
 * 初始化变量列表
 */
function init() {
    const flowChart = props.flowChart || flowGraph && flowGraph().getJson()

    if (props.scope.includes('flowVar')) {
        const flowVars = flowChart.setting?.vars || []
        varData.value[0].vars = []
        if (flowVars?.global) {
            varData.value[0].vars = flowVars.global.map((item: any) => {
                return {
                    ...item,
                    scope: 'global'
                }
            })
        }
    }
    if (props.flowChart) {
        if (props.scope.includes('formVar')) {
            // 获取开始节点表单
            const startNode = flowChart.nodes.find((item: any) => item.types == 'start')
            if (startNode?.data?.formType == 1 && startNode?.data?.formSn) {
                loadFormDataModelById(startNode.data.formSn).then((models: any) => {
                    if (models?.length) {
                        varData.value[2].tables = models.filter((item: any) => item.group != 'sub').map((item: any) => {
                            return {
                                ...item,
                                label: item.title,
                                value: item.dsn
                            }
                        })
                        activeTable.value = varData.value[2].tables[0]?.value || ''
                        varData.value[2].vars = varData.value[2].tables[0]?.fields || []
                    }
                })
            }
        }
        return
    }

    const currNode = activeNode()
    if (props.scope.includes('nodeVar')) {
        const nodeVars = currNode.data?.vars || []
        varData.value[1].vars = []
        if (nodeVars) {
            if (!nodeVars.local) {
                nodeVars.local = []
            }
            if (!nodeVars.global) {
                nodeVars.global = []
            }
            //@ts-ignore
            varData.value[1].vars = [...nodeVars.local.map((item: any) => {
                return {
                    ...item,
                    scope: 'local'
                }
            }), ...nodeVars.global.map((item: any) => {
                return {
                    ...item,
                    scope: 'global'
                }
            })]
        }
    }
    if (props.scope.includes('formVar')) {
        // 加载表单数据模型
        loadFormDataModels(flowGraph(), currNode).then((models: any) => {
            if (models?.length) {
                varData.value[2].tables = models.filter((item: any) => item.group != 'sub').map((item: any) => {
                    return {
                        ...item,
                        label: item.title,
                        value: item.dsn
                    }
                })
                activeTable.value = varData.value[2].tables[0]?.value || ''
                varData.value[2].vars = varData.value[2].tables[0]?.fields || []
            }
        })
    }
}
function handelTabChange() {
    if (props.target) {
        // 自动匹配
        const vars = varData.value.find((item: any) => item.key == activeKey.value).vars;
        processVarMatch(vars)
    }
}
function processVarMatch(vars: any[]) {
    if (vars?.length && props.target) {
        varMatchStats.value.title = false
        varMatchStats.value.name = false
        varMatchStats.value.dataType = false
        const matchVars = vars.filter((item: any) => {
            const flag = (item.name == props.target?.name || item.title == props.target?.title) && item.dataType == props.target?.dataType
            if (flag) {
                if (item.title == props.target?.title) {
                    varMatchStats.value.title = true
                }
                if (item.name == props.target?.name) {
                    varMatchStats.value.name = true
                }
                varMatchStats.value.dataType = true
            }
            return flag
        })
        if (matchVars?.length) {
            selection.value.selectedRowKeys = [matchVars[0].name]
            selection.value.selectedRowList = [matchVars[0]]
        }
        varMatchStats.value = { ...varMatchStats.value }
    }
}

function getSelected() {
    if (activeKey.value == 'formVar') {
        const model = varData.value[2].tables.find((item: any) => item.value == activeTable.value)
        return {
            type: activeKey.value,
            table: { title: model.title, dsn: model.dsn },
            names: selection.value.selectedRowKeys,
            list: selection.value.selectedRowList,
        }
    }
    if (activeKey.value == 'expVar') {
        if (!expVarValue.value || !expVarValue.value.trim()) {
            return {
                type: activeKey.value,
                names: [],
                list: [],
            }
        }
        return {
            type: activeKey.value,
            names: [expVarValue.value],
            list: [{
                name: expVarValue.value.trim(),
                title: expVarValue.value.indexOf('{') > -1 ? '表达式' : '常量',
            }],
        }
    }
    return {
        type: activeKey.value,
        names: selection.value.selectedRowKeys,
        list: selection.value.selectedRowList,
    }
}

function handelTableChange(value: any, options: any) {
    varData.value[2].vars = options.fields || []
    processVarMatch(varData.value[2].vars)
}

onMounted(() => {
    init()
})

defineExpose({
    init,
    getSelected
})

</script>
<style lang="less" scoped>
.var-select-list {
    :deep(.ant-tabs-tabpane) {
        padding: 0 2px 0 0 !important;
    }

    .form-var-select {
        margin: 5px 15px;
    }

    .exp-var-select {
        margin: 5px;

        .tips {
            font-size: 13px;
            color: #999;
        }
    }
}
</style>