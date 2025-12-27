<template>
    <div class="flow-comment">
        <a-empty v-if="commentList.length === 0"></a-empty>
        <div class="content">
            <div :class="['content-item', item.userId == principal.id && 'isme']" v-for="(item, i) in commentList"
                :key="item.id">
                <div class="item-body">
                    <div class="user">
                        <a-avatar :src="avatarUrl(item)" class="avatar" shape="square">{{ !item.userAvatar ||
                            item.userName?.charAt(0) }}</a-avatar>
                        <span class="name" v-if="item.userId != principal.id">{{ item.userName }}</span>
                    </div>
                    <div class="message">
                        <div class="text">{{ item.optxt.content }}</div>
                        <div class="ref" :title="item.optxt.ref.info" v-if="item.optxt.ref?.info">{{ item.optxt.ref.info
                        }}</div>
                    </div>
                </div>
                <div class="item-info">
                    <div class="time">{{ item.handleTime }}</div>
                    <div class="opts">
                        <a-button class="btn-delete" type="link" danger size="small" v-if="item.userId == principal.id"
                            @click="del(item, i)">删除</a-button>
                        <a-button class="btn-reply" type="link" size="small" v-if="item.userId != principal.id"
                            @click="reply(item)">回复</a-button>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer" v-if="![5, 6].includes(props.status) && props.tid">
            <div class="calls">
                <a-tag class="call" v-for="(c, i) in commentValue.calls" :key="c.id" closable @close="delCall(i)">@{{
                    c.name
                    }}</a-tag>
            </div>
            <a-textarea class="message" v-model:value="commentValue.message" :rows="4" :maxlength="500" showCount
                placeholder="请输入消息..." @keyup.enter="send"></a-textarea>
            <a-tag class="ref" v-if="commentValue.ref?.info" closable @close="delRef">{{ commentValue.ref.info
                }}</a-tag>
            <div class="btns">
                <div class="left-btn">
                    <span class="icon">@</span>
                    <CloudUploadOutlined class="icon" />
                    <PictureOutlined class="icon" />
                    <PaperClipOutlined class="icon" />
                </div>
                <a-button class="btn-send" @click="send" :loading="commentValue.loading">发送</a-button>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useConfigStore } from '@/config'
import { message } from 'ant-design-vue'
import { axios, useDialog, useSession } from 'unione-base-vue'
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
    fid: {
        type: String,
        required: true
    },
    tid: {
        type: String,
    },
    status: {
        type: Number,
        default: 2
    }
})

const config = useConfigStore().config
const dialog = useDialog()
const session = useSession()
const principal = computed(() => session.getPrincipal())

const commentValue = ref<any>({
    loading: false,
    message: '',
    ref: {},
    calls: [],
    files: [],
    images: [],
    links: [],
})
const commentRequest = ref<any>({
    page: 1,
    pageSize: 1000,
})
const commentList = ref<any>([])
function loadComments() {
    axios.flow({
        url: '/api/engine/comment/load',
        method: 'post',
        data: {
            page: commentRequest.value.page,
            pageSize: commentRequest.value.pageSize,
            body: {
                flowInsId: props.fid,
                flowTaskId: props.tid,
            }
        }
    }).then((res: any) => {
        if (res.success) {
            commentList.value = res.body
            res.body.forEach((item: any) => {
                if (item.optxt) {
                    item.optxt = JSON.parse(item.optxt)
                }
            })
        }
    })
}

function avatarUrl(opinion: any) {
    const avatar = opinion.userAvatar
    return avatar && (config.axios.admin + '/api/common/store/preview/public/' + avatar) || '/avatar.png'
}

/**
 * 删除评论
 * @param item 评论项
 * @param index 评论项索引
 */
function del(item: any, index: any) {
    dialog.confirm({
        content: '确认删除吗？',
        onOk: () => {
            axios.flow({
                url: '/api/engine/comment/del',
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: item.id
            }).then((res: any) => {
                if (res.success) {
                    message.success('删除成功')
                    commentList.value.splice(index, 1)
                } else {
                    dialog.error(res.message || '删除失败')
                }
            })
        }
    })
}

function reply(item: any) {
    commentValue.value.ref = {
        id: item.id,
        info: item.userName + '：' + item.optxt.content
    }
    if (!commentValue.value.calls) {
        commentValue.value.calls = [];
    }
    const flag = commentValue.value.calls.find((call: any) => call.id === item.userId);
    if (!flag) {
        commentValue.value.calls.push({
            id: item.userId,
            name: item.userName
        })
    }
}
function delRef() {
    commentValue.value.ref = null;
}
function delCall(index: any) {
    commentValue.value.calls.splice(index, 1);
}

/**
 * 发送
 */
function send() {
    if (!commentValue.value.message) {
        message.warning('请输入发送消息')
        return
    }
    commentValue.value.loading = true

    const data: any = {
        content: commentValue.value.message,
        calls: commentValue.value.calls,
        files: commentValue.value.files,
        images: commentValue.value.images,
        links: commentValue.value.links,
        ref: commentValue.value.ref,
    }
    axios.flow({
        url: '/api/engine/comment/send',
        method: 'post',
        data: {
            flowInsId: props.fid,
            flowTaskId: props.tid,
            title: '沟通消息',
            types: 3,
            optxt: JSON.stringify(data),
        }
    }).then((result: any) => {
        if (result.success) {
            message.success('发送成功')
            commentValue.value.loading = false
            commentValue.value.message = ''
            commentValue.value.calls = []
            commentValue.value.files = []
            commentValue.value.images = []
            commentValue.value.links = []
            commentValue.value.ref = {}
            commentValue.value = { ...commentValue.value }
            result.body.optxt = JSON.parse(result.body.optxt)
            commentList.value.push(result.body)
        } else {
            dialog.error(result.message || '发送失败')
        }
    }).finally(() => {
        commentValue.value.loading = false
    })
}


onMounted(() => {
    loadComments()
})

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

                .item-info {
                    justify-content: end;
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