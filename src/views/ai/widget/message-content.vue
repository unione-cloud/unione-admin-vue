<template>
    <div class="message-content">
        <template v-if="roleName == 'user'">
            <div class="content-body">{{ content }}</div>
        </template>
        <template v-else>
            <div v-if="thiking && roleName == 'assistant' && (!thinkList || !thinkList.length)">思考think
                <LoadingOutlined />
            </div>
            <div class="think-item" v-for="(item, i) in thinkList" :key="item">
                <div class="think-title" @click="thinkItem[i] = !thinkItem[i]">
                    思考think<span v-if="thiking && roleName == 'assistant'" style="margin-left: 4px;">{{ thikTotal
                        }}秒</span>
                    <component :is="(thinkItem[i] || thiking) ? 'DownOutlined' : 'RightOutlined'" />
                </div>
                <div class="think-content" v-if="thinkItem[i] || thiking">{{ item }}</div>
            </div>
            <div class="content-body" v-if="contentBody">{{ contentBody }}</div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';


const props = defineProps({
    thiking: {
        type: Boolean,
        default: false
    },
    thikTotal: {
        type: Number,
        default: 0
    },
    roleName: {
        type: String,
        default: 'user'
    },
    content: {
        type: String,
        default: ''
    }
})

const thinkItem = ref<any>({})
const thinkList = computed<any>(() => {
    if (!props.content || (!props.content.includes('<think>') && !props.content.includes('</think>'))) {
        return []
    }
    const tmp = props.content.split('</think>')
    return tmp.filter(item => item.trim().startsWith('<think>')).map(item => item.trim().substring(7))
})
const contentBody = computed(() => {
    if (!props.content || !props.content.includes('</think>')) {
        return ''
    }
    const tmp = props.content.split('</think>')
    if (tmp[tmp.length - 1].trim().startsWith('<think>')) {
        return ''
    }
    return tmp[tmp.length - 1]
})

</script>

<style lang="less" scoped>
.message-content {
    .think-item {
        .think-title {
            cursor: pointer;
            color: #727272;
        }

        .think-content {
            margin-left: 13px;
            color: #727272;
            border-left: 1px dashed #b9b9b9;
            border-bottom: 1px dashed #b9b9b9;
            padding-left: 4px;
            padding-bottom: 4px;
        }
    }
}
</style>