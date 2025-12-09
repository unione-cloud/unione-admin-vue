<template>
    <div class="flow-var-select">
        <a-drawer :title="title" :width="props.width" v-if="props.show == 'drawer'" v-model:visible="visible"
            :placement="props.position" :maskClosable="false" :bodyStyle="{ padding: 0 }"
            class="var-select var-select-drawer">
            <VarList :scope="props.scope" ref="varListRef" :width="props.width" />
            <template #footer>
                <a-button type="primary" @click="handelOk">确定</a-button>
                <a-button @click="visible = false">取消</a-button>
            </template>
        </a-drawer>
        <a-modal :title="title" :width="props.width" v-if="props.show == 'dialog'" v-model:open="visible"
            :centered="props.position == 'center'" :maskClosable="false" class="var-select var-select-dialog"
            @ok="handelOk">
            <VarList :scope="props.scope" ref="varListRef" :width="props.width" />
        </a-modal>
    </div>
</template>
<script setup lang="ts">
import { useDialog } from 'unione-base-vue';
import { computed, inject, onMounted, ref, watch } from 'vue';
import VarList from './var-list.vue'

defineOptions({
    name: 'FlowVarSelect'
})

const dialog = useDialog()
const props = defineProps({
    title: {
        type: String,
        default: '流程变量'
    },
    scope: {
        type: Array<String>,
        default: () => ['flow', 'node']
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
    }
})
const visible = defineModel('visible')
watch(visible, (val) => {
    if (val) {
        varListRef.value?.init()
    }
})

const emit = defineEmits(['ok'])
const varListRef = ref()
function handelOk() {
    const selected = varListRef.value?.getSelected()
    if (selected?.names?.length > 0) {
        visible.value = false
        console.log('user selcect ok', selected)
        emit('ok', { ...selected })
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
}
</style>