<template>
    <div :class="['flow-form-ref']" ref="formRef">
        <a-input :value="formTitle" :read-only="true" :status="error ? 'error' : ''" allowClear>
            <template #addonAfter>
                <div class="btns">
                    <div class="btn btn-bind" @click="formSelectObj.open()">绑定表单</div>
                    <div class="btn btn-auth">表单权限</div>
                </div>
            </template>
        </a-input>
        <div class="error" v-if="error">{{ error }}</div>
        <unione-form-select ref="formSelectRef" :selected="modelValue ? [modelValue] : []"
            v-model:visible="formSelectObj.visible" @ok="formSelectObj.handelSelect"></unione-form-select>
    </div>
</template>
<script setup lang="ts">
import { axios } from 'unione-base-vue'
import { useDebounce } from 'unione-form-vue'
import { ref, onMounted, computed, watch, inject, nextTick } from 'vue'
import { loadPreForm } from '@/views/flow/lib/flowUtil'

const modelValue = defineModel('value', {
    type: String
})
const emit = defineEmits(['change'])
const formRef = ref()
const formMap = ref<any>({})
const formTitle = computed(() => {
    if (!modelValue.value) {
        return ''
    }
    return formMap.value[modelValue.value] || ''
})
// const error = ref('存在多个前置节点，请手动绑定表单')
const error = ref('')
const flowGraph: any = inject('flowGraph')
const activeNode: any = inject('activeNode')
function toloadPreForm() {
    if (!flowGraph || !activeNode) {
        return
    }
    const graph = flowGraph()
    const currNode = activeNode()
    if (graph && currNode) {
        const formId = currNode.data?.formId || ''
        nextTick(() => {
            if (formRef.value) {
                if (formId) {
                    formRef.value.querySelector('.ant-input-clear-icon').style.display = 'block'
                } else {
                    formRef.value.querySelector('.ant-input-clear-icon').style.display = 'none'
                }
            }
        })
        loadPreForm(graph.getJson(), currNode).then((formId: any) => {
            modelValue.value = formId
        }).catch((e: any) => {
            if (e) {
                error.value = e
            }
        })
    }
}

const formSelectObj = ref({
    visible: false,
    open: () => {
        formSelectObj.value.visible = true
    },
    handelSelect: (selected: any) => {
        modelValue.value = selected.id
        formMap.value[selected.id] = selected.title + '(V' + selected.vers + ')'
        formSelectObj.value.visible = false
        formMap.value = { ...formMap.value }
        emit('change', modelValue.value)
    }
})
const loadFormTitle = useDebounce(() => {
    if (modelValue.value && !formMap.value[modelValue.value]) {
        const mvid = modelValue.value
        axios.form({
            url: '/api/data/define/simple',
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            data: modelValue.value
        }).then((res: any) => {
            if (res.success && res.body) {
                formMap.value[mvid] = res.body.title + '(V' + res.body.vers + ')'
            }
        })
    }
}, 300)
watch(() => modelValue.value, (val, old) => {
    error.value = ''
    if (val) {
        loadFormTitle()
    } else {
        toloadPreForm()
    }
}, { immediate: true })
function clearModelValue() {
    modelValue.value = ''
    emit('change', '')
}

onMounted(() => {
    if (flowGraph) {
        flowGraph().onActiveNode((node: any) => {
            if (node) {
                error.value = ''
                modelValue.value = node.data?.formId || ''
                nextTick(() => {
                    if (formRef.value) {
                        if (node.data?.formId) {
                            formRef.value.querySelector('.ant-input-clear-icon').style.display = 'block'
                        } else {
                            formRef.value.querySelector('.ant-input-clear-icon').style.display = 'none'
                        }
                    }
                })
                toloadPreForm()
            }
        })
    }
    formRef.value.querySelector('.ant-input-clear-icon').addEventListener('click', clearModelValue)
})

</script>
<style lang="less" scoped>
.flow-form-ref {
    :deep(.ant-input) {
        caret-color: transparent;
    }

    .btns {
        display: flex;
        justify-content: space-between;

        .btn {
            cursor: pointer;
        }

        .btn:hover {
            color: #1890ff;
        }

        .btn:first-child {
            margin-right: 5px;
        }
    }

    .error {
        color: red;
        width: 100%;
    }
}
</style>