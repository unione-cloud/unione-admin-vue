<template>
  <div>
    <a-list item-layout="horizontal" :data-source="dataSource">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a>{{ item.title }}</a>
            </template>
            <template #description>
              <span>
                <span class="security-list-description">{{ item.description }}</span>
                <span v-if="item.value">:</span>
                <span class="security-list-value">{{ item.value }}</span>
              </span>
            </template>
          </a-list-item-meta>
          <template #actions v-if="item.actions">
            <a @click="item.actions.callback">{{ item.actions.title }}</a>
          </template>
        </a-list-item>
      </template>
    </a-list>

    <!-- 修改密码弹窗 -->
    <a-modal
      title="修改密码"
      :visible="modalResetPwd.visible"
      :confirmLoading="modalResetPwd.loading"
      @ok="modalResetPwd.ok"
      @cancel="modalResetPwd.cancel"
    >
      <a-form
        class="modal-form"
        ref="resetPwdForm"
        :model="modalResetPwd.data"
        :rules="modalResetPwd.rules"
      >
        <a-form-item
          label="原密码"
          name="oldPwd"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-input-password
            placeholder="请输入原密码"
            :maxLength="16"
            v-model:value="modalResetPwd.data.oldPwd"
          />
        </a-form-item>
        <a-form-item
          label="新密码"
          name="newPwd"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-input-password
            placeholder="请输入新密码"
            :maxLength="16"
            v-model:value="modalResetPwd.data.newPwd"
          />
        </a-form-item>
        <a-form-item
          label="重复密码"
          name="newPwd2"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-input-password
            placeholder="请输入重复密码"
            v-model:value="modalResetPwd.data.newPwd2"
            :maxLength="16"
          />
        </a-form-item>
        <a-form-item
          v-if="config?.security?.pwds?.resetPwdSmsEnable"
          label="短信验证码"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-input-search
            v-decorator="['captcha', { rules: [{ required: true, message: '请输入短信验证码!' }] }]"
            placeholder="请输入短信验证码"
            :maxLength="12"
            @search="getTelCaptcha('system-resetpwd')"
          >
            <template v-slot:enterButton>
              <a-button :disabled="smsCodeBtn.loading">{{
                smsCodeBtn.time ? smsCodeBtn.time + ' s' : '获取验证码'
              }}</a-button>
            </template>
          </a-input-search>
        </a-form-item>
        <div class="tips">{{ config.security?.pwds?.secretStrategy?.tip }}</div>
      </a-form>
    </a-modal>
    <!-- 修改绑定手机弹窗 -->
    <a-modal
      title="修改绑定手机"
      :visible="modalTel.visible"
      :confirmLoading="modalTel.loading"
      @ok="modalTel.ok"
      @cancel="modalTel.cancel"
    >
      <a-form :model="modalTel.data" :rules="modalTel.rules" ref="telForm" class="modal-form">
        <a-form-item
          label="原绑定手机号"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
          v-if="profile.tel"
        >
          <span>{{ profile.tel }}</span>
        </a-form-item>
        <a-form-item
          label="新绑定手机号"
          name="newTel"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-input
            placeholder="请输入新手机号"
            :maxLength="11"
            v-model:value="modalTel.data.newTel"
          />
        </a-form-item>
        <a-form-item
          label="短信验证码"
          name="smsCode"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-row>
            <a-col class="gutter-row" :span="16">
              <a-input
                type="text"
                placeholder="验证码"
                :maxLength="12"
                v-model:value="modalTel.data.smsCode"
              />
            </a-col>
            <a-col class="gutter-row" :span="7" :offset="1">
              <a-button
                :disabled="smsCodeBtn.loading"
                @click.stop.prevent="getTelCaptcha('system-bindtel')"
                >{{ smsCodeBtn.time ? smsCodeBtn.time + ' s' : '获取验证码' }}</a-button
              >
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 密保问题 -->
    <a-modal
      title="修改密保问题"
      :visible="modalSQuestion.visible"
      :confirmLoading="modalSQuestion.loading"
      @ok="modalSQuestion.ok"
      @cancel="modalSQuestion.cancel"
    >
      <a-form
        :model="modalSQuestion.data"
        :rules="modalSQuestion.rules"
        ref="sQuestionForm"
        class="modal-form"
      >
        <a-form-item
          label="密保问题"
          name="securityQuestion"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-textarea
            placeholder="请输入密保问题"
            :maxLength="100"
            v-model:value="modalSQuestion.data.securityQuestion"
          />
        </a-form-item>
        <a-form-item
          label="短信验证码"
          name="smsCode"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-row>
            <a-col class="gutter-row" :span="16">
              <a-input
                type="text"
                placeholder="验证码"
                :maxLength="12"
                v-model:value="modalSQuestion.data.smsCode"
              />
            </a-col>
            <a-col class="gutter-row" :span="7" :offset="1">
              <a-button
                :disabled="smsCodeBtn.loading"
                @click.stop.prevent="getTelCaptcha('system-security-question')"
                >{{ smsCodeBtn.time ? smsCodeBtn.time + ' s' : '获取验证码' }}</a-button
              >
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- MFA设备 -->
    <a-modal
      title="修改密保问题"
      :visible="modalMFA.visible"
      :confirmLoading="modalMFA.loading"
      @ok="modalMFA.ok"
      @cancel="modalMFA.cancel"
    >
      <a-form :model="modalMFA.data" :rules="modalMFA.rules" ref="mfaForm" class="modal-form">
        <a-form-item
          label="MFA设备编码"
          name="sucurityMfa"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-textarea
            placeholder="请输入MFA设备编码"
            :maxLength="100"
            v-model:value="modalMFA.data.sucurityMfa"
          />
        </a-form-item>
        <a-form-item
          label="短信验证码"
          name="smsCode"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-row>
            <a-col class="gutter-row" :span="16">
              <a-input
                type="text"
                placeholder="验证码"
                :maxLength="12"
                v-model:value="modalMFA.data.smsCode"
              />
            </a-col>
            <a-col class="gutter-row" :span="7" :offset="1">
              <a-button
                :disabled="smsCodeBtn.loading"
                @click.stop.prevent="getTelCaptcha('system-security-mfa')"
                >{{ smsCodeBtn.time ? smsCodeBtn.time + ' s' : '获取验证码' }}</a-button
              >
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { axios, useDialog, utils } from 'unione-base-vue'
import config from '@/config/settings'

const dataSource = ref([
  {
    title: '账户密码',
    description: '系统登录安全密码',
    value: '',
    actions: {
      title: '修改',
      callback: () => {
        modalResetPwd.value.visible = true
      }
    }
  },
  {
    title: '密保手机',
    description: '系统安全手机号码',
    value: '',
    actions: {
      title: '绑定',
      callback: () => {
        modalTel.value.visible = true
      }
    }
  },
  {
    title: '密保问题',
    description: '设置密保问题，密保问题可有效保护账户安全',
    value: '',
    actions: {
      title: '设置',
      callback: () => {
        modalSQuestion.value.visible = true
        modalSQuestion.value.data.securityQuestion = profile.value.securityQuestion
      }
    }
  },
  {
    title: 'MFA 设备',
    description: '未绑定 MFA 设备，绑定后，可以进行二次确认',
    value: '',
    actions: {
      title: '绑定',
      callback: () => {
        modalMFA.value.visible = true
        modalMFA.value.data.sucurityMfa = profile.value.sucurityMfa
      }
    }
  }
])
const dialog = useDialog()
const profile = ref<any>({})

const smsCodeBtn = ref({
  time: 0,
  loading: false
})

const resetPwdForm = ref()
const modalResetPwd = ref({
  visible: false,
  loading: false,
  data: { oldPwd: '', newPwd: '', newPwd2: '' },
  rules: {
    oldPwd: [{ required: true, message: '请输入原密码！' }],
    newPwd: [{ required: true, validator: passwordValidator }],
    newPwd2: [{ required: true, validator: passwordValidator }]
  },
  ok: () => {
    resetPwdForm.value.validate().then((value: any) => {
      if (value.newPwd != value.newPwd2) {
        dialog.error({ content: '两次输入密码不一致！' })
        return
      }
      // 提交
      modalResetPwd.value.loading = true
      const data = new FormData()
      data.append('oldPwd', value.oldPwd)
      data.append('newPwd', value.newPwd)
      data.append('smsCode', value.smsCode)
      axios
        .admin({
          method: 'POST',
          url: '/api/ucenter/reset/pwd',
          data: data
        })
        .then((res: any) => {
          if (res.success) {
            dialog.success({ content: '修改成功！' })
            modalResetPwd.value.visible = false
          } else {
            dialog.error({ content: res.message })
          }
        })
        .finally(() => {
          modalResetPwd.value.loading = false
        })
    })
  },
  cancel: () => {
    modalResetPwd.value.visible = false
  }
})
async function passwordValidator(rule: any, value: string) {
  if (!value) {
    if (rule.field == 'newPwd') {
      return Promise.reject('请输入新密码')
    }
    return Promise.reject('请再次输入密码')
  }
  if (config.security?.pwds?.secretStrategy?.reg) {
    const reg = new RegExp(config.security.pwds.secretStrategy.reg)
    if (!reg.test(value)) {
      return Promise.reject('密码不符合要求')
    }
  }
  if (
    modalResetPwd.value.data.newPwd &&
    modalResetPwd.value.data.newPwd2 &&
    modalResetPwd.value.data.newPwd != modalResetPwd.value.data.newPwd2
  ) {
    return Promise.reject('两次输入密码不一致')
  }
  return Promise.resolve()
}

const telForm = ref()
const modalTel = ref({
  visible: false,
  loading: false,
  data: { oldTel: '', newTel: '', smsCode: '' },
  rules: {
    newTel: [{ required: true, message: '请输入新手机号！' }],
    smsCode: [{ required: true, message: '请输入短信验证码！' }]
  },
  ok: () => {
    telForm.value.validate().then((value: any) => {
      modalTel.value.loading = true
      const data = new FormData()
      data.append('oldTel', profile.value.tel)
      data.append('newTel', value.newTel)
      data.append('smsCode', value.smsCode)
      axios
        .admin({
          method: 'POST',
          url: '/api/ucenter/profile/tel',
          data: data
        })
        .then((res: any) => {
          if (res.success) {
            dialog.success({ content: '修改成功！' })
            dataSource.value[1].value = value.newTel
            profile.value.tel = value.newTel
            modalTel.value.visible = false
          } else {
            dialog.error({ content: res.message })
          }
        })
        .finally(() => {
          modalTel.value.loading = false
        })
    })
  },
  cancel: () => {
    modalTel.value.visible = false
  }
})

// 安全问题
const sQuestionForm = ref()
const modalSQuestion = ref({
  visible: false,
  loading: false,
  data: { securityQuestion: '', smsCode: '' },
  rules: {
    securityQuestion: [{ required: true, message: '请输入保密问题' }],
    smsCode: [{ required: true, message: '请输入短信验证码！' }]
  },
  ok: () => {
    sQuestionForm.value.validate().then((value: any) => {
      modalSQuestion.value.loading = true
      const data = new FormData()
      data.append('securityQuestion', value.securityQuestion)
      data.append('smsCode', value.smsCode)
      axios
        .admin({
          method: 'POST',
          url: '/api/ucenter/profile/sq',
          data: data
        })
        .then((res: any) => {
          if (res.success) {
            dialog.success({ content: '修改成功！' })
            modalSQuestion.value.visible = false
          } else {
            dialog.error({ content: res.message })
          }
        })
        .finally(() => {
          modalSQuestion.value.loading = false
        })
    })
  },
  cancel: () => {
    modalSQuestion.value.visible = false
  }
})

// MFA设备
const mfaForm = ref()
const modalMFA = ref({
  visible: false,
  loading: false,
  data: { sucurityMfa: '', smsCode: '' },
  rules: {
    sucurityMfa: [{ required: true, message: '请输如MFA设备编码' }],
    smsCode: [{ required: true, message: '请输入短信验证码！' }]
  },
  ok: () => {
    mfaForm.value.validate().then((value: any) => {
      modalMFA.value.loading = true
      const data = new FormData()
      data.append('sucurityMfa', value.sucurityMfa)
      data.append('smsCode', value.smsCode)
      axios
        .admin({
          method: 'POST',
          url: '/api/ucenter/profile/smfa',
          data: data
        })
        .then((res: any) => {
          if (res.success) {
            dialog.success({ content: '修改成功！' })
            modalMFA.value.visible = false
          } else {
            dialog.error({ content: res.message })
          }
        })
        .finally(() => {
          modalMFA.value.loading = false
        })
    })
  },
  cancel: () => {
    modalMFA.value.visible = false
  }
})

function loadProfile() {
  axios
    .admin({
      method: 'POST',
      url: '/api/ucenter/profile/load'
    })
    .then((res: any) => {
      if (res.success) {
        profile.value = res.body
        if (res.body.tel) {
          dataSource.value[1].value = res.body.tel
          dataSource.value[1].actions.title = '修改'
        }
        if (res.body.securityQuestion) {
          dataSource.value[2].actions.title = '修改'
        }
        if (res.body.sucurityMfa) {
          dataSource.value[3].actions.title = '修改'
        }
      } else {
        dialog.error({ content: res.message })
      }
    })
}

const timer = ref()
function getTelCaptcha(type: string) {
  smsCodeBtn.value.time = 60
  smsCodeBtn.value.loading = true
  if (timer.value) {
    clearInterval(timer.value)
  }

  // TODO
  // 调用远程接口

  timer.value = setInterval(() => {
    smsCodeBtn.value.time = smsCodeBtn.value.time - 1
    if (smsCodeBtn.value.time <= 0) {
      smsCodeBtn.value.time = 0
      smsCodeBtn.value.loading = false
      clearInterval(timer.value)
      timer.value = null
    }
  }, 1000)
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped lang="less">
.modal-form {
  .tips {
    text-align: center;
    color: #515151;
  }
}
</style>
