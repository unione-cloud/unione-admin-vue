<template>
    <a-select class="flow-node-select" v-model:value="modelValue" :options="selectOptions"
        @change="handelChange"></a-select>
</template>
<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue';

const props = defineProps({
    types: {
        type: String,
        default: 'task'
    },
    scope: {
        type: String,
        default: 'all' //all:所有节点,pre:仅前驱节点,next:仅后继节点
    }
})

const emit = defineEmits(['change'])
const modelValue = defineModel('value')
const selectOptions = computed(() => {
    const graph = flowGraph()
    if (graph) {
        const active = activeNode()
        if (active && props.scope == 'pre') {
            const edges = graph.getRoutes()
            const edgeMap: any = {}
            edges.forEach((edge: any) => {
                if (!edgeMap[edge.attr?.target?.cell]) {
                    edgeMap[edge.attr?.target?.cell] = []
                }
                edgeMap[edge.attr?.target?.cell].push(edge)
            })
            const nodeMap: any = {}
            graph.getNodes().forEach((node: any) => {
                nodeMap[node.sn] = node
            })
            const getPreNodes = (node: any) => {
                const preEdges = edgeMap[node.sn] || []
                const preNodes = preEdges.map((edge: any) => edge.attr?.source?.cell).filter((cell: any) => nodeMap[cell]).map((cell: any) => nodeMap[cell])
                const pres: any = []
                preNodes.forEach((n: any) => {
                    pres.push(...getPreNodes(n))
                })
                return [...pres, ...preNodes]
            }
            return getPreNodes(active).filter((node: any) => {
                return !props.types || node.types == props.types
            }).map((node: any) => {
                return {
                    label: node.title,
                    value: node.sn
                }
            })
        } else if (active && props.scope == 'next') {
            const edges = graph.getRoutes()
            const edgeMap: any = {}
            edges.forEach((edge: any) => {
                if (!edgeMap[edge.attr?.source?.cell]) {
                    edgeMap[edge.attr?.source?.cell] = []
                }
                edgeMap[edge.attr?.source?.cell].push(edge)
            })
            const nodeMap: any = {}
            graph.getNodes().forEach((node: any) => {
                nodeMap[node.sn] = node
            })
            const getNextNodes = (node: any) => {
                const nextEdges = edgeMap[node.sn] || []
                const nextNodes = nextEdges.map((edge: any) => edge.attr?.target?.cell).filter((cell: any) => nodeMap[cell]).map((cell: any) => nodeMap[cell])
                const nexts: any = []
                nextNodes.forEach((n: any) => {
                    nexts.push(...getNextNodes(n))
                })
                return [...nexts, ...nextNodes]
            }
            return getNextNodes(active).filter((node: any) => {
                return !props.types || node.types == props.types
            }).map((node: any) => {
                return {
                    label: node.title,
                    value: node.sn
                }
            })
        }

        return graph.getNodes().filter((node: any) => {
            return !props.types || node.types == props.types
        }).filter((node: any) => {
            return !active || node.sn != active.sn
        }).map((node: any) => {
            return {
                label: node.title,
                value: node.sn
            }
        })
    }
    return [];
})

const flowGraph: any = inject('flowGraph')
const activeNode: any = inject('activeNode')
function handelChange() {
    emit('change', modelValue.value)
}


</script>
<style lang="less" scoped>
.flow-node-select {
    width: 100%;
}
</style>