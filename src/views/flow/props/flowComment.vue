<template>
    <div class="flow-comment">
        <a-empty v-if="commentList.length === 0"></a-empty>
        <div class="content">
            <div :class="['content-item', item.user.isMe && 'isme']" v-for="item in commentList" :key="item.id">
                <div class="item-body">
                    <div class="user">
                        <a-avatar :src="item.user.avatar" class="avatar" shape="square">{{ !item.user.avatar ||
                            item.user.name?.charAt(0) }}</a-avatar>
                        <span class="name" v-if="!item.user.isMe">{{ item.user.name }}</span>
                    </div>
                    <div class="message">
                        <div class="text">{{ item.content }}</div>
                        <div class="ref" :title="item.ref.info" v-if="item.ref?.info">{{ item.ref.info }}</div>
                    </div>
                </div>
                <div class="item-info">
                    <div class="time">{{ item.handleTime }}</div>
                    <div class="opts">
                        <a-button class="btn-delete" type="link" danger size="small" v-if="item.user.isMe">删除</a-button>
                        <a-button class="btn-reply" type="link" size="small" v-if="!item.user.isMe"
                            @click="reply(item)">回复</a-button>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer">
            <div class="calls">
                <a-tag class="call" v-for="c, i in commentValue.calls" :key="c.id" closable @close="delCall(i)">@{{
                    c.name
                    }}</a-tag>
            </div>
            <a-textarea class="message" v-model:value="commentValue.message" :rows="4" :maxlength="500"
                showCount></a-textarea>
            <a-tag class="ref" v-if="commentValue.ref?.info" closable @close="delRef">{{ commentValue.ref.info
                }}</a-tag>
            <div class="btns">
                <div class="left-btn">
                    <span class="icon">@</span>
                    <CloudUploadOutlined class="icon" />
                    <PictureOutlined class="icon" />
                    <PaperClipOutlined class="icon" />
                </div>
                <a-button class="btn-send">发送</a-button>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
    fid: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 2
    }
})

const commentValue = ref<any>({
    message: '',
    calls: [],
    files: [],
    images: [],
    links: [],
})
const commentList = ref<any>([{
    id: '1',
    user: {
        id: '123',
        name: '张三',
        avatar: '/avatar.png',
        isMe: false
    },
    content: '这是一条评论',
    handleTime: '2025-08-15 10:00:00',
    files: [],
    images: [],
    links: [],
}, {
    id: '2',
    user: {
        id: '123',
        name: '李四',
        avatar: 'https://unione.oss-cn-beijing.aliyuncs.com/avatar/20230815/1692083329000.png',
        isMe: true
    },
    content: '这是一条回复',
    handleTime: '2025-08-15 10:05:00',
    calls: [],
    files: [],
    images: [],
    links: [],
    ref: {
        id: '1',
        info: '张三：引用内容'
    },
}])

function reply(item: any) {
    commentValue.value.ref = {
        id: item.id,
        info: item.user.name + '：' + item.content
    }
    if (!commentValue.value.calls) {
        commentValue.value.calls = [];
    }
    const flag = commentValue.value.calls.find((call: any) => call.id === item.user.id);
    if (!flag) {
        commentValue.value.calls.push({
            id: item.user.id,
            name: item.user.name
        })
    }
}
function delRef() {
    commentValue.value.ref = null;
}
function delCall(index: number) {
    commentValue.value.calls.splice(index, 1);
}

</script>
<style lang="less" scoped>
.flow-comment {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .content {
        padding: 10px;

        .content-item {
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;

            &.isme {

                .item-body {
                    justify-content: end;
                    flex-direction: row-reverse;
                    float: right;

                    .message {
                        .text {
                            margin-right: 10px;
                            background-color: #95EC69;
                        }
                    }
                }

            }

            .item-body {
                display: flex;
                flex-direction: row;
                align-items: start;

                .user {
                    display: flex;
                    flex-direction: column;

                    .name {
                        height: 18px;
                        transform: scale(0.85);
                        background: rgb(153, 153, 153);
                        color: #FFF;
                        font-size: 10px;
                        text-align: center;
                        border-radius: 8px;
                    }
                }

                .message {
                    max-width: 80%;

                    .text {
                        padding: 5px 10px;
                        border-radius: 5px;
                        background-color: #F5F5F5;
                        height: auto;
                    }

                    .ref {
                        margin-top: 2px;
                        max-height: 50px;
                        padding: 2px 5px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        word-break: break-all;
                        -webkit-box-orient: vertical;
                        background-color: #E0E0E0;
                        border-radius: 3px;
                    }
                }
            }

            .item-info {
                margin-top: 5px;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                width: 100%;

                .opts {
                    margin-right: -5px;
                }
            }
        }
    }

    .footer {
        height: 210px;
        border-top: 1px solid #E2E2E2;
        display: flex;
        flex-direction: column;

        .calls {
            position: absolute;
            margin-top: -25px;
        }

        .message {

            :deep(.ant-input) {
                border: none;
                box-shadow: none;
                resize: none;
            }

            :deep(.ant-input:hover) {
                border-inline-end-width: 0;
                box-shadow: none;
            }
        }

        .ref {
            position: absolute;
            bottom: 62px;
            left: 10px;
        }

        .btns {
            margin-top: 25px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding-left: 10px;
            align-items: center;

            .icon {
                font-size: 18px;
                margin-right: 10px;
                cursor: pointer;
            }

            .btn-send {
                height: 28px;
                padding: 0 20px;
            }
        }
    }
}
</style>