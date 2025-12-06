<template>
    <div class="flow-copy-to" v-if="modelValue">
        <unione-radio-box :options="[{ label: '关闭', value: false }, { label: '开启', value: true }]"
            v-model:value="modelValue.enable" layout="vertical"></unione-radio-box>
        <unione-check-switch v-model:value="modelValue" v-if="modelValue.enable" layout="vertical"
            :options="[{ label: '自定义抄送', value: 'custom' }, { label: '抄送发起人', value: 'starter' }]"
            @change="handelChange"></unione-check-switch>

        <template v-if="modelValue.enable">
            <div class="title">指定抄送对象：</div>
            <Candidate v-model:value="modelValue.tagUsers" @change="handelChange"></Candidate>
            <div class="title">流程变量设置：</div>
            <Candidate v-model:value="modelValue.varUsers" @change="handelChange" types="flowVar"></Candidate>
        </template>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Candidate from './candidate.vue'
import { utils } from 'unione-base-vue'

defineOptions({
    name: 'FlowCopyTo',
})

const modelValue = defineModel<any>('value')
const emit = defineEmits(['change'])
watch(modelValue, (newVal, oldVal) => {
    if (!newVal) {
        modelValue.value = utils.obj.set(modelValue.value, {
            enable: false,
            custom: false,
            starter: false,
            tagUsers: {
                users: [],
                groups: [],
                roles: [],
                posts: [],
                organs: [],
                isAssembly: false
            },
            varUsers: {
                users: [],
                groups: [],
                roles: [],
                posts: [],
                organs: [],
                isAssembly: false
            },
        })
        handelChange()
    }
}, { immediate: true })

function handelChange() {
    emit('change', modelValue.value)
}

onMounted(() => {

})

</script>
<style lang="less" scoped>
.flow-copy-to {
    display: flex;
    flex-direction: column;

    .title {
        margin-top: 10px;
    }
}
</style>