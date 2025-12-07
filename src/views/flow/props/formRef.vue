<template>
    <div :class="['flow-form-ref']">
        <a-input :value="formTitle" :read-only="true" :status="error ? 'error' : ''">
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
import { ref, onMounted, computed, watch } from 'vue'

const modelValue = defineModel('value', {
    type: String
})
const emit = defineEmits(['change'])
const formMap = ref<any>({})
const formTitle = computed(() => {
    if (!modelValue.value) {
        return ''
    }
    return formMap.value[modelValue.value] || ''
})
watch(() => modelValue.value, (val) => {
    if (val) {
        loadFormTitle()
    }
}, { immediate: true })
// const error = ref('存在多个前置节点，请手动绑定表单')
const error = ref('')

const formSelectRef = ref()
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