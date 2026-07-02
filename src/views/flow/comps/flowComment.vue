<template>
    <div class="flow-comment">
        <a-empty v-if="commentList.length === 0"></a-empty>
        <div class="content" ref="contentRef">
            <div :class="['content-item', item.userId == principal.id && 'isme']" v-for="(item, i) in commentList"
                :key="item.id">
                <div class="item-body">
                    <div class="user">
                        <a-avatar :src="avatarUrl(item)" class="avatar" shape="square">{{ !item.userAvatar ||
                            item.userName?.charAt(0) }}</a-avatar>
                        <span class="name" v-if="item.userId != principal.id">{{ item.userName }}</span>
                    </div>
                    <div class="message">
                        <a-upload class="images" name="file" v-if="item.exdta.images?.length" disabled
                            :fileList="item.exdta.images" listType="picture-card">
                        </a-upload>
                        <a-upload class="files" name="file" v-if="item.exdta.files?.length" disabled
                            :fileList="item.exdta.files" listType="text">
                        </a-upload>
                        <div class="text">{{ item.optxt }}</div>
                        <div class="ref" :title="item.exdta.ref.info" v-if="item.exdta.ref?.info">{{ item.exdta.ref.info
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
            <div class="no-more" v-if="!commentRequest.hadMore">没有更多了</div>
        </div>
        <div class="footer" v-if="![5, 6].includes(props.status) && props.tid">
            <div class="calls">
                <a-tag class="call" v-for="(c, i) in commentValue.exdta.calls" :key="c.id" closable
                    @close="delCall(i)">@{{
                        c.name
                    }}</a-tag>
            </div>
            <a-textarea class="message" v-model:value="commentValue.message" :rows="4" :maxlength="500" showCount
                placeholder="请输入消息..." @keyup.enter="send"></a-textarea>

            <div class="extends">
                <a-tag class="ref" v-if="commentValue.exdta.ref?.info" closable @close="delRef">{{
                    commentValue.exdta.ref.info
                }}</a-tag>
                <div class="images">
                    <div class="img" v-for="(img, i) in commentValue.exdta.images" :key="img.id">
                        <a-image :width="35" :height="35" :preview="false" :src="imageUrl(img)" />
                        <DeleteOutlined class="del" @click="delAttarch('img', i)" />
                    </div>
                </div>
                <div class="files">
                    <div class="item" v-for="(item, i) in commentValue.exdta.files" :key="item.id">
                        {{ parseInt(i.toString()) + 1 }}、{{ item.title }}
                        <DeleteOutlined class="del" @click="delAttarch('file', i)" />
                    </div>
                </div>
            </div>
            <div class="btns">
                <div class="left-btn">
                    <span class="icon">@</span>
                    <a-upload class="icon" name="file" :showUploadList="false"
                        :action="config.axios.admin + '/api/common/store/upload/flow-comment/' + props.tid"
                        @change="(e: any) => handleUpload('file', e)">
                        <CloudUploadOutlined />
                    </a-upload>
                    <a-upload class="icon" accept="image/*" name="file" :showUploadList="false"
                        :action="config.axios.admin + '/api/common/store/upload/flow-comment/' + props.tid"
                        @change="(e: any) => handleUpload('pic', e)">
                        <PictureOutlined />
                    </a-upload>
                    <!-- <PaperClipOutlined class="icon" /> -->
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
import { computed, nextTick, onMounted, ref } from 'vue'

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

const contentRef = ref<any>(null)

const commentValue = ref<any>({
    loading: false,
    message: '',
    exdta: {
        ref: {},
        calls: [],
        files: [],
        images: [],
        links: [],
    }
})
const commentRequest = ref<any>({
    page: 0,
    pageSize: 10,
    hadMore: true
})
const commentList = ref<any>([])
function loadComments() {
    if (!commentRequest.value.hadMore) {
        return
    }
    commentRequest.value.page++
    const toBottom = commentRequest.value.page === 1
    axios.flow({
        url: '/api/engine/comment/load',
        method: 'post',
        data: {
            page: commentRequest.value.page,
            pageSize: commentRequest.value.pageSize,
            body: {
                flowInsId: props.fid,
                //flowTaskId: props.tid,
            },
            sorts: [{ name: 'handleTime', order: 'desc' }]
        }
    }).then((res: any) => {
        if (res.success) {
            commentList.value = [...commentList.value, ...res.body]
            res.body.forEach((item: any) => {
                processExdta(item)
            })
            // 检查是否还有更多数据
            commentRequest.value.hadMore = res.body.length >= commentRequest.value.pageSize
            // 滚动到最底部
            if (contentRef.value) {
                nextTick(() => {
                    if (toBottom) {
                        //滚动到底部
                        contentRef.value.scrollTop = contentRef.value.scrollHeight
                    } else {
                        //滚动到顶部
                        contentRef.value.scrollTop = 0
                    }
                })
            }
        }
    })
}

function processExdta(item: any) {
    if (item.exdta) {
        item.exdta = JSON.parse(item.exdta)
        if (item.exdta.images?.length) {
            item.exdta.images.forEach((img: any) => {
                img.url = config.axios.admin + '/api/common/store/preview/' + img.id
                img.uid = img.id
            })
        }
        if (item.exdta.files?.length) {
            item.exdta.files.forEach((f: any) => {
                f.url = config.axios.admin + '/api/common/store/download/' + f.id
                f.uid = f.id
                f.name = f.title
            })
        }
    }
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
    commentValue.value.exdta.ref = {
        id: item.id,
        info: item.userName + '：' + item.optxt.content
    }
    if (!commentValue.value.exdta.calls) {
        commentValue.value.exdta.calls = [];
    }
    const flag = commentValue.value.exdta.calls.find((call: any) => call.id === item.userId);
    if (!flag) {
        commentValue.value.exdta.calls.push({
            id: item.userId,
            name: item.userName
        })
    }
}
function delRef() {
    commentValue.value.exdta.ref = null;
}
function delCall(index: any) {
    commentValue.value.exdta.calls.splice(index, 1);
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

    axios.flow({
        url: '/api/engine/comment/send',
        method: 'post',
        data: {
            flowInsId: props.fid,
            flowTaskId: props.tid,
            title: '沟通消息',
            types: 3,
            optxt: commentValue.value.message,
            exdta: JSON.stringify(commentValue.value.exdta)
        }
    }).then((result: any) => {
        if (result.success) {
            // 滚动到最底部
            if (contentRef.value) {
                nextTick(() => {
                    contentRef.value.scrollTop = contentRef.value.scrollHeight
                })
            }
            message.success('发送成功')
            commentValue.value.loading = false
            commentValue.value.message = ''

            commentValue.value.exdta.calls = []
            commentValue.value.exdta.files = []
            commentValue.value.exdta.images = []
            commentValue.value.exdta.links = []
            commentValue.value.exdta.ref = {}

            processExdta(result.body)
            commentList.value.splice(0, 0, result.body)
        } else {
            dialog.error(result.message || '发送失败')
        }
    }).finally(() => {
        commentValue.value.loading = false
    })
}

function handleUpload(type: string, e: any) {
    console.log('file upload ' + type, e)
    if (e.file?.response?.success) {
        // 上传成功
        const attach = e.file.response.body
        const file: any = {
            id: attach.id,
            title: attach.title,
        }
        if (type === 'pic') {
            commentValue.value.exdta.images.push(file)
        } else if (type === 'file') {
            commentValue.value.exdta.files.push(file)
        }
    }
}

function delAttarch(type: string, index: any) {
    if (type === 'img') {
        const item: any = commentValue.value.exdta.images[index]
        commentValue.value.exdta.images.splice(index, 1)
        if (item.id) {
            axios.admin({
                url: '/api/common/store/delete/' + item.id,
                method: 'post',
            })
        }
    } else if (type === 'file') {
        const item: any = commentValue.value.exdta.files[index]
        commentValue.value.exdta.files.splice(index, 1)
        if (item.id) {
            axios.admin({
                url: '/api/common/store/delete/' + item.id,
                method: 'post',
            })
        }
    }
}

function imageUrl(item: any) {
    return config.axios.admin + '/api/common/store/preview/' + item.id
}

onMounted(() => {
    loadComments()

    // 监听滚动事件
    contentRef.value.addEventListener('scroll', () => {
        // 检查滚动条距离顶部是否小于等于10px
        if (contentRef.value.scrollTop <= 10) {
            loadComments()
        }
    })
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
        height: calc(100% - 210px);
        overflow-y: auto;
        display: flex;
        flex-direction: column-reverse;
        justify-content: start;


        .no-more {
            text-align: center;
            padding-bottom: 10px;
            color: #999;
        }

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

        .extends {
            position: absolute;
            bottom: 62px;
            left: 10px;

            .ref {}

            .images {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                align-items: center;

                .img {
                    margin-right: 5px;

                    .del {
                        cursor: pointer;
                        display: none;
                        position: absolute;
                        top: -2px;
                        right: -2px;
                    }

                    .del:hover {
                        color: red;
                    }
                }

                .img:hover {
                    .del {
                        display: block;
                    }
                }
            }

            .files {
                .item {
                    margin-bottom: 2px;

                    .del {
                        cursor: pointer;
                        display: none;
                        position: absolute;
                        top: -2px;
                        right: -2px;
                    }

                    .del:hover {
                        color: red;
                    }
                }

                .item:hover {
                    .del {
                        display: block;
                    }
                }
            }
        }

        .btns {
            margin-top: 25px;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding-left: 10px;
            align-items: center;

            .left-btn {
                display: flex;
                flex-direction: row;
                align-items: center;

                .icon {
                    font-size: 18px;
                    margin-right: 10px;
                    cursor: pointer;
                }
            }

            .btn-send {
                height: 28px;
                padding: 0 20px;
            }
        }
    }
}
</style>