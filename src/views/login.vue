<template>
  <div class="unione-login">
    <div class="login-form">
      <h1 class="title">系统登录</h1>
      <a-form :model="formData" :rules="formRules" autocomplete="off" ref="loginForm">
        <a-form-item label="用户帐号" name="username">
          <a-input v-model:value="formData.username" />
        </a-form-item>

        <a-form-item label="用户密码" name="password">
          <a-input-password v-model:value="formData.password" />
        </a-form-item>

        <a-form-item>
          <a-form-item name="remember" no-style>
            <a-checkbox v-model:checked="formData.remember">记住我</a-checkbox>
          </a-form-item>
          <a class="forgot-pwd" href="#">忘记密码</a>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" class="btn-login" @click="toLogin">提交</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Rule } from 'ant-design-vue/es/form'
import axios from '@/utils/axios'

const loginForm = ref()
const formData = ref<any>({})
const formRules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户帐号', trigger: 'change' }],
  password: [{ required: true, message: '请输入用户密码', trigger: 'change' }]
}

// 登录表单提交方法
const toLogin = () => {
  loginForm.value.validate().then((data: any) => {
    console.log('form data', data)

    // 密码加密
  })
}
</script>

<style scoped lang="less">
.unione-login {
  width: 100vw;
  height: 100vh;

  .login-form {
    position: absolute;
    top: 20%;
    left: 30%;
    width: 40%;
    height: 350px;
    border: 1px solid #eeeeee;
    padding: 20px 40px;

    .title {
      text-align: center;
    }

    .forgot-pwd {
      float: right;
    }

    .btn-login {
      width: 100%;
    }
  }
}
</style>
