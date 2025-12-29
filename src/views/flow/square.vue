<template>
    <div class="flow-square">
        <a-tabs v-model:activeKey="activeKey" tab-position="left">
            <a-tab-pane :tab="item.tab" v-for="item in tabList" :key="item.key">
                <unione-query></unione-query>
                <div class="flow-list">
                    <div class="flow-item" v-for="item in flowList" :key="item.id">
                        <div class="flow-item-title">{{ item.title }}</div>
                    </div>
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>
<script setup lang="ts">
import { axios } from 'unione-base-vue';
import { Convertor } from 'unione-form-vue';
import { computed, onMounted, ref } from 'vue';

defineOptions({
    name: 'FlowSquare'
})

const categoryList = ref<any>([])
const categoryConvert = new Convertor({ types: 'dict', dictName: 'FLOWLITECATEGORY' })
const activeKey = ref('all')
const tabList = computed<any>(() => {
    const list: any = [{
        key: 'all',
        tab: '全部流程'
    }]
    if (categoryList.value) {
        categoryList.value.forEach((item: any) => {
            list.push({
                key: item.dictKey,
                tab: item.dictValue
            })
        })
    }
    return list;
})
const flowList = ref<any>([])
function loadFlowList() {
    axios.flow({
        url: '/api/tmpl/list',
        method: 'post',
        data: {
            body: {},
            sorts: [{ name: 'ordered', asc: false }]
        }
    }).then((res: any) => {
        if (res.success) {
            flowList.value = res.body
        }
    })
}

onMounted(() => {
    categoryConvert.load().then((res: any) => {
        categoryList.value = res
    })
    loadFlowList()
})

</script>
<style scoped lang="less">
.flow-square {
    height: 100%;
    background-color: #FFFFFF;
    padding: 20px 20px 20px 0;

    :deep(.ant-tabs-nav) {
        width: 180px;

        .ant-tabs-tab {
            margin: 0;
            padding: 12px 24px;
        }

        .ant-tabs-tab-active {
            background-color: #E5F3FF;
        }
    }
}
</style>