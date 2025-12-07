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
import { ref, onMounted, computed } from 'vue'

const modelValue = defineModel('value', {
    type: String
})
const formMap = ref<any>({})
const formTitle = computed(() => {
    if (!modelValue.value) {
        return ''
    }
    return formMap.value[modelValue.value] || ''
})
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
    }
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