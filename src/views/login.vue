<template>
  <div class="unione-login" :style="{ 'background-image': 'url(' + ImageBg + ')' }">
    <div class="login-box">
      <div class="box-body">
        <div class="ads-box">
          <img class="ad-pic" :src="ImageAd" />
        </div>
        <div class="login-form" v-if="formType === 'login'">
          <div class="box-head">
            <div class="app-info">
              <div class="app-title">{{ view.login.appTitle }}</div>
              <div class="sub-title">{{ view.login.subTitle }}</div>
            </div>
            <div class="app-qr"><img :src="ImageQr" /></div>
          </div>
          <a-form :model="formData" :rules="formRules" autocomplete="off" ref="loginForm" :label-col="{ span: 7 }">
            <a-tabs v-model:activeKey="loginType">
              <a-tab-pane key="username" tab="帐号登录">
                <a-form-item label="用户帐号" name="username">
                  <a-input v-model:value="formData.username" />
                </a-form-item>

                <a-form-item label="用户密码" name="password">
                  <a-input-password v-model:value="formData.password" />
                </a-form-item>
                <a-form-item label="验证码" name="captcha" required>
                  <div class="captcha-box">
                    <img class="img" :src="imageCaptcha.src" @click="imageCaptcha.refresh()" />
                    <a-input v-model:value="formData.captcha" @keyup.enter="toLogin" />
                  </div>
                </a-form-item>
              </a-tab-pane>
              <a-tab-pane key="userphone" tab="手机登录" force-render>
                <a-form-item label="手机号码" name="userphone" class="userphone">
                  <a-input v-model:value="formData.userphone">
                    <template #addonAfter>
                      <a-button type="link" class="btn-get-captcha" :loading="smsCaptcha.loading"
                        @click="smsCaptcha.send('login', formData.userphone)">{{
                          smsCaptcha.loading ?
                            ('获取验证码(' + smsCaptcha.countdown + '秒)') : '获取验证码' }}</a-button>
                    </template>
                  </a-input>
                </a-form-item>

                <a-form-item label="验证码" name="captcha">
                  <a-input v-model:value="formData.captcha" @keyup.enter="toLogin" />
                </a-form-item>
              </a-tab-pane>
            </a-tabs>

            <a-form-item>
              <a-form-item name="remember" no-style>
                <a-checkbox v-model:checked="formData.remember">记住我</a-checkbox>
              </a-form-item>
              <a class="forgot-pwd" href="#" style="margin-left: 5px;" @click="formType = 'register'">注册帐号</a>
              <a class="forgot-pwd" href="#">忘记密码</a>
            </a-form-item>

            <a-form-item>
              <a-button type="primary" class="btn-login" @click="toLogin" :loading="submiting">登录</a-button>
            </a-form-item>
            <a-form-item class="service-opts">
              <a-checkbox>我已阅读并同意<span class="link">服务协议</span>和<span class="link">隐私政策</span></a-checkbox>
            </a-form-item>
          </a-form>
        </div>
        <div class="reg-form" v-if="formType === 'register'">
          <div class="title">
            新用户注册
          </div>
          <a-form :model="regData" :rules="regRules" autocomplete="off" ref="regForm" :label-col="{ span: 5 }">
            <a-form-item label="单位名称" name="company">
              <a-input v-model:value="regData.company" />
            </a-form-item>
            <!-- <a-form-item label="登录帐号" name="username">
              <a-input v-model:value="regData.username" />
            </a-form-item>
            <a-form-item label="用户密码" name="pwdText">
              <a-input-password v-model:value="regData.pwdText" />
            </a-form-item>
            <a-form-item label="确认密码" name="confirmPwdText">
              <a-input-password v-model:value="regData.confirmPwdText" />
            </a-form-item> -->
            <a-form-item label="真实姓名" name="realName">
              <a-input v-model:value="regData.realName" />
            </a-form-item>
            <a-form-item label="联系电话" name="tel" class="reg-tel">
              <a-input v-model:value="regData.tel">
                <template #addonAfter>
                  <a-button type="link" class="btn-get-captcha" :loading="smsCaptcha.loading"
                    @click="smsCaptcha.send('register', regData.tel)">{{ smsCaptcha.loading ?
                      ('获取验证码(' + smsCaptcha.countdown + '秒)') : '获取验证码' }}</a-button>
                </template>
              </a-input>
            </a-form-item>
            <a-form-item label="验证码" name="captcha">
              <a-input v-model:value="regData.captcha" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" class="btn-reg" @click="toRegister" :loading="submiting">注册</a-button>
            </a-form-item>
            <a-form-item class="service-opts">
              <a-checkbox>我已阅读并同意<span class="link">服务协议</span>和<span class="link">隐私政策</span></a-checkbox>
              <a-button type="link" class="btn-login" @click="formType = 'login'">返回登录</a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import type { Rule } from 'ant-design-vue/es/form'
import { axios, useDialog, utils } from 'unione-base-vue'
import { useAdminStore } from '@/stores/admin'
import { useSession } from 'unione-base-vue'

import ImageBg from '@/assets/login/bg.jpg'
import ImageAd from '@/assets/login/ad1.png'
import ImageQr from '@/assets/login/qr.png'

import { Modal } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '@/config'

defineOptions({
  name: 'UinoneLogin'
})

const router = useRouter()
const route = useRoute()
const config: any = useConfigStore().config
const dialog = useDialog()

// Admin对象
const admin = useAdminStore()
const view: any = computed(() => {
  return admin.view
})

const session = useSession()
const formType = ref<'login' | 'forget' | 'register'>('login')

// 登录表单
const loginType = ref('username')
watch(loginType, () => {
  if (loginType.value == 'username') {
    formRules.value = {
      username: [{ required: true, message: '请输入用户帐号', trigger: 'change' }],
      password: [{ required: true, message: '请输入用户密码', trigger: 'change' }],
      captcha: [{ required: true, message: '请输入验证码', trigger: 'change' }]
    }
  } else {
    formRules.value = {
      userphone: [{ required: true, message: '请输入用户密码', trigger: 'change' }, { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号', trigger: 'change' }],
      captcha: [{ required: true, message: '请输入用户密码', trigger: 'change' }]
    }
  }
})

const loginForm = ref()
const formData = ref<any>({})
const formRules = ref<Record<string, Rule[]>>({
  username: [{ required: true, message: '请输入用户帐号', trigger: 'change' }],
  password: [{ required: true, message: '请输入用户密码', trigger: 'change' }]
})

// 登录表单提交方法
const submiting = ref(false)
const toLogin = () => {
  loginForm.value.validate().then((data: any) => {
    // 密码加密
    if (loginType.value == 'username') {
      data.password = utils.sm2Encrypt(data.password)
    }

    submiting.value = true
    // 提交登录请求
    session
      .doLogin(data, loginType.value == 'username' ? 'uname' : 'sms')
      .then((res: any) => {
        if (route.query.backurl) {
          router.push(route.query.backurl as string)
        } else {
          router.push('/home')
        }
      })
      .catch((err: any) => {
        console.error('登录失败', err)
        if (err && err.message) {
          Modal.error({
            title: '登录失败',
            centered: true,
            content: err.message,
            onOk: () => {
              imageCaptcha.value.refresh()
            }
          })
        } else {
          Modal.error({
            title: '登录失败',
            centered: true,
            content: '系统异常',
            onOk: () => {
              imageCaptcha.value.refresh()
            }
          })
        }
      })
      .finally(() => {
        submiting.value = false
      })
  })
}

// 注册表单
const regForm = ref()
const regData = ref<any>({})
const regRules = ref<Record<string, Rule[]>>({
  company: [{ required: true, message: '请输入单位名称', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户帐号', trigger: 'blur' }],
  pwdText: [{ required: true, message: '请输入用户密码', trigger: 'blur' }],
  confirmPwdText: [{ required: true, message: '请输入确认密码', trigger: 'blur' }, {
    validator: (rule: any, value: any, callback: any) => {
      if (value !== regData.value.pwdText) {
        callback('两次输入密码不一致')
      } else {
        callback()
      }
    }, trigger: 'blur'
  }],
  realName: [{ required: true, message: '请输入用户姓名', trigger: 'blur' }],
  tel: [{ required: true, message: '请输入手机号码', trigger: 'blur' }, { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }]
})
function toRegister() {
  regForm.value.validate().then((data: any) => {
    // 密码加密
    if (data.pwdText) {
      data.pwdText = utils.sm2Encrypt(data.pwdText)
    }
    delete data.confirmPwdText
    submiting.value = true

    // 提交注册请求
    axios.admin({
      url: '/api/security/register',
      method: 'post',
      data
    }).then((res: any) => {
      if (res.success) {
        dialog.success('注册成功')
        formType.value = 'login'
      } else {
        dialog.error(res.message || '注册失败')
      }
    }).finally(() => {
      submiting.value = false
    })
  })
}

const imageCaptcha = ref({
  src: '',
  refresh: () => {
    imageCaptcha.value.src = `${config.axios.admin}/api/security/captcha/image?&t=${Date.now()}`
  }
})
const smsCaptcha = ref({
  loading: false,
  countdown: 0,
  send: (scene: string, tel: string) => {
    if (!tel) {
      dialog.warning('请输入手机号码')
      return
    }
    if (smsCaptcha.value.loading) {
      return
    }
    smsCaptcha.value.loading = true
    smsCaptcha.value.countdown = 60
    const timer = setInterval(() => {
      smsCaptcha.value.countdown--
      if (smsCaptcha.value.countdown <= 0) {
        clearInterval(timer)
        smsCaptcha.value.loading = false
      }
    }, 1000)

    axios.admin({
      url: '/api/security/captcha/sms',
      method: 'post',
      data: {
        scene,
        tel
      }
    }).then((res: any) => {
      if (res.success) {
        dialog.success('短信验证码发送成功')
      } else {
        dialog.error(res.message || '短信验证码发送失败')
        smsCaptcha.value.loading = false
      }
    })
  }
})

onMounted(() => {
  imageCaptcha.value.refresh()
  if (session.isLogin()) {
    if (route.query.backurl) {
      router.push(route.query.backurl as string)
    } else {
      router.push('/home')
    }
  }
})

</script>

<style scoped lang="less">
.unione-login {
  width: 100vw;
  height: 100vh;
  background-repeat: repeat-x;
  background-size: auto 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-box {
    width: 60%;
    height: 55%;
    min-height: 450px;
    background-color: #ffffff;
    border-radius: 10px;

    .box-head {
      height: 70px;
      display: flex;
      padding: 10px;
      margin-bottom: 40px;

      .app-info {
        width: calc(100% - 70px);

        .app-title {
          color: #134ce4;
          font-size: 30px;
          font-weight: bold;
          text-align: center;
          user-select: none;
        }

        .sub-title {
          font-size: 14px;
          text-align: center;
        }
      }

      .app-qr {
        width: 70px;

        img {
          width: 60px;
          height: 50px;
          float: right;
          cursor: pointer;
        }
      }
    }

    .box-body {
      display: flex;
      height: calc(100% - 50px);

      .ads-box {
        width: 55%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        .ad-pic {
          width: 90%;
        }
      }

      .login-form {
        width: 45%;
        min-width: 465px;
        height: 100%;
        padding: 20px 40px;
        margin-top: 20px;

        .title {
          text-align: center;
        }

        .forgot-pwd {
          float: right;
        }

        .btn-login {
          width: 100%;
        }

        .service-opts {
          margin-top: -15px;
        }

        .btn-get-captcha {
          padding-top: 0;
          height: 25px;
        }

        :deep(.ant-form-item) {
          margin-bottom: 15px;

          .ant-form-item-explain-error {
            right: 5px;
            margin-top: -27px;
            position: absolute;
          }
        }

        .captcha-box {
          display: flex;
          flex-direction: row;
          align-items: center;

          .img {
            width: 100px;
            height: 35px;
            cursor: pointer;
            margin-right: 10px;
          }
        }

        .userphone {
          :deep(.ant-form-item-explain-error) {
            margin-right: 140px;
            z-index: 10;
          }
        }

      }

      .service-opts {
        font-size: 10px;
        transform: scale(0.8);
        transform-origin: top left;

        .link {
          margin: auto 3px;
          color: #4096ff;
          cursor: pointer;
        }
      }

      .reg-form {
        width: 45%;
        min-width: 465px;
        height: 100%;
        padding: 20px 40px;
        margin-top: 20px;

        .title {
          color: #134ce4;
          font-size: 30px;
          font-weight: bold;
          text-align: center;
          user-select: none;
          margin-bottom: 20px;
        }

        :deep(.ant-form-item) {
          margin-bottom: 15px;

          .ant-form-item-explain-error {
            right: 5px;
            margin-top: -27px;
            position: absolute;
          }
        }

        .reg-tel {
          :deep(.ant-form-item-explain-error) {
            margin-right: 140px;
            z-index: 10;
          }

          .btn-get-captcha {
            padding-top: 0;
            height: 25px;
          }
        }

        .btn-reg {
          width: 100%;
          margin-top: 10px;
        }

      }
    }
  }
}
</style>
