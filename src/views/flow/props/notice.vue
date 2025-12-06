<template>
    <div class="flow-notice" v-if="modelValue">
        <a-select v-model:value="modelValue.type" :options="typeOptions"></a-select>
        <template v-if="modelValue.type == 'custom'">
            <div class="title">通知模版：</div>
            <a-select></a-select>
            <div class="title">模版参数：</div>
            <FlowParam v-model="modelValue.params"></FlowParam>
        </template>
    </div>
</template>
<script lang="ts" setup>
import { utils } from 'unione-base-vue'
import { onMounted, ref } from 'vue'
import FlowParam from './flowParam.vue'

defineOptions({
    name: 'FlowNotice',
})

const modelValue = defineModel('value', {
    type: Object
})
const emit = defineEmits(['change'])
const typeOptions = [
    {
        label: '默认',
        value: 'default',
    },
    {
        label: '关闭',
        value: 'off',
    },
    {
        label: '自定义',
        value: 'custom',
    },
]

function handelChange() {
    emit('change', modelValue.value)
}

onMounted(() => {
    const isEmpty = !modelValue.value
    modelValue.value = utils.obj.ext(modelValue.value, {
        type: 'default',
        tmplId: null,
        params: [],
    })
    if (isEmpty) {
        handelChange()
    }
})

</script>
<style lang="less" scoped>
.flow-notice {}
</style>
