<template>
  <div class="unione-page ai-chat">
    <a-card class="chat-sessions">
      <template #title>
        <span>会话列表</span>
      </template>
      <template #extra>
        <a-button size="small" @click="loadSessionList">刷新</a-button>
      </template>
      <div v-for="(item, i) in sessions.data" :key="item.id"
        :class="['session-item', session?.id === item.id ? 'active' : '']" @click="handleSessionClick(item)">
        {{ i + 1 }}、 <component :is="item.icon || 'BarsOutlined'"></component> {{ item.title }}
      </div>
    </a-card>
    <a-card class="chat-pannel" :bodyStyle="{ padding: '5px' }">
      <template #title>
        <div class="d-flex justify-between align-center">
          <span>会话详情</span>
        </div>
      </template>
      <template #extra>
        <a-button class="btn" size="small">设置</a-button>
        <a-button class="btn" size="small" @click="favoriteSession">收藏</a-button>
        <a-button class="btn" danger size="small" @click="deleteSession">删除</a-button>
      </template>

      <div class="message-list">
        <template v-for="item in session.messages" :key="item.id">
          <div class="message-timeline" v-if="session.timeline[item.id]">{{ item.created }}</div>
          <div :class="['message-item', item.roleName === 'user' ? 'user' : 'assistant']">
            <div class="message-header">
              <a-avatar :size="30">
                <template #icon>
                  <UserOutlined v-if="item.roleName == 'user'" />
                  <RedditOutlined v-else />
                </template>
              </a-avatar>
            </div>
            <div class="message-content">{{ item.content }}</div>
          </div>
        </template>
        <a-empty v-if="!session.messages || !session.messages.length"
          :description="session.id ? '暂无消息' : '请选择或创建新会话'" />
      </div>

      <div class="message-send-box">
        <div class="message-models">
          <a-checkable-tag v-for="item in models" :key="item.id" class="model" :value="item.id"
            :checked="session.model === item.id" @change="session.model = item.id">
            <component :is="item.icon || 'RedditOutlined'"></component> {{ item.title }}
          </a-checkable-tag>
        </div>
        <a-textarea v-model:value="message" placeholder="请输入消息" class="message-input"
          @keyup.ctrl.enter="sendMessage"></a-textarea>
        <div class="message-footer">
          <PaperClipOutlined class="item icon" />
          <PictureOutlined class="item icon" />
          <a-checkable-tag class="item model" v-model:checked="session.stream">
            <RedditOutlined />深度思考
          </a-checkable-tag>
          <a-button class="btn right" size="middle" @click="sendMessage">发送</a-button>
          <span class="tips right">Ctrl+Enter发送</span>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { axios, useDialog } from 'unione-base-vue'
import { onMounted, ref } from 'vue'

defineOptions({
  name: 'UnioneAiChat'
})

const dialog = useDialog()

const models = ref<Array<any>>([])
const message = ref('')
const session = ref<any>({
  stream: true,
  model: '',
  messages: [],
  timeline: {}
})
const sessions = ref<any>({
  page: 1,
  pageSize: 50,
  total: 0,
  nomore: false,
  data: []
})

/**
 * 加载会话列表
 */
function loadSessionList() {
  axios
    .admin({
      url: '/api/ai/session/list',
      method: 'post',
      data: {
        page: sessions.value.page,
        pageSize: sessions.value.pageSize,
        body: {}
      }
    })
    .then((res: any) => {
      sessions.value.data = res.body
      sessions.value.total = res.total
      if (res.data.length < sessions.value.pageSize) {
        sessions.value.nomore = true
      }
    })
}

/**
 * 删除会话
 */
function deleteSession() {
  if (!session.value) {
    return
  }
  dialog.confirm({
    content: '确定要删除会话吗？',
    onOk: () => {
      axios
        .admin({
          url: '/api/ai/session/delete',
          method: 'post',
          data: [session.value.id]
        })
        .then((res: any) => {
          if (res.success) {
            loadSessionList()
          }
        })
    }
  })
}

/**
 * 处理会话点击事件
 * @param item
 */
function handleSessionClick(item: any) {
  session.value = item
  loadMessages()
}

/**
 * 收藏会话
 */
function favoriteSession() {
  if (!session.value) {
    return
  }
  dialog.confirm({
    content: session.value.favorite == 1 ? '确定要取消收藏会话吗？' : '确定要收藏会话吗？',
    onOk: () => {
      axios
        .admin({
          url: '/api/ai/session/favorite',
          method: 'post',
          data: {
            id: session.value.id,
            favorite: session.value.favorite == 1 ? 0 : 1
          }
        })
        .then((res: any) => {
          if (res.success) {
            loadSessionList()
          }
        })
    }
  })
}

/**
 * 加载会话消息
 */
function loadMessages() {
  if (!session.value) {
    return
  }
  if (!session.value.messages) {
    session.value.messages = []
  }
  axios
    .admin({
      url: '/api/ai/message/list',
      method: 'post',
      data: {
        page: session.value.page || 1,
        pageSize: session.value.pageSize || 10,
        body: { sessionId: session.value.id }
      }
    })
    .then((res: any) => {
      if (res.success) {
        session.value.messages = [...(res.body || []).reverse(), ...session.value.messages]
        if (!session.value.model) {
          if (res.body[0]?.modelName) {
            session.value.model = res.body[0].modelId
          } else {
            session.value.model = models.value[0]?.id
          }
        }
        timelineProcess(res.body)
      }
    })
}

/**
 * 是否显示时间
 * @param list
 * @returns
 */
function timelineProcess(list: any) {
  if (!list || !list.length) {
    return
  }
  if (!session.value.timeline) {
    session.value.timeline = {}
  }
  list.forEach((item: any) => {
    if (!item.created) {
      return
    }
    if (!session.value.timelatest) {
      session.value.timelatest = item.created
      session.value.timeline[item.id] = item.created
    } else if (dayjs(item.created).diff(dayjs(session.value.timelatest), 'minutes') >= 5) {
      session.value.timelatest = item.created
      session.value.timeline[item.id] = item.created
    }
  })
}

function sendMessage() {
  if (!message.value && !session.value) {
    return
  }
  if (!session.value.model) {
    dialog.error('请选择模型')
    return
  }

  // 显示消息
  session.value.messages.push({
    id: session.value.id + '-' + Date.now(),
    modelId: session.value.model,
    content: message.value,
    roleName: 'user'
  })

  axios
    .admin({
      url: '/api/ai/message/send',
      method: 'post',
      data: {
        sessionId: session.value.id,
        modelId: session.value.model,
        category: 'text',
        content: message.value
      }
    })
    .then((res: any) => {
      console.log('发送结果', res)
      if (res.success) {
        message.value = ''
        // 显示消息
        session.value.messages.push({
          id: res.id,
          modelId: session.value.model,
          content: res.body.content,
          roleName: 'assistant'
        })
      }
    })
}

function loadModelList() {
  axios
    .admin({
      url: '/api/ai/model/mine',
      method: 'post',
      data: {
        page: 1,
        pageSize: 100,
        body: {}
      }
    })
    .then((res: any) => {
      models.value = res.body || []
    })
}

onMounted(() => {
  loadSessionList()
  loadModelList()
})
</script>

<style scoped lang="less">
.ai-chat {
  height: 100%;
  display: flex;
  flex-direction: row;

  .chat-sessions {
    flex: 0 0 240px;
    height: 100%;
    border-top-right-radius: 0;

    ::v-deep(.ant-card-body) {
      padding: 5px 10px 15px 10px;
    }

    .session-item {
      padding: 10px 5px;
      cursor: pointer;
      border-bottom: 1px solid #e5e5e5;

      &.active {
        background-color: #f5f5f5;
      }
    }

    .session-item:hover {
      background-color: #f5f5f5;
    }
  }

  .chat-pannel {
    height: 100%;
    flex: 1 1 auto;
    border-top-left-radius: 0;

    .right {
      float: right;
    }

    .btn {
      margin-right: 5px;
    }

    ::v-deep(.ant-card-body) {
      height: calc(100% - 250px);
    }

    .message-list {
      height: 100%;
      overflow-y: auto;

      .message-timeline {
        text-align: center;
        color: #b9b9b9;
      }

      .message-item {
        padding: 10px;
        display: flex;
        flex-direction: row;
        align-items: start;

        .message-header {
          display: flex;
          align-items: center;

          .anticon {
            font-size: 20px;
          }
        }

        .message-content {
          padding: 5px 10px;
          border-radius: 4px;
          background-color: #95ec69;
          max-width: 80%;
        }

        &.assistant {
          .message-content {
            margin-left: 5px;
          }
        }

        &.user {
          flex-direction: row-reverse;

          .message-content {
            margin-right: 5px;
          }
        }
      }
    }

    .message-send-box {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 10px;
      border-top: 1px solid #e5e5e5;

      .message-models {
        padding: 5px 0;
        margin-top: -45px;
        position: absolute;

        .model {
          font-size: 15px;
          border: 1px solid #b9b9b9;
          border-radius: 4px;
          padding: 2px 5px;

          .anticon {
            margin-right: 4px;
          }

          &.ant-tag-checkable-checked {
            background-color: #e6f4ff;
            color: #0958d9;
            border: 1px solid #91caff;
          }
        }
      }

      .message-input {
        width: 100%;
        height: 100px;
        border: none;
        resize: none;
      }

      .message-footer {
        height: 30px;
        line-height: 30px;
        margin-bottom: 15px;

        .item {
          margin-right: 10px;
          cursor: pointer;

          &.icon {
            font-size: 20px;
          }

          &.model {
            font-size: 15px;
            border: 1px solid #b9b9b9;
            border-radius: 4px;
            padding: 2px 5px;

            .anticon {
              margin-right: 4px;
            }

            &.ant-tag-checkable-checked {
              background-color: #e6f4ff;
              color: #0958d9;
              border: 1px solid #91caff;
            }
          }
        }

        .tips {
          margin-right: 10px;
          color: #b9b9b9;
        }
      }
    }
  }
}
</style>
