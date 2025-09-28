<template>
  <div class="unione-login" :style="{ 'background-image': 'url(' + ImageBg + ')' }">
    <div class="login-box">
      <div class="box-head">
        <div class="app-info">
          <div class="app-title">{{ view.login.appTitle }}</div>
          <div class="sub-title">{{ view.login.subTitle }}</div>
        </div>
        <div class="app-qr"><img :src="ImageQr" /></div>
      </div>
      <div class="box-body">
        <div class="ads-box">
          <img class="ad-pic" :src="ImageAd" />
        </div>
        <div class="login-form">
          <a-form :model="formData" :rules="formRules" autocomplete="off" ref="loginForm" :label-col="{ span: 7 }">
            <a-tabs v-model:activeKey="loginType">
              <a-tab-pane key="username" tab="帐号登录">
                <a-form-item label="用户帐号" name="username">
                  <a-input v-model:value="formData.username" />
                </a-form-item>

                <a-form-item label="用户密码" name="password">
                  <a-input-password v-model:value="formData.password" />
                </a-form-item>
              </a-tab-pane>
              <a-tab-pane key="userphone" tab="手机登录" force-render>
                <a-form-item label="手机号码" name="userphone">
                  <a-input v-model:value="formData.userphone" />
                </a-form-item>

                <a-form-item label="验证码" name="captcha">
                  <a-input v-model:value="formData.captcha" />
                </a-form-item>
              </a-tab-pane>
            </a-tabs>

            <a-form-item>
              <a-form-item name="remember" no-style>
                <a-checkbox v-model:checked="formData.remember">记住我</a-checkbox>
              </a-form-item>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import type { Rule } from 'ant-design-vue/es/form'
import { utils } from 'unione-base-vue'
import { useAdminStore } from '@/stores/admin'
import { useSession } from 'unione-base-vue'

import ImageBg from '@/assets/login/bg.jpg'
import ImageAd from '@/assets/login/ad1.png'
import ImageQr from '@/assets/login/qr.png'

import { Modal } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'

defineOptions({
  name: 'UinoneLogin'
})

const router = useRouter()
const route = useRoute()

// Admin对象
const admin = useAdminStore()
const view: any = computed(() => {
  return admin.view
})

const session = useSession()

const loginType = ref('username')
watch(loginType, () => {
  if (loginType.value == 'username') {
    formRules.value = {
      username: [{ required: true, message: '请输入用户帐号', trigger: 'change' }],
      password: [{ required: true, message: '请输入用户密码', trigger: 'change' }]
    }
  } else {
    formRules.value = {
      userphone: [{ required: true, message: '请输入用户密码', trigger: 'change' }],
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
    } else {
      data.smscode = utils.sm2Encrypt(data.smscode)
    }

    submiting.value = true
    // 提交登录请求
    session
      .doLogin(data)
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
            content: err.message
          })
        } else {
          Modal.error({
            title: '登录失败',
            centered: true,
            content: '系统异常'
          })
        }
      })
      .finally(() => {
        submiting.value = false
      })
  })
}

onMounted(() => {
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
    width: 70%;
    height: 55%;
    min-height: 450px;
    background-color: #ffffff;
    border-radius: 10px;

    .box-head {
      height: 50px;
      display: flex;
      padding: 10px;

      .app-info {
        width: 150%;

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
        width: 100%;

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
          font-size: 10px;
          transform: scale(0.7);
          transform-origin: top left;
          margin-top: -15px;

          .link {
            margin: auto 3px;
            color: #4096ff;
            cursor: pointer;
          }
        }
      }
    }
  }
}
</style>
