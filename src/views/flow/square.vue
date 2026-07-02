<template>
    <div class="flow-square">
        <a-tabs v-model:activeKey="activeKey" tab-position="left">
            <a-tab-pane :tab="item.tab" v-for="item in tabList" :key="item.key">
                <unione-query @query="handleQuery" @reset="handleReset"></unione-query>
                <div class="flow-list">
                    <template v-for="item in flowList" :key="item.id">
                        <div class="flow-item" v-if="item.category == activeKey || activeKey == 'all'"
                            @click="handleClick(item)">
                            <div class="flow-item-icon">
                                <component :is="item.iconFont" v-if="!item.iconPic && item.iconFont" class="icon">
                                </component>
                                <a-image class="icon" :src="imageUrl(item)" :width="50" :height="50" :preview="false"
                                    v-else-if="item.iconPic"></a-image>
                                <span class="icon" v-if="!item.iconFont && !item.iconPic">{{ item.title.charAt(0)
                                    }}</span>
                            </div>
                            <div class="flow-item-title">{{ item.title }}
                                <StarOutlined :class="['flow-item-star', item.favorite && 'active']"
                                    @click.stop="handleFavorite(item)" />
                            </div>
                        </div>
                    </template>
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>
<script setup lang="ts">
import { useConfigStore } from '@/config';
import { axios } from 'unione-base-vue';
import { Convertor } from 'unione-form-vue';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({
    name: 'FlowSquare'
})

const router = useRouter()
const config = useConfigStore().config

const keywords = ref('')
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
            keywords: keywords.value,
            sorts: [{ name: 'ordered', asc: false }]
        }
    }).then((res: any) => {
        if (res.success) {
            flowList.value = res.body
        }
    })
}

function imageUrl(item: any) {
    return config.axios.admin + '/api/common/store/preview/' + item.iconPic
}

function handleQuery(e: any) {
    keywords.value = e.keywords
    loadFlowList()
}
function handleReset(e: any) {
    keywords.value = ''
    loadFlowList()
}

function handleClick(item: any) {
    router.push({
        path: '/bench/oa/flow/run',
        query: {
            fsn: item.sn,
            fmd: 'start',
        }
    })
}

function handleFavorite(item: any) {
    item.favorite = !item.favorite
    if (item.favorite) {
        // 收藏
        axios.admin({
            url: '/api/system/mineLike/save',
            method: 'post',
            data: {
                targetType: 'flow',
                targetId: item.id
            }
        }).then((result: any) => {
            if (result.success) {
                item.mineLikeId = result.body
            }
        })
    } else {
        // 取消收藏
        if (!item.mineLikeId) {
            return
        }
        axios.admin({
            url: '/api/system/mineLike/delete',
            method: 'post',
            data: [item.mineLikeId]
        })
    }
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

    .flow-list {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-gap: 20px;
        margin-top: 15px;

        .flow-item {
            display: flex;
            align-items: center;
            padding: 24px;
            border: 1px solid #E5E5E5;
            border-radius: 5px;
            cursor: pointer;
            box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);

            .flow-item-icon {
                width: 50px;
                height: 50px;
                border-radius: 5px;
                margin-right: 15px;
                overflow: hidden;
                background-color: #008CFF;
                display: flex;
                align-items: center;
                justify-content: center;

                .icon {
                    font-size: 40px;
                    color: #FFFFFF;
                }
            }

            .flow-item-title {
                width: calc(100% - 65px);
                font-size: 16px;
                font-weight: 500;
                color: #333333;
            }

            .flow-item-star {
                float: right;
                margin-top: -25px;
                margin-right: -15px;
                display: none;

                &.active {
                    display: block;
                    color: chocolate;
                    font-weight: bold;
                }
            }

            .flow-item-star:hover {
                color: chocolate;
            }
        }

        .flow-item:hover {
            border-color: #008CFF;
            box-shadow: 0px 4px 8px rgba(0, 140, 255, 0.3);

            .flow-item-star {
                display: block;
            }
        }
    }
}
</style>