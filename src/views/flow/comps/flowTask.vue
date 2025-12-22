<template>
    <div class="flow-task">
        <div class="time">{{ task.created }}</div>
        <div class="info">
            <div class="top" v-if="task.types == 'task'">
                <div class="title">
                    <UserOutlined />{{ task.title }}
                </div>
                <span :class="['status']">{{ task.status == 1 ? '审核中' : '已完成' }}</span>
            </div>
            <div class="top" v-if="task.types == 'start'">
                <div class="title">
                    <PlayCircleOutlined />{{ task.title }}
                </div>
                <span :class="['status']">已提交</span>
            </div>
            <div class="top" v-if="task.types == 'end'">
                <div class="title">
                    <MinusCircleOutlined />{{ task.title }}
                </div>
                <span :class="['status']">已完成</span>
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

            <div class="footer" v-if="task.types == 'task'">
                <div class="approve-model">或签</div>
                <RightOutlined class="icon" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useConfigStore } from '@/config';


const config = useConfigStore().config
const props = defineProps({
    task: {
        type: Object,
        required: true
    },
    condidates: {
        type: Array<any>,
        required: true
    }
})

function avatarUrl(condidate: any) {
    return condidate.avatar && (config.axios.admin + '/api/common/store/preview/public/' + condidate.avatar) || '/avatar.png'
}

</script>
<style lang="less" scoped>
.flow-task {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

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
</style>