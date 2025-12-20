<template>
    <div class="flow-task">
        <div class="time">2025-12-20 21:00</div>
        <div class="info">
            <div class="top">
                <div class="title">
                    <UserOutlined />审核
                </div>
                <span :class="['status']">审核中</span>
            </div>
            <div class="condidate">
                <div class="item">
                    <a-badge count="签收" size="small" color="#999" :numberStyle="{ transform: 'scale(0.9)' }"
                        :offset="[3, 21]">
                        <a-avatar style="background-color: #87d068">
                            <template #icon>
                                <UserOutlined />
                            </template>
                        </a-avatar>
                    </a-badge>
                    <div class="label">张三</div>
                </div>
                <div class="item">
                    <a-avatar style="background-color: #87d068">
                        <template #icon>
                            <UserOutlined />
                        </template>
                    </a-avatar>
                    <div class="label">李四</div>
                </div>
            </div>
            <div class="footer">
                <div class="approve-model">或签</div>
                <RightOutlined class="icon" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import type transform from 'ant-design-vue/es/_util/cssinjs/transformers/legacyLogicalProperties';


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