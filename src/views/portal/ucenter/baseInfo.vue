<template>
  <div class="base-view">
    <div class="view-left">
      <a-form :label-col="{ style: { width: '100px' } }">
        <a-form-item label="用户帐号">
          {{ profile.username }}
        </a-form-item>
        <a-form-item label="用户昵称" v-bind="validateInfos.aliasName">
          <a-input v-model:value="profile.aliasName" />
        </a-form-item>
        <a-form-item label="用户姓名" v-bind="validateInfos.realName">
          <a-input v-model:value="profile.realName" />
        </a-form-item>
        <a-form-item label="用户性别" v-bind="validateInfos.sex">
          <unione-radio-box
            :convert="{ types: 'dict', dictName: 'SEX' }"
            v-model:value="profile.sex"
          ></unione-radio-box>
        </a-form-item>
        <a-form-item label="用户生日" v-bind="validateInfos.birthday">
          <a-date-picker
            v-model:value="profile.birthday"
            format="YYYY-MM-DD"
            valueFormat="YYYY-MM-DD"
            placeholder=""
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="邮箱" v-bind="validateInfos.email">
          <a-input v-model:value="profile.email" />
        </a-form-item>
        <a-form-item label="QQ" v-bind="validateInfos.qq">
          <a-input v-model:value="profile.qq" />
        </a-form-item>
        <a-form-item label="个人介绍">
          <a-textarea v-model:value="profile.descs" :rows="4" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSubmit" style="float: right" :loading="loading"
            >提交</a-button
          >
        </a-form-item>
      </a-form>
    </div>
    <div class="view-right">
      <unione-avatar :avatar="profile.avatar" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import { Form } from 'ant-design-vue'
import { axios, useDialog } from 'unione-base-vue'

const dialog = useDialog()
const rulesRef = reactive({
  sex: [{ required: true, message: '请选择性别' }],
  realName: [{ required: true, message: '请输入真实姓名' }],
  aliasName: [{ required: true, message: '请输入昵称' }]
})
const profile = ref<any>({ sex: 1 })
const { validateInfos, validate } = Form.useForm(profile, rulesRef)

function loadProfile() {
  axios
    .admin({
      method: 'POST',
      url: '/api/ucenter/profile/load'
    })
    .then((res: any) => {
      if (res.success) {
        profile.value = res.body
      } else {
        dialog.error({ content: res.message })
      }
    })
}

const loading = ref(false)
const handleSubmit = () => {
  validate().then((res) => {
    loading.value = true
    const data = { ...profile.value }
    axios
      .admin({
        method: 'POST',
        url: '/api/ucenter/profile/save',
        data
      })
      .then((res: any) => {
        loading.value = false
        if (res.success) {
          dialog.success({ content: '更新成功' })
        } else {
          dialog.error({ content: res.message })
        }
      })
      .finally(() => {
        loading.value = false
      })
  })
}

onMounted(() => {
  loadProfile()
})
</script>

<style lang="less" scoped>
.base-view {
  display: flex;
  padding: 12px;

  .view-left {
    width: 400px;
    height: 100%;

    :deep(.ant-form-item) {
      margin-bottom: 5px;
      .ant-form-item-explain-error {
        right: 5px;
        margin-top: -27px;
        position: absolute;
      }
    }
  }
  .view-right {
    display: flex;
    flex: 1 1;
    flex-direction: column;
    align-items: center;
    max-width: 450px;
    padding: 20px;

    .avatar-title {
      height: 22px;
      margin-bottom: 8px;
      line-height: 22px;
    }
    .avatar {
      width: 144px;
      height: 144px;
      margin-bottom: 12px;
      overflow: hidden;
      img {
        width: 100%;
      }
    }
    .button-view {
      width: 144px;
      text-align: center;
    }
  }
}
</style>
