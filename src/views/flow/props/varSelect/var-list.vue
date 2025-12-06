<template>
    <div class="var-select-list">
        <a-tabs v-model:activeKey="activeKey" tab-position="left">
            <template v-for="item in varData" :key="item.key">
                <a-tab-pane v-if="props.scope.includes(item.key)" :key="item.key" :tab="item.title">
                    <a-table :columns="columns" :row-selection="selection" :data-source="item.vars" :pagination="false"
                        size="small" row-key="name"></a-table>
                </a-tab-pane>
            </template>
        </a-tabs>
    </div>
</template>
<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'

defineOptions({
    name: 'VarSelectList',
})

const props = defineProps({
    scope: {
        type: Array<String>,
        default: () => ['flow', 'node']
    },
})
const activeKey = ref(props.scope[0])
const varData = ref([
    {
        title: '流程变量',
        key: 'flow',
        vars: []
    },
    {
        title: '节点变量',
        key: 'node',
        vars: []
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
    width: 80,
},
{
    title: '作用域',
    dataIndex: 'scope',
    key: 'scope',
    width: 60,
    customRender: ({ text }: any) => {
        return text == 'global' ? '全局' : '本地'
    }
},
])
const selection = ref<any>({
    selectedRowKeys: [],
    selectedRowList: [],
    onChange: (rowKeys: any[], selectedRows: any[]) => {
        selection.value.selectedRowKeys = rowKeys.length ? [rowKeys[rowKeys.length - 1]] : []
        selection.value.selectedRowList = selectedRows.length ? [selectedRows[selectedRows.length - 1]] : []
    },
})

const flowGraph: any = inject('flowGraph')
const activeNode: any = inject('activeNode')

function init() {
    const flowVars = flowGraph().getJson().setting?.vars || []
    const nodeVars = activeNode().data?.vars || []
    varData.value[0].vars = []
    if (flowVars?.global) {
        varData.value[0].vars = flowVars.global.map((item: any) => {
            return {
                ...item,
                scope: 'global'
            }
        })
    }
    varData.value[1].vars = []
    if (nodeVars) {
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
function getSelected() {
    return {
        names: selection.value.selectedRowKeys,
        list: selection.value.selectedRowList,
    }
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
}
</style>