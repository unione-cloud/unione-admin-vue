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
        {{ i + 1 }}、 <component :is="item.icon || 'BarsOutlined'"></component>
        <StarOutlined v-if="item.favorite != 1" />
        <StarFilled v-else style="color:#f1bf09;" /> {{ item.title }}
      </div>
    </a-card>
    <a-card class="chat-pannel" :bodyStyle="{ padding: '5px' }">
      <template #title>
        <div class="d-flex justify-between align-center">
          <span>会话窗口</span>
          <template v-if="session.id">
            <span v-if="!isEditingTitle" class="chat-title" @dblclick="startEditingTitle">/{{ session.title }}</span>
            <a-input v-else v-model:value="editingTitle" ref="titleInputRef" size="small" :style="{ width: '150px' }"
              @blur="handleTitleBlur" @keyup.enter="handleTitleBlur" @keyup.esc="cancelEditTitle" />
          </template>
        </div>
      </template>
      <template #extra>
        <a-button class="btn" size="small" @click="drawerSession.tosetting" :disabled="!session.id">设置</a-button>
        <a-button class="btn" size="small" @click="favoriteSession" :disabled="!session.id">{{ session.favorite != 1 ?
          '收藏' : '取消收藏'
        }}</a-button>
        <a-button class="btn" danger size="small" @click="deleteSession" :disabled="!session.id">删除</a-button>
      </template>

      <div class="message-list" ref="messageListRef">
        <template v-for="item in session.messages" :key="item.id">
          <div class="message-timeline" v-if="session.timeline && session.timeline[item.id]">{{ item.created }}</div>
          <div :class="['message-item', item.roleName === 'user' ? 'user' : 'assistant']">
            <div class="message-header">
              <a-avatar :size="30">
                <template #icon>
                  <UserOutlined v-if="item.roleName == 'user'" />
                  <RedditOutlined v-else />
                </template>
              </a-avatar>
            </div>
            <MessageContent class="message-content" :thiking="item.thiking" :thikTotal="item.thikTotal"
              :roleName="item.roleName" :content="item.content"></MessageContent>
          </div>
        </template>

        <div :class="['message-item', 'assistant']" v-if="message.think.thiking && !session.stream">
          <div class="message-header">
            <a-avatar :size="30">
              <template #icon>
                <RedditOutlined />
              </template>
            </a-avatar>
          </div>
          <div class="message-content">思考中{{ message.think.thikTotal }}秒</div>
        </div>

        <!-- 空消息提示 -->
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
        <a-textarea v-model:value="message.content" placeholder="请输入消息" class="message-input"
          :onKeyup="sendKeyHandler"></a-textarea>
        <div class="message-footer">
          <PaperClipOutlined class="item icon" />
          <PictureOutlined class="item icon" />
          <a-checkable-tag class="item model" v-model:checked="session.stream">
            <RedditOutlined />深度思考
          </a-checkable-tag>
          <a-button class="btn right" size="middle" @click="sendMessage">发送</a-button>
          <span class="tips right send-type-tip" @click="toggleSendType" style="cursor: pointer;">{{ sendType ===
            'ctrlEnter' ? 'Ctrl+Enter发送' : 'Enter发送' }}</span>
        </div>
      </div>
    </a-card>

    <a-drawer title="会话设置" v-model:visible="drawerSession.visible" width="400px" placement="right"
      class="drawer-session">

      <a-form :model="drawerSession.form" :rules="drawerSession.rules" ref="sessionFormRef" :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }">
        <a-form-item label="会话标题" name="title">
          <a-input v-model:value="drawerSession.form.title" placeholder="请输入会话标题" />
        </a-form-item>
        <a-form-item label="角色定义" name="roles">
          <a-textarea v-model:value="drawerSession.form.roles" :rows="15" placeholder="请输入角色定义" />
        </a-form-item>
        <a-form-item label="显示顺序" name="ordered">
          <a-input-number v-model:value="drawerSession.form.ordered" placeholder="请输入显示顺序" />
        </a-form-item>
        <a-form-item label="备注" name="descs">
          <a-textarea v-model:value="drawerSession.form.descs" :rows="4" placeholder="请输入备注" />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-button class="btn right" size="middle" @click="drawerSession.save">保存</a-button>
        <a-button class="btn right" size="middle" @click="drawerSession.visible = false">取消</a-button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { axios, useDialog, useSession } from 'unione-base-vue'
import { nextTick, onMounted, ref } from 'vue'
import MessageContent from './widget/message-content.vue'

defineOptions({
  name: 'UnioneAiChat'
})

const user = useSession()
const dialog = useDialog()

const models = ref<Array<any>>([])

const message = ref<any>({
  content: '',
  think: {
    thiking: false,
    thikStart: null,
    thikTotal: 0
  }
})

// 发送消息的方式：ctrlEnter 或 enter
const sendType = ref<'ctrlEnter' | 'enter'>('enter')
const session = ref<any>({
  stream: true,
  model: '',
  messages: [],
  timeline: {}
})
const messageListRef = ref<HTMLDivElement | null>(null)
// 会话标题编辑相关状态
const isEditingTitle = ref(false)
const editingTitle = ref('')
const originalTitle = ref('')
const titleInputRef = ref<InstanceType<typeof import('ant-design-vue/es/input')['default']> | null>(null)
const sessions = ref<any>({
  page: 0,
  pageSize: 50,
  total: 0,
  nomore: false,
  data: []
})
const sessionFormRef = ref()
const drawerSession = ref<any>({
  visible: false,
  form: {},
  rules: {
    title: [{ required: true, message: '请输入会话标题' }],
    ordered: [{ required: true, message: '请输入显示顺序' }],
  },
  tosetting: () => {
    drawerSession.value.form = { ...session.value }
    drawerSession.value.visible = true
  },
  save: async () => {
    const data = await sessionFormRef.value?.validate()
    axios.admin({
      url: '/api/ai/session/update',
      method: 'post',
      data: drawerSession.value.form
    }).then(() => {
      drawerSession.value.visible = false
      Object.keys(data).forEach((key) => {
        session.value[key] = data[key]
      })
    })
  }
})

/**
 * 加载会话列表
 */
function loadSessionList() {
  if (sessions.value.nomore) {
    return
  }
  if (!sessions.value.page) {
    sessions.value.page = 0
  }
  if (!sessions.value.pageSize) {
    sessions.value.pageSize = 50
  }
  sessions.value.page++
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
      if (res.body.length < sessions.value.pageSize) {
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
  if (typeof session.value.stream != 'boolean') {
    session.value.stream = true
  }
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
            session.value.favorite = session.value.favorite == 1 ? 0 : 1
          }
        })
    }
  })
}

/**
 * 加载会话消息
 */
function loadMessages() {
  if (!session.value || session.value.nomore) {
    return
  }
  if (!session.value.page) {
    session.value.page = 0
  }
  if (!session.value.pageSize) {
    session.value.pageSize = 10
  }
  session.value.page++
  if (!session.value.messages) {
    session.value.messages = []
  }
  axios
    .admin({
      url: '/api/ai/message/list',
      method: 'post',
      data: {
        page: session.value.page,
        pageSize: session.value.pageSize,
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
        if (res.body.length < session.value.pageSize) {
          session.value.nomore = true
        }
        timelineProcess(res.body)
        // 加载消息完成后滚动到底部
        scrollToBottom()
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

function thinkStart() {
  message.value.think.thiking = true
  message.value.think.thikTotal = 0
  message.value.think.thikStart = dayjs()
  if (message.value.think.thikTask) {
    clearInterval(message.value.think.thikTask)
  }
  message.value.think.thikTask = setInterval(() => {
    message.value.think.thikTotal++
  }, 1000)
}

function thinkEnd() {
  message.value.think.thiking = false
  message.value.think.thikTotal = dayjs().diff(message.value.think.thikStart, 'seconds')
  if (message.value.think.thikTask) {
    clearInterval(message.value.think.thikTask)
  }
}

/**
 * 切换发送消息的方式
 */
function toggleSendType() {
  sendType.value = sendType.value === 'ctrlEnter' ? 'enter' : 'ctrlEnter'
}

/**
 * 根据发送方式动态绑定键盘事件处理器
 */
const sendKeyHandler = (event: KeyboardEvent) => {
  if (sendType.value === 'ctrlEnter' && event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    sendMessage()
  } else if (sendType.value === 'enter' && event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
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
    id: session.value.id + '-user-' + Date.now(),
    modelId: session.value.model,
    content: message.value.content,
    roleName: 'user'
  })
  scrollToBottom()

  const content = message.value.content
  message.value.content = ''

  if (session.value.stream) {
    // 流式消息
    sendStreamMessage(content)
    return
  }

  // 同步消息
  message.value.think = {
    thiking: false,
    thikTotal: 0,
    thikStart: null,
    thikTask: null,
    id: session.value.id + '-' + Date.now(),
    modelId: session.value.model,
    content: '',
    roleName: 'assistant'
  }
  session.value.messages.push(message.value.think)
  thinkStart()
  axios
    .admin({
      url: '/api/ai/message/send',
      method: 'post',
      data: {
        sessionId: session.value.id,
        modelId: session.value.model,
        category: 'text',
        content
      }
    })
    .then((res: any) => {
      console.log('发送结果', res)
      if (res.success) {
        // 显示消息
        message.value.think.content = res.body.content
        // 发送消息成功后滚动到底部
        scrollToBottom()
      }
    }).finally(() => {
      thinkEnd()
    })

}

/**
 * 开始编辑会话标题
 */
function startEditingTitle() {
  if (!session.value || !session.value.id) return

  // 保存原始标题以便取消编辑时恢复
  originalTitle.value = session.value.title || ''
  editingTitle.value = originalTitle.value
  isEditingTitle.value = true

  // 确保输入框渲染后自动聚焦
  nextTick(() => {
    if (titleInputRef.value) {
      // 使用类型断言来解决TypeScript类型问题
      (titleInputRef.value as any).focus()
      // 或者直接通过DOM元素进行操作
      setTimeout(() => {
        const inputElement = titleInputRef.value?.$el.querySelector('input')
        if (inputElement) {
          inputElement.focus()
          inputElement.select()
        }
      }, 50)
    }
  })
}

/**
 * 处理标题输入框失去焦点事件
 */
function handleTitleBlur() {
  if (!isEditingTitle.value) return

  // 检查标题是否有变化
  if (editingTitle.value.trim() !== originalTitle.value.trim() && editingTitle.value.trim()) {
    // 有变化且不为空，调用API修改标题
    renameSessionTitle(editingTitle.value.trim())
  } else {
    // 没有变化或为空，直接取消编辑
    isEditingTitle.value = false
  }
}

/**
 * 取消编辑会话标题
 */
function cancelEditTitle() {
  isEditingTitle.value = false
  editingTitle.value = originalTitle.value
}

/**
 * 调用API重命名会话标题
 */
function renameSessionTitle(newTitle: string) {
  if (!session.value || !session.value.id) return

  axios
    .admin({
      url: '/api/ai/session/rename',
      method: 'post',
      data: {
        id: session.value.id,
        title: newTitle
      }
    })
    .then((res: any) => {
      if (res.success) {
        // 更新本地会话标题
        session.value.title = newTitle
        isEditingTitle.value = false
      } else {
        dialog.error(res.message || '重命名会话失败')
        cancelEditTitle()
      }
    })
    .catch((error: any) => {
      console.error('重命名会话错误:', error)
      dialog.error('重命名会话失败，请稍后重试')
      cancelEditTitle()
    })
}

/**
 * 发送流式消息
 * @param content 
 */
async function sendStreamMessage(content: string) {
  if (!content) {
    return
  }
  message.value.think = {
    thiking: false,
    thikTotal: 0,
    thikStart: null,
    thikTask: null,
    id: session.value.id + '-' + Date.now(),
    modelId: session.value.model,
    content: '',
    roleName: 'assistant'
  }
  session.value.messages.push(message.value.think)
  thinkStart()

  axios.admin.stream({
    url: '/api/ai/message/send/stream',
    method: 'post',
    data: {
      sessionId: session.value.id,
      modelId: session.value.model,
      category: 'text',
      content
    },
    onStart: () => {
      console.log('stream start')
    },
    onChunk: (chunk: string) => {
      // console.log('Received chunk:', chunk)
      if (!chunk || chunk.trim() === '' || chunk == 'data:') {
        return
      }
      const response = chunk.split('data:').join(',').trim()
      try {
        const dataList = JSON.parse('[' + (response.startsWith(',') ? response.substring(1) : response) + ']')
        dataList.forEach((data: any) => {
          if (data.body.content) {
            message.value.think.content += data.body.content
          }
        })
        scrollToBottom()
      } catch (e) {
        console.error('解析流式消息错误，response：' + response + '，error：', e)
      }
    },
    onDone: () => {
      thinkEnd()
    },
    onError: (error: string) => {
      console.error('流式消息错误:', error)
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

/**
 * 滚动消息列表到底部
 * 使用nextTick确保DOM更新后再执行滚动
 */
function scrollToBottom() {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
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

    .chat-title {
      cursor: pointer;
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

        .send-type-tip {
          cursor: pointer;
        }
      }
    }
  }

}

.drawer-session {
  .btn {
    margin-right: 5px;
  }

  .right {
    float: right;
  }

  .ant-form-item {
    margin-bottom: 6px;

    :deep(.ant-form-item-explain-error) {
      right: 5px;
      margin-top: -27px;
      position: absolute;
    }
  }
}
</style>