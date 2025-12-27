<template>
    <div class="flow-task">
        <div class="time">{{ task.created }}
            <div class="count" v-if="condidates?.length > 5">共{{ condidates.length }}人</div>
        </div>
        <div class="info">
            <div class="top" v-if="task.types == 'task'">
                <div class="title">
                    <UserOutlined />{{ task.title }}
                </div>
                <span :class="['status']"><a-tag :color="task.handleResult == 1 ? 'success' : 'error'"
                        v-if="task.status == 3">{{
                            task.handleResult == 1 ? '同意' : '拒绝' }}</a-tag>
                    <a-tag v-else>处理中</a-tag>
                </span>
            </div>
            <div class="top" v-if="task.types == 'start'">
                <div class="title">
                    <PlayCircleOutlined />{{ task.title }}
                </div>
                <span :class="['status']"><a-tag :color="task.status != 3 ? 'error' : 'success'">{{ task.status != 3 ?
                    '已驳回' : '已提交'
                        }}</a-tag></span>
            </div>
            <div class="top" v-if="task.types == 'end'">
                <div class="title">
                    <MinusCircleOutlined />{{ task.title }}
                </div>
                <span :class="['status']"><a-tag color="success">已完成</a-tag></span>
            </div>

            <div class="condidate" v-if="(task.types == 'task' || task.types == 'start') && condidates?.length">
                <div class="item" v-for="c in condidates" :key="c.id">
                    <a-badge count="" size="small" color="#999" :numberStyle="{ transform: 'scale(0.9)' }"
                        :offset="[3, 21]">
                        <a-avatar style="background-color: #87d068" :src="avatarUrl(c)">
                            <template #icon>
                                <UserOutlined />
                            </template>
                        </a-avatar>
                    </a-badge>
                    <div class="label">{{ c.realName }}</div>
                </div>
            </div>

            <div class="footer" v-if="task.types == 'task'" @click="approveModal.open">
                <div class="approve-model">{{ approveModel }}</div>
                <RightOutlined class="icon" />
            </div>
        </div>

        <a-modal :title="task.title + '(' + approveModel + ')'" v-model:open="approveModal.visible"
            @ok="approveModal.visible = false">
            <a-list class="task-opinion-list" item-layout="horizontal" :data-source="approveModal.opinions">
                <template #renderItem="{ item }">
                    <a-list-item>
                        <template #actions><a-tag :color="item.types == 1 ? 'success' : 'error'">{{ item.types == 1 ?
                            '同意' : '拒绝' }}</a-tag></template>
                        <a-list-item-meta :description="item.optxt">
                            <template #title>
                                <div>{{ item.userName }}</div>
                                <div>{{ item.handleTime }}</div>
                            </template>
                            <template #avatar>
                                <a-avatar :src="avatarUrl(item)" />
                            </template>
                        </a-list-item-meta>
                    </a-list-item>
                </template>
            </a-list>
        </a-modal>

    </div>
</template>
<script setup lang="ts">
import { useConfigStore } from '@/config';
import { axios } from 'unione-base-vue';
import { computed, ref } from 'vue';


const config = useConfigStore().config
const props = defineProps({
    task: {
        type: Object,
        required: true
    },
    node: {
        type: Object,
        required: true
    },
    condidates: {
        type: Array<any>,
        required: true
    }
})


const approveModel = computed(() => {
    const model = props.node?.data?.approve?.mode || 'or'
    const map: any = { or: '或签', con: '会签', queue: '依次审批' }
    return map[model] || '或签'
})

const approveModal = ref({
    visible: false,
    opinions: [],
    open: () => {
        approveModal.value.visible = true
        if (!approveModal.value.opinions?.length) {
            axios.flow({
                url: '/api/engine/opinion/list',
                method: 'POST',
                data: {
                    page: 1,
                    pageSize: 100,
                    body: {
                        flowTaskId: props.task.id
                    }
                }
            }).then((res: any) => {
                if (res.body[0]) {
                    approveModal.value.opinions = res.body[0].opinions
                }
            })
        }
    }
})


function avatarUrl(condidate: any) {
    const avatar = condidate.userAvatar || condidate.avatar
    return avatar && (config.axios.admin + '/api/common/store/preview/public/' + avatar) || '/avatar.png'
}

</script>
<style lang="less" scoped>
.flow-task {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .time {
        .count {
            font-size: 10px;
            color: #999;
            position: absolute;
            top: 0;
            right: 0;
        }
    }

    .info {
        background-color: #f5f5f5;
        padding: 5px 10px;

        .top {
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            .title {
                .anticon {
                    margin-right: 5px;
                }
            }
        }

        .condidate {
            display: flex;
            flex-direction: row;
            margin: 5px 0;

            .item {
                margin: 5px;

                .label {
                    font-size: 10px;
                    text-align: center;
                }
            }
        }

        .footer {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            border-top: 2px solid rgba(5, 5, 5, 0.06);
            padding: 5px;
            cursor: pointer;

            .approve-model {
                background-color: #E2E2E2;
                border-radius: 5px;
                padding: 0px 5px;
            }
        }
    }
}

.task-opinion-list {
    :deep(.ant-list-item) {
        align-items: start;
    }

    :deep(.ant-list-item-meta-description) {
        background-color: #f5f5f5;
        padding: 5px 10px;
        border-radius: 2px;
    }
}
</style>